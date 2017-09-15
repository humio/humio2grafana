import _ from "lodash";

// // query states
// const INIT_STATE = 0;
// const RUNNING_STATE = 1;

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv, $location) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url.replace(/\/$/, '');
    this.name = instanceSettings.name;

    this.$q = $q;
    this.$location = $location;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;

    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + instanceSettings.jsonData.humioToken
    };

    // NOTE: session query storage
    this.queryParams = {};
  }

  query(options) {
    // console.log(options);
    // let tgts = _.clone(options.targets);
    // console.log(tgts);

    let panelId = options.panelId;
    let humioQuery = options.targets[0].humioQuery;
    let humioDataspace = options.targets[0].humioDataspace;
    var query = this.buildQueryParameters(options); // TODO: not sure if we need this

    query.targets = query.targets.filter(t => !t.hide); // TODO: not sure if we need this

    if (!humioDataspace || !humioQuery) {
      return this.$q.when({
        data: []
      });
    }

    var dt = {
      "queryString": humioQuery,
      "timeZoneOffsetMinutes": -(new Date()).getTimezoneOffset(),
      "showQueryEventDistribution": false,
      "start": "24h"
    }

    // NOTE: modifying query
    this.queryParams[panelId] = this.queryParams[panelId] ? this.queryParams[panelId] : {
      queryId: null,
      isLive: false,
      humioQuery: humioQuery
    };

    // console.log('humio query 1 ->');
    // console.log(this.queryParams[panelId]);
    // console.log(humioQuery);


    return this.$q((resolve, reject) => {
      let handleRes = (r) => {
        if (r.data.done) {
          console.log('query done');

          this.queryParams[panelId].queryId = this.queryParams[panelId].isLive ? this.queryParams[panelId].queryId : null;

          let dt = _.clone(r.data);
          let timeseriesField = "_bucket";
          let seriesField = dt.metaData.extraData.series;
          let series = {};
          let valueField = _.filter(dt.metaData.fields, (f) => {
            return f.name != timeseriesField && f.name != seriesField;
          })[0].name;

          // NOTE: aggregating result
          if (seriesField) {
            // multiple series
            for (let i = 0; i < r.data.events.length; i++) {
              let ev = r.data.events[i];
              if (!series[ev[seriesField]]) {
                series[ev[seriesField]] = [
                  [ev[valueField], parseInt(ev._bucket)]
                ];
              } else {
                series[ev[seriesField]].push([ev[valueField], parseInt(ev._bucket)]);
              }
            }

            r.data = _.keys(series).map((s) => {
              return {
                target: s,
                datapoints: series[s]
              }
            })
          } else {
            // single series
            r.data = [{
              target: valueField,
              datapoints: dt.events.map((ev) => {
                return [ev[valueField], parseInt(ev._bucket)];
              })
            }];
          }

          resolve(r);
        } else {
          console.log('query running...');
          console.log("" + (r.data.metaData.workDone / r.data.metaData.totalWork * 100).toFixed(2) + "%");
          setTimeout(() => {
            this._composeQuery(panelId, dt, options, humioDataspace, humioQuery).then(handleRes);
          }, 1000);
        }
      }

      this._composeQuery(panelId, dt, options, humioDataspace, humioQuery).then(handleRes);
    });
  }


  _composeQuery(panelId, queryDt, grafanaQueryOpts, humioDataspace, humioQuery) {

    let refresh = this.$location.search().refresh || null;
    let range = grafanaQueryOpts.range;

    let checkToDateNow = (toDateCheck) => {
      if (typeof toDateCheck == "string") {
        return toDateCheck.match(/^(now[^-]|now$)/) != null;
      } else {
        return false;
      }
    };

    queryDt.isLive = ((refresh != null) && (checkToDateNow(range.raw.to)));

    console.log(this.queryParams[panelId].queryId);

    if ((queryDt.isLive != this.queryParams[panelId].isLive) ||
      (this.queryParams[panelId].humioQuery != humioQuery)) {
      if (this.queryParams[panelId].queryId) {
        this._stopExecution(this.queryParams[panelId].queryId, humioDataspace);
      }
      this.queryParams[panelId].queryId = null;
      this.queryParams[panelId].humioQuery = humioQuery;
    };

    // NOTE: setting date range
    if (queryDt.isLive) {
      queryDt.start = this._parseDateFrom(range.raw.from);
      return this._composeLiveQuery(panelId, queryDt, humioDataspace);
    } else {
      if (this.queryParams[panelId].queryId != null) {
        return this._pollQuery(this.queryParams[panelId].queryId, humioDataspace);
      } else {
        queryDt.start = range.from._d.getTime();
        queryDt.end = range.to._d.getTime();
        return this._initQuery(queryDt, humioDataspace).then((r) => {
          this.queryParams[panelId].queryId = r.data.id;
          this.queryParams[panelId].isLive = false;
          return this._pollQuery(r.data.id, humioDataspace);
        });
      };
    };
  }

  _composeLiveQuery(panelId, queryDt, humioDataspace) {
    if (this.queryParams[panelId].queryId == null) {
      return this._initQuery(queryDt, humioDataspace).then((r) => {
        this.queryParams[panelId].queryId = r.data.id;
        this.queryParams[panelId].isLive = true;
        return this._pollQuery(r.data.id, humioDataspace);
      });
    } else {
      return this._pollQuery(this.queryParams[panelId].queryId, humioDataspace);
    }
  }

  _initQuery(queryDt, humioDataspace) {
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs',
      data: queryDt,
      method: 'POST',
    });
  }

  _pollQuery(queryId, humioDataspace) {
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs/' + queryId,
      method: 'GET',
    });
  }

  _stopExecution(queryId, humioDataspace) {
    console.log('stopping execution');
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs/' + queryId,
      method: 'DELETE',
    });
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return {
          status: "success",
          message: "Data source is working",
          title: "Success"
        };
      }
    });
  }

  annotationQuery(options) {
    console.log('annotationQuery -> ');
    var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    var annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.doRequest({
      url: this.url + '/annotations',
      method: 'POST',
      data: annotationQuery
    }).then(result => {
      return result.data;
    });
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    return this.backendSrv.datasourceRequest(options);
  }

  // TODO: check if needed
  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });

    options.targets = targets;

    return options;
  }


  _parseDateFrom(date) {
    switch (date) {
      case 'now-2d':
        {
          return '2d';
        }
        break;
      case 'now-7d':
        {
          return '7d';
        }
        break;
      case 'now-30d':
        {
          return '30d';
        }
        break;
      case 'now-90d':
        {
          return '90d';
        }
        break;
      case 'now-6M':
        {
          return '180d';
        }
        break;
      case 'now-1y':
        {
          return '1y';
        }
        break;
      case 'now-2y':
        {
          return '2y';
        }
        break;
      case 'now-5y':
        {
          return '5y';
        }
        break;
      case 'now-1d/d':
        {
          return '1d';
        }
        break;
      case 'now-2d/d':
        {
          return '2d';
        }
        break;
      case 'now-7d/d':
        {
          return '7d';
        }
        break;
      case 'now-1w/w':
        {
          return '7d';
        }
        break;
      case 'now-1M/M':
        {
          return '1m';
        }
        break;
      case 'now-1y/y':
        {
          return '1y';
        }
        break;
      case 'now/d':
        {
          return '1d';
        }
        break;
      case 'now/w':
        {
          return '7d';
        }
        break;
      case 'now/M':
        {
          return '1m';
        }
        break;
      case 'now/y':
        {
          return '1y';
        }
        break;
      case 'now-5m':
        {
          return '5m';
        }
        break;
      case 'now-15m':
        {
          return '15m';
        }
        break;
      case 'now-30m':
        {
          return '30m';
        }
        break;
      case 'now-1h':
        {
          return '1h';
        }
        break;
      case 'now-3h':
        {
          return '3h';
        }
        break;
      case 'now-6h':
        {
          return '6h';
        }
        break;
      case 'now-12h':
        {
          return '12h';
        }
        break;
      case 'now-24h':
        {
          return '24h';
        }
        break;
      default:
        {
          return '24h';
        }
        break;
    }
  }
}
