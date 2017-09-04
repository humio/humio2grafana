'use strict';

System.register(['angular', 'lodash'], function (_export, _context) {
  "use strict";

  var angular, _, HumioConfigCtrl;

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
      _export('HumioConfigCtrl', HumioConfigCtrl =
      // current: any;

      /** @ngInject */
      function HumioConfigCtrl($scope, $injector, $q, $http) {
        var _this = this;

        _classCallCheck(this, HumioConfigCtrl);

        this.dataspaces = [];
        this.current = this.current || {};
        this.current.jsonData = this.current.jsonData || {};
        this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";

        if (this.current.url && this.current.jsonData.humioToken) {
          var requestOpts = {
            method: 'GET',
            url: this.current.url + '/api/v1/dataspaces',
            headers: {
              'Authorization': 'Bearer ' + this.current.jsonData.humioToken
            }
          };
          $http(requestOpts).then(function (r) {
            _this.dataspaces = r.data.map(function (ds) {
              return {
                value: ds.id,
                name: ds.id
              };
            });
          });
        }
      });

      _export('HumioConfigCtrl', HumioConfigCtrl);

      HumioConfigCtrl.templateUrl = 'partials/config.html';
    }
  };
});
//# sourceMappingURL=config_ctrl.js.map
