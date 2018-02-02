System.register([], function(exports_1) {
    var HumioConfigCtrl;
    return {
        setters:[],
        execute: function() {
            HumioConfigCtrl = (function () {
                /** @ngInject */
                function HumioConfigCtrl($scope, $injector, $q, $http) {
                    this.current = this.current || {};
                    this.current.jsonData = this.current.jsonData || {};
                    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";
                }
                HumioConfigCtrl.templateUrl = "partials/config.html";
                return HumioConfigCtrl;
            })();
            exports_1("HumioConfigCtrl", HumioConfigCtrl);
            exports_1("default",HumioConfigCtrl);
        }
    }
});
//# sourceMappingURL=config_ctrl.js.map