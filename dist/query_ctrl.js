System.register(["app/plugins/sdk", "lodash", "./humio/humio_helper", "./css/query-editor.css!"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var sdk_1, lodash_1, humio_helper_1, HumioQueryCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (humio_helper_1_1) {
                humio_helper_1 = humio_helper_1_1;
            },
            function (_1) {
            }
        ],
        execute: function () {
            HumioQueryCtrl = (function (_super) {
                __extends(HumioQueryCtrl, _super);
                function HumioQueryCtrl($scope, $injector, $http, $q, $location) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    _this.hostUrl = '';
                    _this.repositories = [];
                    _this.$http = $http;
                    _this.$scope = $scope;
                    _this.$q = $q;
                    _this.$location = $location;
                    _this.target.humioQuery = _this.target.humioQuery || 'timechart()';
                    _this.target.humioRepository = _this.target.humioRepository || undefined;
                    _this.hostUrl = '';
                    $http({
                        url: '/api/datasources/' + _this.datasource.id,
                        method: 'GET',
                    }).then(function (res) {
                        _this.hostUrl = res.data.url;
                    });
                    _this._getHumioRepositories().then(function (repositories) {
                        _this.repositories = repositories;
                    });
                    return _this;
                }
                HumioQueryCtrl.prototype.getHumioLink = function () {
                    if (this.hostUrl === '') {
                        return '#';
                    }
                    else {
                        var queryParams = this._composeQueryArgs();
                        return "" + this.hostUrl + this.target.humioRepository + "/search?" + this._serializeQueryArgs(queryParams);
                    }
                };
                HumioQueryCtrl.prototype.showHumioLink = function () {
                    if (this.datasource.timeRange && this.target.humioRepository)
                        return true;
                    else
                        return false;
                };
                HumioQueryCtrl.prototype.onChangeInternal = function () {
                    this.panelCtrl.refresh();
                };
                HumioQueryCtrl.prototype._getHumioRepositories = function () {
                    if (!this.datasource.url) {
                        return this.$q.when([]);
                    }
                    var requestOpts = {
                        method: 'POST',
                        url: this.datasource.url + '/graphql',
                        headers: this.datasource.headers,
                        data: { query: '{searchDomains{name}}' },
                    };
                    return this.datasource.datasourceAttrs.backendSrv
                        .datasourceRequest(requestOpts)
                        .then(function (response) {
                        var searchDomainNames = response.data.data.searchDomains.map(function (_a) {
                            var name = _a.name;
                            return ({ value: name, name: name });
                        });
                        return lodash_1.default.sortBy(searchDomainNames, ['name']);
                    });
                };
                HumioQueryCtrl.prototype._composeQueryArgs = function () {
                    var isLive = humio_helper_1.default.queryIsLive(this.$location, this.datasource.timeRange.raw.to);
                    var queryParams = {
                        query: this.target.humioQuery,
                        live: isLive,
                    };
                    if (isLive) {
                        queryParams['start'] = humio_helper_1.default.parseDateFrom(this.datasource.timeRange.raw.from);
                    }
                    else {
                        queryParams['start'] = this.datasource.timeRange.from._d.getTime();
                        queryParams['end'] = this.datasource.timeRange.to._d.getTime();
                    }
                    return queryParams;
                };
                HumioQueryCtrl.prototype._serializeQueryArgs = function (queryArgs) {
                    var str = [];
                    for (var argument in queryArgs) {
                        str.push(encodeURIComponent(argument) + '=' + encodeURIComponent(queryArgs[argument]));
                    }
                    return str.join('&');
                };
                HumioQueryCtrl.templateUrl = 'partials/query.editor.html';
                return HumioQueryCtrl;
            }(sdk_1.QueryCtrl));
            exports_1("default", HumioQueryCtrl);
        }
    };
});
//# sourceMappingURL=query_ctrl.js.map