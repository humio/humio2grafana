System.register(["./humio_helper", "lodash"], function (exports_1, context_1) {
    "use strict";
    var humio_helper_1, lodash_1, HumioQuery;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (humio_helper_1_1) {
                humio_helper_1 = humio_helper_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }
        ],
        execute: function () {
            HumioQuery = (function () {
                function HumioQuery(queryStr) {
                    this.queryDefinition = {
                        queryString: queryStr,
                        timeZoneOffsetMinutes: -new Date().getTimezoneOffset(),
                        showQueryEventDistribution: false,
                        start: '24h',
                        isLive: false,
                    };
                    this.failCounter = 0;
                    this.queryId = null;
                    this._handleErr = this._handleErr.bind(this);
                }
                HumioQuery.prototype.init = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        return grafanaAttrs
                            .doRequest({
                            url: '/api/v1/dataspaces/' + target.humioRepository + '/queryjobs',
                            data: _this.queryDefinition,
                            method: 'POST',
                        })
                            .then(function (res) {
                            _this.queryId = res['data'].id;
                            _this.pollUntilDone(dsAttrs, grafanaAttrs, target).then(function (res) {
                                resolve(res);
                            });
                        }, function (err) {
                            _this._handleErr(dsAttrs, grafanaAttrs, target, err).then(function (res) {
                                resolve(res);
                            });
                        });
                    });
                };
                HumioQuery.prototype.pollUntilDone = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        var pollFx = function () {
                            _this.poll(dsAttrs, grafanaAttrs, target).then(function (res) {
                                if (res['data'].done) {
                                    if (!_this.queryDefinition.isLive) {
                                        _this.queryId = null;
                                    }
                                    resolve(res);
                                }
                                else {
                                    var pollAfter = res['data']['metaData']['pollAfter'];
                                    setTimeout(function () {
                                        pollFx();
                                    }, pollAfter);
                                }
                            });
                        };
                        pollFx();
                    });
                };
                HumioQuery.prototype.poll = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        if (_this.queryId) {
                            return grafanaAttrs
                                .doRequest({
                                url: '/api/v1/dataspaces/' +
                                    target.humioRepository +
                                    '/queryjobs/' +
                                    _this.queryId,
                                method: 'GET',
                            })
                                .then(function (res) {
                                resolve(res);
                            }, function (err) {
                                return _this._handleErr(dsAttrs, grafanaAttrs, target, err).then(function (res) {
                                    reject(res);
                                });
                            });
                        }
                        else {
                            return Promise.resolve([]);
                        }
                    });
                };
                HumioQuery.prototype.cancel = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        if (_this.queryId) {
                            return grafanaAttrs
                                .doRequest({
                                url: '/api/v1/dataspaces/' +
                                    target.humioRepository +
                                    '/queryjobs/' +
                                    _this.queryId,
                                method: 'DELETE',
                            })
                                .then(function () {
                                return resolve({});
                            });
                        }
                        else {
                            return resolve({});
                        }
                    });
                };
                HumioQuery.prototype.composeQuery = function (dsAttrs, grafanaAttrs, target) {
                    if (!target.humioRepository) {
                        return Promise.resolve({ data: { events: [], done: true } });
                    }
                    var isLive = this._queryIsLive(dsAttrs, grafanaAttrs);
                    var newQueryDefinition = isLive ?
                        this._makeLiveQueryDefinition(dsAttrs, grafanaAttrs, target.humioQuery) :
                        this._makeStaticQueryDefinition(dsAttrs, grafanaAttrs, target.humioQuery);
                    if (this._noQueryHasBeenExecutedYet() || this._queryDefinitionHasChanged(newQueryDefinition)) {
                        this._updateQueryDefinition(newQueryDefinition);
                        return this._startNewQuery(dsAttrs, grafanaAttrs, target);
                    }
                    else {
                        return this.pollUntilDone(dsAttrs, grafanaAttrs, target);
                    }
                };
                HumioQuery.prototype._noQueryHasBeenExecutedYet = function () {
                    return !this.queryId;
                };
                HumioQuery.prototype._startNewQuery = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return this.cancel(dsAttrs, grafanaAttrs, target).then(function () {
                        return _this.init(dsAttrs, grafanaAttrs, target);
                    });
                };
                HumioQuery.prototype._updateQueryDefinition = function (newQueryDefinition) {
                    lodash_1.default.assign(this.queryDefinition, newQueryDefinition);
                    if (newQueryDefinition.isLive && this.queryDefinition.end) {
                        delete this.queryDefinition.end;
                    }
                };
                HumioQuery.prototype._queryDefinitionHasChanged = function (newQueryDefinition) {
                    return JSON.stringify(this.queryDefinition) !== JSON.stringify(newQueryDefinition);
                };
                HumioQuery.prototype._queryIsLive = function (dsAttrs, grafanaAttrs) {
                    var refresh = dsAttrs.$location
                        ? dsAttrs.$location.search().refresh || null
                        : null;
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    return refresh != null && humio_helper_1.default.checkToDateNow(range.raw.to);
                };
                HumioQuery.prototype._makeLiveQueryDefinition = function (dsAttrs, grafanaAttrs, humioQuery) {
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    var start = humio_helper_1.default.parseDateFrom(range.raw.from);
                    return {
                        isLive: true,
                        queryString: humioQuery,
                        start: start,
                    };
                };
                HumioQuery.prototype._makeStaticQueryDefinition = function (dsAttrs, grafanaAttrs, humioQuery) {
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    var start = range.from._d.getTime();
                    var end = range.to._d.getTime();
                    return {
                        isLive: false,
                        queryString: humioQuery,
                        start: start,
                        end: end,
                    };
                };
                HumioQuery.prototype._handleErr = function (dsAttrs, grafanaAttrs, target, err) {
                    switch (err['status']) {
                        case 404: {
                            this.failCounter += 1;
                            this.queryId = null;
                            if (this.failCounter <= 3) {
                                return this.composeQuery(dsAttrs, grafanaAttrs, target);
                            }
                            else {
                                this.failCounter = 0;
                                grafanaAttrs.errorCallback('alert-error', [
                                    'failed to create query',
                                    'tried 3 times',
                                ]);
                                return Promise.resolve({ data: { events: [], done: true } });
                            }
                        }
                        case 400: {
                            grafanaAttrs.errorCallback('alert-error', ['bad query', err['data']]);
                            return Promise.resolve({ data: { events: [], done: true } });
                        }
                        default: {
                            grafanaAttrs.errorCallback('alert-error', err['data']);
                            return Promise.resolve({ data: { events: [], done: true } });
                        }
                    }
                };
                return HumioQuery;
            }());
            exports_1("default", HumioQuery);
        }
    };
});
//# sourceMappingURL=humio_query.js.map