System.register([], function (exports_1, context_1) {
    "use strict";
    var HumioConfigCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            HumioConfigCtrl = (function () {
                function HumioConfigCtrl($scope, $injector, $q, $http) {
                    this.current = this.current || {};
                    this.current.jsonData = this.current.jsonData || {};
                    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "";
                }
                HumioConfigCtrl.templateUrl = "partials/config.html";
                return HumioConfigCtrl;
            }());
            exports_1("HumioConfigCtrl", HumioConfigCtrl);
            exports_1("default", HumioConfigCtrl);
        }
    };
});
//# sourceMappingURL=config_ctrl.js.map