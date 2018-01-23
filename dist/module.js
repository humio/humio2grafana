System.register(["./datasource", "./query_ctrl", "./config_ctrl", "./query_options_ctrl"], function(exports_1) {
    var datasource_1, query_ctrl_1, config_ctrl_1, query_options_ctrl_1;
    var GenericAnnotationsQueryCtrl;
    return {
        setters:[
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
            }],
        execute: function() {
            GenericAnnotationsQueryCtrl = (function () {
                function GenericAnnotationsQueryCtrl() {
                }
                return GenericAnnotationsQueryCtrl;
            })();
            // GenericAnnotationsQueryCtrl.template = require('pug-loader!./partials/annotations.editor.pug');
            GenericAnnotationsQueryCtrl["templateUrl"] = "partials/annotations.editor.html";
            exports_1("Datasource", datasource_1.GenericDatasource);
            exports_1("QueryCtrl", query_ctrl_1.default);
            exports_1("ConfigCtrl", config_ctrl_1.default);
            exports_1("QueryOptionsCtrl", query_options_ctrl_1.default);
            exports_1("AnnotationsQueryCtrl", GenericAnnotationsQueryCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map