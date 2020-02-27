System.register(["./humio/DsPanelStorage"], function (exports_1, context_1) {
    "use strict";
    var DsPanelStorage_1, GenericDatasource;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (DsPanelStorage_1_1) {
                DsPanelStorage_1 = DsPanelStorage_1_1;
            }
        ],
        execute: function () {
            GenericDatasource = (function () {
                function GenericDatasource(instanceSettings, $q, backendSrv, $location, $rootScope) {
                    this.type = instanceSettings.type;
                    this.url = instanceSettings.url
                        ? instanceSettings.url.replace(/\/$/, '')
                        : '';
                    this.name = instanceSettings.name;
                    this.id = instanceSettings.id;
                    this.dsAttrs = {
                        $q: $q,
                        $location: $location,
                        backendSrv: backendSrv,
                        $rootScope: $rootScope,
                    };
                    this.headers = {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' +
                            (instanceSettings.jsonData
                                ? instanceSettings.jsonData.humioToken || ''
                                : ''),
                    };
                    this.dsPanelStorage = new DsPanelStorage_1.default();
                    this.timeRange = null;
                    this.doRequest = this.doRequest.bind(this);
                }
                GenericDatasource.prototype.query = function (options) {
                    var _this = this;
                    this.timeRange = options.range;
                    var panelId = options.panelId;
                    var dsPanel = this.dsPanelStorage.getOrCreatePanel(panelId);
                    if (options.targets.length === 0 && !dsPanel) {
                        return this.dsAttrs.$q.resolve({
                            data: [],
                        });
                    }
                    var grafanaAttrs = {
                        grafanaQueryOpts: options,
                        errorCb: function (errorTitle, errorBody) {
                            _this.dsAttrs.$rootScope.appEvent(errorTitle, errorBody);
                        },
                        doRequest: this.doRequest,
                    };
                    return dsPanel.update(this.dsAttrs, grafanaAttrs, options.targets);
                };
                GenericDatasource.prototype.testDatasource = function () {
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
                GenericDatasource.prototype.doRequest = function (options) {
                    options.withCredentials = this.withCredentials;
                    options.headers = this.headers;
                    options.url = this.url + options.url;
                    return this.dsAttrs.backendSrv.datasourceRequest(options);
                };
                return GenericDatasource;
            }());
            exports_1("GenericDatasource", GenericDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map