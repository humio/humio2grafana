System.register(["./humio/panel_manager"], function (exports_1, context_1) {
    "use strict";
    var panel_manager_1, HumioDatasource;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (panel_manager_1_1) {
                panel_manager_1 = panel_manager_1_1;
            }
        ],
        execute: function () {
            HumioDatasource = (function () {
                function HumioDatasource(instanceSettings, $q, backendSrv, $location, $rootScope) {
                    this.url = instanceSettings.url;
                    this.id = instanceSettings.id;
                    this.datasourceAttrs = {
                        $q: $q,
                        $location: $location,
                        backendSrv: backendSrv,
                        $rootScope: $rootScope,
                    };
                    var humioToken = instanceSettings.jsonData ? instanceSettings.jsonData.humioToken || '' : '';
                    this.headers = {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + humioToken,
                    };
                    this.panelManager = new panel_manager_1.default();
                    this.timeRange = null;
                    this.doRequest = this.doRequest.bind(this);
                }
                HumioDatasource.prototype.query = function (options) {
                    var _this = this;
                    this.timeRange = options.range;
                    var panelId = options.panelId;
                    var panel = this.panelManager.getOrCreatePanel(panelId);
                    if (options.targets.length === 0 && !panel) {
                        return this.datasourceAttrs.$q.resolve({
                            data: [],
                        });
                    }
                    var errorCallback = function (errorTitle, errorBody) {
                        _this.datasourceAttrs.$rootScope.appEvent(errorTitle, errorBody);
                    };
                    var grafanaAttrs = {
                        grafanaQueryOpts: options,
                        errorCallback: errorCallback,
                        doRequest: this.doRequest,
                    };
                    return panel.update(this.datasourceAttrs, grafanaAttrs, options.targets);
                };
                HumioDatasource.prototype.testDatasource = function () {
                    return this.doRequest({
                        url: '/api/v1/users/current',
                        method: 'GET',
                    }).then(function (response) {
                        if (response.status === 200) {
                            return {
                                status: 'success',
                                message: 'Data source is working',
                                title: 'Success',
                            };
                        }
                    });
                };
                HumioDatasource.prototype.doRequest = function (options) {
                    options.headers = this.headers;
                    options.url = this.url + options.url;
                    return this.datasourceAttrs.backendSrv.datasourceRequest(options);
                };
                return HumioDatasource;
            }());
            exports_1("HumioDatasource", HumioDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map