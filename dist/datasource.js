'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
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
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv, $location) {
          _classCallCheck(this, GenericDatasource);

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

        _createClass(GenericDatasource, [{
          key: 'query',
          value: function query(options) {
            var _this = this;

            var humioQuery = options.targets[0].humioQuery;
            var query = this.buildQueryParameters(options);

            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets.length <= 0) {
              return this.$q.when({
                data: []
              });
            }

            var dt = {
              "queryString": humioQuery,
              "timeZoneOffsetMinutes": -new Date().getTimezoneOffset(),
              "showQueryEventDistribution": false,
              "start": "24h"
            };

            return this.$q(function (resolve, reject) {
              var handleRes = function handleRes(r) {
                if (r.data.done) {
                  console.log('query done');
                  _this.queryParams.queryId = _this.queryParams.isLive ? _this.queryParams.queryId : null;
                  r.data = [{
                    target: "_count",
                    datapoints: r.data.events.map(function (ev) {
                      return [ev._count, parseInt(ev._bucket)];
                    })
                  }];
                  resolve(r);
                } else {
                  console.log('query running...');
                  console.log("" + (r.data.metaData.workDone / r.data.metaData.totalWork * 100).toFixed(2) + "%");
                  setTimeout(function () {
                    _this._composeQuery(dt, options).then(handleRes);
                  }, 1000);
                }
              };
              _this._composeQuery(dt, options).then(handleRes);
            });
          }
        }, {
          key: '_composeQuery',
          value: function _composeQuery(queryDt, grafanaQueryOpts) {
            var _this2 = this;

            var refresh = this.$location.search().refresh || null;
            var range = grafanaQueryOpts.range;

            var checkToDateNow = function checkToDateNow(toDateCheck) {
              if (typeof toDateCheck == "string") {
                return toDateCheck.match(/^(now[^-]|now$)/) != null;
              } else {
                return false;
              }
            };

            queryDt.isLive = refresh != null && checkToDateNow(range.raw.to);
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
                return this._initQuery(queryDt).then(function (r) {
                  _this2.queryParams.queryId = r.data.id;
                  _this2.queryParams.isLive = false;
                  return _this2._pollQuery(r.data.id);
                });
              }
            }
          }
        }, {
          key: '_composeLiveQuery',
          value: function _composeLiveQuery(queryDt) {
            var _this3 = this;

            if (this.queryParams.queryId == null) {
              return this._initQuery(queryDt).then(function (r) {
                _this3.queryParams.queryId = r.data.id;
                _this3.queryParams.isLive = true;
                return _this3._pollQuery(r.data.id);
              });
            } else {
              return this._pollQuery(this.queryParams.queryId);
            }
          }
        }, {
          key: '_initQuery',
          value: function _initQuery(queryDt) {
            return this.doRequest({
              url: this.url + '/api/v1/dataspaces/' + this.humioDataspace + '/queryjobs',
              data: queryDt,
              method: 'POST'
            });
          }
        }, {
          key: '_pollQuery',
          value: function _pollQuery(queryId) {
            return this.doRequest({
              url: this.url + '/api/v1/dataspaces/' + this.humioDataspace + '/queryjobs/' + queryId,
              method: 'GET'
            });
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            console.log("-> 10");
            return this.doRequest({
              url: this.url + '/',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return {
                  status: "success",
                  message: "Data source is working",
                  title: "Success"
                };
              }
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
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
          key: 'metricFindQuery',
          value: function metricFindQuery(query) {
            // TODO: for now handling only timechart queries
            return [{
              text: "_count",
              value: "_count"
            }];
          }
        }, {
          key: 'mapToTextValue',
          value: function mapToTextValue(result) {
            return _.map(result.data, function (d, i) {
              if (d && d.text && d.value) {
                return {
                  text: d.text,
                  value: d.value
                };
              } else if (_.isObject(d)) {
                return {
                  text: d,
                  value: i
                };
              }
              return {
                text: d,
                value: d
              };
            });
          }
        }, {
          key: 'doRequest',
          value: function doRequest(options) {
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;

            return this.backendSrv.datasourceRequest(options);
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this4 = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                target: _this4.templateSrv.replace(target.target, options.scopedVars, 'regex'),
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'timeserie'
              };
            });

            options.targets = targets;

            return options;
          }
        }, {
          key: '_parseDateFrom',
          value: function _parseDateFrom(date) {
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
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
