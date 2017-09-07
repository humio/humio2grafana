import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv, $location) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.$q = $q;
    this.$location = $location;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;

    // NOTE: humio specific options
    this.token = instanceSettings.jsonData.humioToken;
    this.humioDataspace = instanceSettings.jsonData.humioDataspace;

    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + instanceSettings.jsonData.humioToken
    };

    // TODO: remove
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }

    // NOTE: session query storage
    this.queryParams = {
      queryId: null,
      isLive: false
    };

  }

  query(options) {

    let humioQuery = options.targets[0].humioQuery;
    var query = this.buildQueryParameters(options);

    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets.length <= 0) {
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

    return this.$q((resolve, reject) => {
      let handleRes = (r) => {
        if (r.data.done) {
          console.log('query done');
          this.queryParams.queryId = this.queryParams.isLive ? this.queryParams.queryId : null;

          let dt = _.clone(r.data);
          let timeseriesField = "_bucket";
          let seriesField = dt.metaData.extraData.series;
          let series = {};
          let valueField = _.filter(dt.metaData.fields, (f) => {
            return f.name != timeseriesField && f.name != seriesField;
          })[0].name;

          if (seriesField) {
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
            this._composeQuery(dt, options).then(handleRes);
          }, 1000);
        }
      }
      this._composeQuery(dt, options).then(handleRes);
    });
  }

  _composeQuery(queryDt, grafanaQueryOpts) {
    let refresh = this.$location.search().refresh || null;
    let range = grafanaQueryOpts.range;

    let checkToDateNow = (toDateCheck) => {
      if (typeof toDateCheck == "string") {
        return toDateCheck.match(/^(now[^-]|now$)/) != null;
      } else {
        return false;
      }
    }

    queryDt.isLive = ((refresh != null) && (checkToDateNow(range.raw.to)));
    if (queryDt.isLive != this.queryParams.isLive) {
      this.queryParams.queryId = null;
    }

    // NOTE: setting date range
    if (queryDt.isLive) {
      queryDt.start = this._parseDateFrom(range.raw.from);
      return this._composeLiveQuery(queryDt);
    } else {
      if (this.queryParams.queryId != null) {
        return this._pollQuery(this.queryParams.queryId);
      } else {
        queryDt.start = range.from._d.getTime();
        queryDt.end = range.to._d.getTime();
        return this._initQuery(queryDt).then((r) => {
          this.queryParams.queryId = r.data.id;
          this.queryParams.isLive = false;
          return this._pollQuery(r.data.id);
        });
      }
    }
  }

  _composeLiveQuery(queryDt) {
    if (this.queryParams.queryId == null) {
      return this._initQuery(queryDt).then((r) => {
        this.queryParams.queryId = r.data.id;
        this.queryParams.isLive = true;
        return this._pollQuery(r.data.id);
      });
    } else {
      return this._pollQuery(this.queryParams.queryId);
    }
  }

  _initQuery(queryDt) {
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + this.humioDataspace + '/queryjobs',
      data: queryDt,
      method: 'POST',
    })
  }

  _pollQuery(queryId) {
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + this.humioDataspace + '/queryjobs/' + queryId,
      method: 'GET',
    })
  }

  testDatasource() {
    console.log("-> 10");
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

  // metricFindQuery(query) {
  //   console.log("the query ->");
  //   console.log(query);
  //   // TODO: for now handling only timechart queries
  //   return [{
  //     text: "_count",
  //     value: "_count",
  //   }];
  // }

  // mapToTextValue(result) {
  //   return _.map(result.data, (d, i) => {
  //     if (d && d.text && d.value) {
  //       return {
  //         text: d.text,
  //         value: d.value
  //       };
  //     } else if (_.isObject(d)) {
  //       return {
  //         text: d,
  //         value: i
  //       };
  //     }
  //     return {
  //       text: d,
  //       value: d
  //     };
  //   });
  // }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

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
