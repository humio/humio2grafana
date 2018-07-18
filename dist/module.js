System.register(["./datasource", "./query_ctrl", "./config_ctrl", "./query_options_ctrl"], function (exports_1, context_1) {
    "use strict";
    var datasource_1, query_ctrl_1, config_ctrl_1, query_options_ctrl_1, GenericAnnotationsQueryCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (query_ctrl_1_1) {
                query_ctrl_1 = query_ctrl_1_1;
            },
            function (config_ctrl_1_1) {
                config_ctrl_1 = config_ctrl_1_1;
            },
            function (query_options_ctrl_1_1) {
                query_options_ctrl_1 = query_options_ctrl_1_1;
            }
        ],
        execute: function () {
            exports_1("Datasource", datasource_1.GenericDatasource);
            exports_1("QueryCtrl", query_ctrl_1.default);
            exports_1("ConfigCtrl", config_ctrl_1.default);
            exports_1("QueryOptionsCtrl", query_options_ctrl_1.default);
            GenericAnnotationsQueryCtrl = (function () {
                function GenericAnnotationsQueryCtrl() {
                }
                return GenericAnnotationsQueryCtrl;
            }());
            exports_1("AnnotationsQueryCtrl", GenericAnnotationsQueryCtrl);
            GenericAnnotationsQueryCtrl["templateUrl"] = "partials/annotations.editor.html";
        }
    };
});
//# sourceMappingURL=module.js.map