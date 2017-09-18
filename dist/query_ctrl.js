'use strict';

System.register(['app/plugins/sdk', './css/query-editor.css!', 'lodash'], function (_export, _context) {
  "use strict";

  var QueryCtrl, _, _createClass, GenericDatasourceQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_cssQueryEditorCss) {}, function (_lodash) {
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

      _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl = function (_QueryCtrl) {
        _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

        function GenericDatasourceQueryCtrl($scope, $injector, $http, $q, datasourceSrv) {
          _classCallCheck(this, GenericDatasourceQueryCtrl);

          var _this = _possibleConstructorReturn(this, (GenericDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(GenericDatasourceQueryCtrl)).call(this, $scope, $injector));

          _this.$http = $http;
          _this.$scope = $scope;
          _this.$q = $q;

          _this.target.humioQuery = _this.target.humioQuery || 'timechart()';
          _this.target.humioDataspace = _this.target.humioDataspace || undefined;

          _this.dataspaces = [];
          _this._getHumioDataspaces().then(function (r) {
            _this.dataspaces = r;
          });

          var linkSettings = {
            'widgetType': 'time-chart',
            'query': 'timechart()',
            'live': false,
            'start': '24h', // TODO: take time frame from grafana
            'legend': 'y',
            'lx': '',
            'ly': '',
            'mn': '',
            'mx': '',
            'op': '0.2',
            'p': 'a',
            'pl': '',
            'plY': '',
            's': '',
            'sc': 'lin',
            'stp': 'y'
          };

          _this.humioLink = _this.datasource.url + '/' + _this.target.humioDataspace + '/search?' + _this._serializeQueryOpts(linkSettings);

          return _this;
        }

        _createClass(GenericDatasourceQueryCtrl, [{
          key: 'onChangeInternal',
          value: function onChangeInternal() {
            this.panelCtrl.refresh(); // Asks the panel to refresh data.
          }
        }, {
          key: 'showHumioLink',
          value: function showHumioLink() {
            return this.humioLink != undefined;
          }
        }, {
          key: '_serializeQueryOpts',
          value: function _serializeQueryOpts(obj) {
            var str = [];
            for (var p in obj) {
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }return str.join("&");
          }
        }, {
          key: '_getHumioDataspaces',
          value: function _getHumioDataspaces() {
            if (this.datasource.url) {

              var requestOpts = {
                method: 'GET',
                url: this.datasource.url + '/api/v1/dataspaces',
                headers: this.datasource.headers
              };

              return this.datasource.backendSrv.datasourceRequest(requestOpts).then(function (r) {
                var res = r.data.map(function (ds) {
                  return {
                    value: ds.id,
                    name: ds.id
                  };
                });
                return _.sortBy(res, ['name']);
              });
            } else {
              return this.$q.when([]);
            }
          }
        }]);

        return GenericDatasourceQueryCtrl;
      }(QueryCtrl));

      _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl);

      GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
