import _ from 'lodash';
import { HumioHelper } from './helper';
import DsPanel from './DsPanel';
import DsPanelStorage from './DsPanelStorage';

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv, $location, $rootScope) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url ? instanceSettings.url.replace(/\/$/, '') : '';
    this.name = instanceSettings.name;

    this.$q = $q;
    this.$location = $location;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.$rootScope = $rootScope;

    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' +
        (instanceSettings.jsonData ? (instanceSettings.jsonData.humioToken || 'developer') :
          'developer')
    };

    // NOTE: session query storage
    // this.queryParams = {};
    this.dsPanelStorage = new DsPanelStorage(this.backendSrv);
  }

  query(options) {

    // NOTE: if no tragests just return an empty result
    if (options.targets.length == 0) {
      return this.$q.resolve({
        data: []
      });
    }

    let panelId = options.panelId;
    let humioQueryStr = options.targets[0].humioQuery;
    let humioDataspace = options.targets[0].humioDataspace;
    // var query = options; // TODO: not needed really
    // this.timeRange = options.range;

    // NOTE: if no humio dataspace or no query - consider configuration invalid
    if (!humioDataspace || !humioQueryStr) {
      return this.$q.resolve({
        data: []
      });
    }

    // var dt = {
    //   'queryString': humioQueryStr,
    //   'timeZoneOffsetMinutes': -(new Date()).getTimezoneOffset(),
    //   'showQueryEventDistribution': false,
    //   'start': '24h'
    // }


    // // NOTE: modifying query
    // this.queryParams[panelId] = this.queryParams[panelId] ? this.queryParams[panelId] : {
    //   queryId: null,
    //   failCounter: 0,
    //   // humioQueryStr: JSON.stringify(dt),
    //   isLive: false,
    //   humioQuery: dt
    // };
    var dsPanel = this.dsPanelStorage.getOrGreatePanel(panelId, humioQueryStr);

    return this.$q((resolve, reject) => {

      let handleErr = (err) => {
        console.log('fallback ->')
        console.log(err);
        // TODO: add a counter, if several times get a error - consider query to be invalid, or distinguish between error types
        if (err.status == 401) {
          // NOTE: query not found - trying to recreate
          dsPanel.setQueryId(null);
          dsPanel.incFailCounter();
          if (dsPanel.failCounter <= 3) {
            this._composeQuery(panelId, dsPanel.getQueryData(), options, humioDataspace).then(handleRes, handleErr);
          } else {
            dsPanel.resetFailCounter()
          }
        } else {
          if (err.status = 400) {
            this.$rootScope.appEvent('alert-error', ['Query error', err.data]);
          } else {
            this.$rootScope.appEvent('alert-error', [err.status, err.data]);
          }
          resolve({
            data: []
          });
        }
      }

      let handleRes = (r) => {
        if (r.data.done) {
          console.log('query done');

          // this._updateQueryParams(panelId, {
          //   failCounter: 0,
          //   queryId: this.queryParams[panelId].isLive ? this.queryParams[panelId].queryId : null
          // });
          dsPanel.resetFailCounter();
          // TODO: move this check to DsPanel;
          dsPanel.setQueryId(dsPanel.queryData.isLive ? dsPanel.queryId : null);

          resolve(this._composeResult(options, r, () => {
            let dt = _.clone(r.data);
            let timeseriesField = '_bucket';
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
              // NOTE: single series
              if (dt.events.length == 1) {
                // NOTE: consider to be gauge
                r.data = dt.events.map((ev) => {
                  return {
                    target: valueField,
                    datapoints: [[parseFloat(ev[valueField]), valueField]]
                  }
                });
              } else {
                // NOTE: consider to be a barchart
                r.data = dt.events.map((ev) => {
                  return {
                    target: ev[valueField],
                    datapoints: [[parseFloat(ev._count), '_' + ev[valueField]]]
                  }
                });
              }
            }
            return r;
          }));
        } else {
          console.log('query running...');
          console.log('' + (r.data.metaData.workDone / r.data.metaData.totalWork * 100).toFixed(2) + '%');
          setTimeout(() => {
            this._composeQuery(panelId, dsPanel.getQueryData(), options, humioDataspace).then(handleRes, handleErr);
          }, 1000);
        }
      }

      this._composeQuery(panelId, dsPanel.getQueryData(), options, humioDataspace).then(handleRes, handleErr);
    });
  }

  _composeResult(queryOptions, r, resFx) {
    let currentTarget = queryOptions.targets[0];
    if ((currentTarget.hasOwnProperty('type') &&
        ((currentTarget.type == 'timeserie') || (currentTarget.type == 'table')) &&
        (r.data.hasOwnProperty('metaData') && r.data.metaData.hasOwnProperty('extraData') &&
          r.data.metaData.extraData.timechart == 'true'))) {
      // NOTE: timechart
      return resFx();
    } else if (!currentTarget.hasOwnProperty('type') &&
      (r.data.hasOwnProperty('metaData') && r.data.metaData.isAggregate == true)) {
      // NOTE: gauge
      return resFx();
    } else {
      // NOTE: unsuported query for this type of panel
      this.$rootScope.appEvent('alert-error', ['Unsupported visualisation', 'can\'t visulize the query result on this panel.']);
      return {
        data: []
      }
    }
  }

  _stopUpdatedQuery(panelId, queryDt, humioDataspace) {
    // TODO: move this to DsPanel completely;
    let dsPanel = this.dsPanelStorage.panels.get(panelId);
    if (dsPanel) {
      // console.log('1->');
      // console.log(JSON.stringify(dsPanel.getQueryData()));
      // console.log(JSON.stringify(queryDt));
      if (JSON.stringify(dsPanel.getQueryData()) !== JSON.stringify(queryDt)) {
        console.log("STOP!");
        if (dsPanel.queryId) {
          this._stopExecution(dsPanel.queryId, humioDataspace);
        }
        dsPanel.setQueryId(null);
        dsPanel.updateQueryParams(queryDt);
        // this._updateQueryParams(panelId, {
        //   queryId: null,
        //   humioQuery: queryDt
        // });
      };
    }
  }

  _composeQuery(panelId, queryDt, grafanaQueryOpts, humioDataspace) {
    let dsPanel = this.dsPanelStorage.panels.get(panelId);
    if (dsPanel) {
      let refresh = this.$location ? (this.$location.search().refresh || null) : null;
      let range = grafanaQueryOpts.range;

      queryDt.isLive = ((refresh != null) && (HumioHelper.checkToDateNow(range.raw.to)));

      // NOTE: setting date range
      if (queryDt.isLive) {
        queryDt.start = HumioHelper.parseDateFrom(range.raw.from);

        // TODO: shoudl be moved to _updateQueryParams
        this._stopUpdatedQuery(panelId, queryDt, humioDataspace);

        dsPanel.updateQueryParams(queryDt);
        return this._composeLiveQuery(panelId, queryDt, humioDataspace);
      } else {

        // TODO: shoudl be moved to _updateQueryParams
        this._stopUpdatedQuery(panelId, queryDt, humioDataspace);

        if (dsPanel.queryId != null) {
          return this._pollQuery(dsPanel.queryId, humioDataspace);
        } else {
          queryDt.start = range.from._d.getTime();
          queryDt.end = range.to._d.getTime();

          // TODO: shoudl be moved to _updateQueryParams
          this._stopUpdatedQuery(panelId, queryDt, humioDataspace);

          dsPanel.updateQueryParams(queryDt);
          return this._initQuery(dsPanel.getQueryData(), humioDataspace).then((r) => {
            dsPanel.setQueryId(r.data.id);
            dsPanel.updateQueryParams({isLive: false});
            return this._pollQuery(r.data.id, humioDataspace);
          });
        };
      };
    };
  }

  _composeLiveQuery(panelId, queryDt, humioDataspace) {
    let dsPanel = this.dsPanelStorage.panels.get(panelId);
    if (dsPanel.queryId == null) {
      return this._initQuery(dsPanel.getQueryData(), humioDataspace).then((r) => {
        dsPanel.setQueryId(r.data.id);
        dsPanel.updateQueryParams({isLive: true});
        return this._pollQuery(r.data.id, humioDataspace);
      });
    } else {
      return this._pollQuery(dsPanel.queryId, humioDataspace);
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
          status: 'success',
          message: 'Data source is working',
          title: 'Success'
        };
      }
    });
  }

  // // TODO: handle annotationQuery
  // annotationQuery(options) {
  //   console.log('annotationQuery -> ');
  //   var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
  //   var annotationQuery = {
  //     range: options.range,
  //     annotation: {
  //       name: options.annotation.name,
  //       datasource: options.annotation.datasource,
  //       enable: options.annotation.enable,
  //       iconColor: options.annotation.iconColor,
  //       query: query
  //     },
  //     rangeRaw: options.rangeRaw
  //   };
  //
  //   return this.doRequest({
  //     url: this.url + '/annotations',
  //     method: 'POST',
  //     data: annotationQuery
  //   }).then(result => {
  //     return result.data;
  //   });
  // }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    return this.backendSrv.datasourceRequest(options);
  }

}
