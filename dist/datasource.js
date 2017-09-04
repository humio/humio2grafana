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
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.token = instanceSettings.jsonData.humioToken;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
          this.withCredentials = instanceSettings.withCredentials;
          this.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + instanceSettings.jsonData.humioToken
          };
          if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
            this.headers['Authorization'] = instanceSettings.basicAuth;
          }
        }

        _createClass(GenericDatasource, [{
          key: 'query',
          value: function query(options) {
            var _this = this;

            var query = this.buildQueryParameters(options);

            console.log(this.url);
            console.log('1 ->');
            console.log('6 ->');
            console.log(this.token);
            // console.log(options);
            // console.log(query);

            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets.length <= 0) {
              return this.q.when({
                data: []
              });
            }

            var dt = {
              "queryString": "timechart()",
              "isLive": false,
              "timeZoneOffsetMinutes": 180,
              "showQueryEventDistribution": true,
              "start": "5m"
            };

            var self = this;

            return this.doRequest({
              url: this.url + '/api/v1/dataspaces/humio/queryjobs',
              data: dt,
              method: 'POST'
            }).then(function (r) {

              return self.doRequest({
                url: _this.url + '/api/v1/dataspaces/humio/queryjobs/' + r.data.id,
                method: 'GET'
              }).then(function (r) {

                var convertEvs = function convertEvs(evs) {
                  return evs.map(function (ev) {
                    return [ev._count, ev._bucket];
                  });
                };

                r.data = [{
                  target: "_count",
                  datapoints: convertEvs(r.data.events)
                }];

                return r;
              });
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
            console.log("-> 11");
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
              console.log("8 ->");
              console.log(result.data);
              return result.data;
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(query) {
            console.log("-> 13");

            // TODO: for now handling only timechart queries
            return [{
              text: "_count",
              value: "_count"
            }];
          }
        }, {
          key: 'mapToTextValue',
          value: function mapToTextValue(result) {
            console.log("-> 14");
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
            console.log("-> 15");
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;

            return this.backendSrv.datasourceRequest(options);
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this2 = this;

            console.log("-> 16");
            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                target: _this2.templateSrv.replace(target.target, options.scopedVars, 'regex'),
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'timeserie'
              };
            });

            options.targets = targets;

            return options;
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
