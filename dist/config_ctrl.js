"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var HumioConfigCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [],
    execute: function () {
      _export("HumioConfigCtrl", HumioConfigCtrl =

      /** @ngInject */
      function HumioConfigCtrl($scope, $injector, $q, $http) {
        _classCallCheck(this, HumioConfigCtrl);

        this.current = this.current || {};
        this.current.jsonData = this.current.jsonData || {};
        this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";
      });

      _export("HumioConfigCtrl", HumioConfigCtrl);

      HumioConfigCtrl.templateUrl = 'partials/config.html';
    }
  };
});
//# sourceMappingURL=config_ctrl.js.map
