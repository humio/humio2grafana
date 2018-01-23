System.register(["./DsPanelStorage"], function(exports_1) {
    var DsPanelStorage_1;
    var GenericDatasource;
    return {
        setters:[
            function (DsPanelStorage_1_1) {
                DsPanelStorage_1 = DsPanelStorage_1_1;
            }],
        execute: function() {
            GenericDatasource = (function () {
                /** @ngInject */
                function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv, $location, $rootScope) {
                    this.type = instanceSettings.type;
                    this.url = instanceSettings.url ? instanceSettings.url.replace(/\/$/, "") : "";
                    this.name = instanceSettings.name;
                    this.$q = $q;
                    this.$location = $location;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.$rootScope = $rootScope;
                    this.headers = {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " +
                            (instanceSettings.jsonData ? (instanceSettings.jsonData.humioToken || "developer") :
                                "developer")
                    };
                    this.dsPanelStorage = new DsPanelStorage_1.default();
                    this.timeRange = null;
                    this.doRequest = this.doRequest.bind(this);
                }
                GenericDatasource.prototype.query = function (options) {
                    var _this = this;
                    this.timeRange = options.range;
                    // NOTE: if no tragests just return an empty result
                    if (options.targets.length === 0) {
                        return this.$q.resolve({
                            data: []
                        });
                    }
                    var panelId = options.panelId;
                    var humioQueryStr = options.targets[0].humioQuery;
                    var humioDataspace = options.targets[0].humioDataspace;
                    // NOTE: if no humio dataspace or no query - consider configuration invalid
                    if (!humioDataspace || !humioQueryStr) {
                        return this.$q.resolve({
                            data: []
                        });
                    }
                    var dsPanel = this.dsPanelStorage.getOrGreatePanel(panelId, humioQueryStr);
                    if (dsPanel) {
                        return dsPanel.update(this.backendSrv, this.$q, this.$location, options, humioQueryStr, humioDataspace, function (errorTitle, errorBody) {
                            _this.$rootScope.appEvent(errorTitle, errorBody);
                        }, this.doRequest);
                    }
                    else {
                        // TODO: handle the case
                        return this.$q.resolve({
                            data: []
                        });
                    }
                };
                GenericDatasource.prototype.testDatasource = function () {
                    return this.doRequest({
                        url: this.url + "/",
                        method: "GET",
                    }).then(function (response) {
                        if (response.status === 200) {
                            return {
                                status: "success",
                                message: "Data source is working",
                                title: "Success"
                            };
                        }
                    });
                };
                // // TODO: handle annotationQuery
                // annotationQuery(options) {
                //   console.log("annotationQuery -> ");
                //   var query = this.templateSrv.replace(options.annotation.query, {}, "glob");
                //   var annotationQuery = {
                //     range: options.range,
                //     annotation: {
                //       name: options.annotation.name,
                //       datasource: options.annotation.datasource,
                //       enable: options.annotation.enable,
                //       iconColor: options.annotation.iconColor,
                //       query: query
                //     },
                //     rangeRaw: options.rangeRaw
                //   };
                //
                //   return this.doRequest({
                //     url: this.url + "/annotations",
                //     method: "POST",
                //     data: annotationQuery
                //   }).then(result => {
                //     return result.data;
                //   });
                // }
                GenericDatasource.prototype.doRequest = function (options) {
                    options.withCredentials = this.withCredentials;
                    options.headers = this.headers;
                    options.url = this.url + options.url; // NOTE: adding base
                    return this.backendSrv.datasourceRequest(options);
                };
                return GenericDatasource;
            })();
            exports_1("GenericDatasource", GenericDatasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map