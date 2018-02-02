System.register(["app/plugins/sdk", "lodash", "./helper", "./css/query-editor.css!"], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var sdk_1, lodash_1, helper_1;
    var GenericDatasourceQueryCtrl;
    return {
        setters:[
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (helper_1_1) {
                helper_1 = helper_1_1;
            },
            function (_1) {}],
        execute: function() {
            GenericDatasourceQueryCtrl = (function (_super) {
                __extends(GenericDatasourceQueryCtrl, _super);
                function GenericDatasourceQueryCtrl($scope, $injector, $http, $q, datasourceSrv, $location) {
                    var _this = this;
                    _super.call(this, $scope, $injector);
                    this.$http = $http;
                    this.$scope = $scope;
                    this.$q = $q;
                    this.$location = $location;
                    this.target.humioQuery = this.target.humioQuery || "timechart()";
                    this.target.humioDataspace = this.target.humioDataspace || undefined;
                    this.dataspaces = [];
                    this._getHumioDataspaces().then(function (r) {
                        _this.dataspaces = r;
                    });
                }
                GenericDatasourceQueryCtrl.prototype.getHumioLink = function () {
                    // NOTE: settings for timechart
                    var isLive = this.$location.search().hasOwnProperty("refresh") &&
                        (helper_1.default.checkToDateNow(this.datasource.timeRange.raw.to));
                    var start = "24h";
                    var end = undefined;
                    if (isLive) {
                        start = helper_1.default.parseDateFrom(this.datasource.timeRange.raw.from);
                    }
                    else {
                        start = this.datasource.timeRange.from._d.getTime();
                        end = this.datasource.timeRange.to._d.getTime();
                    }
                    var linkSettings = {
                        "query": this.target.humioQuery,
                        "live": isLive,
                        "start": start,
                    };
                    if (end) {
                        linkSettings["end"] = end;
                    }
                    var widgetType = helper_1.default.getPanelType(this.target.humioQuery);
                    if (widgetType === "time-chart") {
                        linkSettings["widgetType"] = widgetType;
                        linkSettings["legend"] = "y";
                        linkSettings["lx"] = "";
                        linkSettings["ly"] = "";
                        linkSettings["mn"] = "";
                        linkSettings["mx"] = "";
                        linkSettings["op"] = "0.2";
                        linkSettings["p"] = "a";
                        linkSettings["pl"] = "";
                        linkSettings["plY"] = "";
                        linkSettings["s"] = "";
                        linkSettings["sc"] = "lin";
                        linkSettings["stp"] = "y";
                    }
                    return this.datasource.url + "/" + this.target.humioDataspace +
                        "/search?" + this._serializeQueryOpts(linkSettings);
                };
                GenericDatasourceQueryCtrl.prototype.onChangeInternal = function () {
                    this.panelCtrl.refresh(); // Asks the panel to refresh data.
                };
                GenericDatasourceQueryCtrl.prototype.showHumioLink = function () {
                    if (this.datasource.timeRange) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };
                GenericDatasourceQueryCtrl.prototype._serializeQueryOpts = function (obj) {
                    var str = [];
                    for (var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                };
                GenericDatasourceQueryCtrl.prototype._getHumioDataspaces = function () {
                    if (this.datasource.url) {
                        var requestOpts = {
                            method: "GET",
                            url: this.datasource.url + "/api/v1/dataspaces",
                            headers: this.datasource.headers
                        };
                        return this.datasource.dsAttrs.backendSrv.datasourceRequest(requestOpts).then(function (r) {
                            var res = r.data.map(function (ds) {
                                return ({
                                    value: ds.id,
                                    name: ds.id
                                });
                            });
                            return lodash_1.default.sortBy(res, ["name"]);
                        });
                    }
                    else {
                        return this.$q.when([]);
                    }
                };
                GenericDatasourceQueryCtrl.templateUrl = "partials/query.editor.html";
                return GenericDatasourceQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("default",GenericDatasourceQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map