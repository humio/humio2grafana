'use strict';

System.register(['angular', 'lodash'], function (_export, _context) {
  "use strict";

  var angular, _, _createClass, HumioConfigCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
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

      _export('HumioConfigCtrl', HumioConfigCtrl = function () {
        // current: any;

        /** @ngInject */
        function HumioConfigCtrl($scope, $injector, $q, $http) {
          _classCallCheck(this, HumioConfigCtrl);

          this.$http = $http;
          this.dataspaces = [];
          this.current = this.current || {};
          this.current.jsonData = this.current.jsonData || {};
          this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";
          this._getHumioDataspaces();
        }

        _createClass(HumioConfigCtrl, [{
          key: 'onTokenChage',
          value: function onTokenChage(ev) {
            this._getHumioDataspaces();
          }
        }, {
          key: '_getHumioDataspaces',
          value: function _getHumioDataspaces() {
            var _this = this;

            if (this.current.url && this.current.jsonData.humioToken) {
              var requestOpts = {
                method: 'GET',
                url: this.current.url + '/api/v1/dataspaces',
                headers: {
                  'Authorization': 'Bearer ' + this.current.jsonData.humioToken
                }
              };
              this.$http(requestOpts).then(function (r) {
                _this.dataspaces = r.data.map(function (ds) {
                  return {
                    value: ds.id,
                    name: ds.id
                  };
                });
              });
            }
          }
        }]);

        return HumioConfigCtrl;
      }());

      _export('HumioConfigCtrl', HumioConfigCtrl);

      HumioConfigCtrl.templateUrl = 'partials/config.html';
    }
  };
});
//# sourceMappingURL=config_ctrl.js.map
