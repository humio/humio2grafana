'use strict';

System.register(['lodash', './helper'], function (_export, _context) {
  "use strict";

  var _, HumioHelper, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_helper) {
      HumioHelper = _helper.HumioHelper;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('GenericDatasource', GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv, $location, $rootScope) {
          _classCallCheck(this, GenericDatasource);

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
            'Authorization': 'Bearer ' + (instanceSettings.jsonData ? instanceSettings.jsonData.humioToken || 'developer' : 'developer')
          };

          // TODO: not sure if this is right approach
          this.timeRange = undefined;

          // NOTE: session query storage
          this.queryParams = {};
        }

        _createClass(GenericDatasource, [{
          key: 'query',
          value: function query(options) {
            var _this = this;

            // NOTE: if no tragests just return an empty result
            if (options.targets.length == 0) {
              return this.$q.resolve({
                data: []
              });
            }

            var panelId = options.panelId;
            var humioQuery = options.targets[0].humioQuery;
            var humioDataspace = options.targets[0].humioDataspace;
            var query = options; // TODO: not needed really
            this.timeRange = options.range;

            // NOTE: if no humio dataspace or no query - consider configuration invalid
            if (!humioDataspace || !humioQuery) {
              return this.$q.resolve({
                data: []
              });
            }

            var dt = {
              'queryString': humioQuery,
              'timeZoneOffsetMinutes': -new Date().getTimezoneOffset(),
              'showQueryEventDistribution': false,
              'start': '24h'

              // NOTE: modifying query
            };this.queryParams[panelId] = this.queryParams[panelId] ? this.queryParams[panelId] : {
              queryId: null,
              failCounter: 0,
              isLive: false,
              humioQuery: humioQuery
            };

            return this.$q(function (resolve, reject) {

              var handleErr = function handleErr(err) {
                console.log('fallback ->');
                console.log(err);
                // TODO: add a counter, if several times get a error - consider query to be invalid, or distinguish between error types
                if (err.status == 401) {
                  // query not found - trying to recreate
                  _this.queryParams[panelId].queryId = null;
                  _this.queryParams[panelId].failCounter += 1;
                  if (_this.queryParams[panelId].failCounter <= 3) {
                    _this._composeQuery(panelId, dt, options, humioDataspace, humioQuery).then(handleRes, handleErr);
                  } else {
                    _this.queryParams[panelId].failCounter = 0;
                  }
                } else {
                  if (err.status = 400) {
                    _this.$rootScope.appEvent('alert-error', ['Query error', err.data]);
                  } else {
                    _this.$rootScope.appEvent('alert-error', [err.status, err.data]);
                  }
                  resolve({
                    data: []
                  });
                }
              };

              var handleRes = function handleRes(r) {
                if (r.data.done) {
                  console.log('query done');

                  _this.queryParams[panelId].failCounter = 0;
                  _this.queryParams[panelId].queryId = _this.queryParams[panelId].isLive ? _this.queryParams[panelId].queryId : null;

                  resolve(_this._composeResult(options, r, function () {
                    var dt = _.clone(r.data);
                    var timeseriesField = '_bucket';
                    var seriesField = dt.metaData.extraData.series;
                    var series = {};
                    var valueField = _.filter(dt.metaData.fields, function (f) {
                      return f.name != timeseriesField && f.name != seriesField;
                    })[0].name;

                    // NOTE: aggregating result
                    if (seriesField) {
                      // multiple series
                      for (var i = 0; i < r.data.events.length; i++) {
                        var ev = r.data.events[i];
                        if (!series[ev[seriesField]]) {
                          series[ev[seriesField]] = [[ev[valueField], parseInt(ev._bucket)]];
                        } else {
                          series[ev[seriesField]].push([ev[valueField], parseInt(ev._bucket)]);
                        }
                      }

                      r.data = _.keys(series).map(function (s) {
                        return {
                          target: s,
                          datapoints: series[s]
                        };
                      });
                    } else {
                      // single series
                      r.data = [{
                        target: valueField,
                        datapoints: dt.events.map(function (ev) {
                          return [ev[valueField], parseInt(ev._bucket)];
                        })
                      }];
                    }
                    return r;
                  }));
                } else {
                  console.log('query running...');
                  console.log('' + (r.data.metaData.workDone / r.data.metaData.totalWork * 100).toFixed(2) + '%');
                  setTimeout(function () {
                    _this._composeQuery(panelId, dt, options, humioDataspace, humioQuery).then(handleRes, handleErr);
                  }, 1000);
                }
              };

              _this._composeQuery(panelId, dt, options, humioDataspace, humioQuery).then(handleRes, handleErr);
            });
          }
        }, {
          key: '_composeResult',
          value: function _composeResult(queryOptions, r, resFx) {
            var currentTarget = queryOptions.targets[0];
            if (currentTarget.hasOwnProperty('type') && (currentTarget.type == 'timeserie' || currentTarget.type == 'table') && r.data.hasOwnProperty('metaData') && r.data.metaData.hasOwnProperty('extraData') && r.data.metaData.extraData.timechart == 'true') {
              // timechart
              return resFx();
            } else if (!currentTarget.hasOwnProperty('type') && r.data.hasOwnProperty('metaData') && r.data.metaData.isAggregate == true) {
              // gauge
              return resFx();
            } else {
              // unsuported query for this type of panel
              this.$rootScope.appEvent('alert-error', ['Unsupported visualisation', 'can\'t visulize the query result on this panel.']);
              return {
                data: []
              };
            }
          }
        }, {
          key: '_composeQuery',
          value: function _composeQuery(panelId, queryDt, grafanaQueryOpts, humioDataspace, humioQuery) {
            var _this2 = this;

            var refresh = this.$location ? this.$location.search().refresh || null : null;
            var range = grafanaQueryOpts.range;

            queryDt.isLive = refresh != null && HumioHelper.checkToDateNow(range.raw.to);

            if (queryDt.isLive != this.queryParams[panelId].isLive || this.queryParams[panelId].humioQuery != humioQuery) {
              if (this.queryParams[panelId].queryId) {
                this._stopExecution(this.queryParams[panelId].queryId, humioDataspace);
              }
              this.queryParams[panelId].queryId = null;
              this.queryParams[panelId].humioQuery = humioQuery;
            };

            // NOTE: setting date range
            if (queryDt.isLive) {
              queryDt.start = HumioHelper.parseDateFrom(range.raw.from);
              return this._composeLiveQuery(panelId, queryDt, humioDataspace);
            } else {
              if (this.queryParams[panelId].queryId != null) {
                return this._pollQuery(this.queryParams[panelId].queryId, humioDataspace);
              } else {
                queryDt.start = range.from._d.getTime();
                queryDt.end = range.to._d.getTime();
                return this._initQuery(queryDt, humioDataspace).then(function (r) {
                  _this2.queryParams[panelId].queryId = r.data.id;
                  _this2.queryParams[panelId].isLive = false;
                  return _this2._pollQuery(r.data.id, humioDataspace);
                });
              };
            };
          }
        }, {
          key: '_composeLiveQuery',
          value: function _composeLiveQuery(panelId, queryDt, humioDataspace) {
            var _this3 = this;

            if (this.queryParams[panelId].queryId == null) {
              return this._initQuery(queryDt, humioDataspace).then(function (r) {
                _this3.queryParams[panelId].queryId = r.data.id;
                _this3.queryParams[panelId].isLive = true;
                return _this3._pollQuery(r.data.id, humioDataspace);
              });
            } else {
              return this._pollQuery(this.queryParams[panelId].queryId, humioDataspace);
            }
          }
        }, {
          key: '_initQuery',
          value: function _initQuery(queryDt, humioDataspace) {
            return this.doRequest({
              url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs',
              data: queryDt,
              method: 'POST'
            });
          }
        }, {
          key: '_pollQuery',
          value: function _pollQuery(queryId, humioDataspace) {
            return this.doRequest({
              url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs/' + queryId,
              method: 'GET'
            });
          }
        }, {
          key: '_stopExecution',
          value: function _stopExecution(queryId, humioDataspace) {
            console.log('stopping execution');
            return this.doRequest({
              url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs/' + queryId,
              method: 'DELETE'
            });
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.doRequest({
              url: this.url + '/',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return {
                  status: 'success',
                  message: 'Data source is working',
                  title: 'Success'
                };
              }
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
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
            }).then(function (result) {
              return result.data;
            });
          }
        }, {
          key: 'doRequest',
          value: function doRequest(options) {
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;
            return this.backendSrv.datasourceRequest(options);
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
