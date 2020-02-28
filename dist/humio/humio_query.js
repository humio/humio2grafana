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
                    this.data = {
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
                HumioQuery.prototype.updateQueryData = function (newData) {
                    var oldData = lodash_1.default.clone(this.data);
                    lodash_1.default.assign(this.data, newData);
                    if (this.data.isLive && this.data.end) {
                        delete this.data.end;
                    }
                    return JSON.stringify(this.data) !== JSON.stringify(oldData);
                };
                HumioQuery.prototype.init = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        return grafanaAttrs
                            .doRequest({
                            url: '/api/v1/dataspaces/' + target.humioRepository + '/queryjobs',
                            data: _this.data,
                            method: 'POST',
                        })
                            .then(function (res) {
                            _this.queryId = res['data'].id;
                            _this.pollUntillDone(dsAttrs, grafanaAttrs, target).then(function (res) {
                                resolve(res);
                            });
                        }, function (err) {
                            _this._handleErr(dsAttrs, grafanaAttrs, target, err).then(function (res) {
                                resolve(res);
                            });
                        });
                    });
                };
                HumioQuery.prototype.pollUntillDone = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        var pollFx = function () {
                            _this.poll(dsAttrs, grafanaAttrs, target).then(function (res) {
                                if (res['data'].done) {
                                    if (!_this.data.isLive) {
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
                    var refresh = dsAttrs.$location
                        ? dsAttrs.$location.search().refresh || null
                        : null;
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    var isLive = refresh != null && humio_helper_1.default.checkToDateNow(range.raw.to);
                    if (target.humioRepository) {
                        if (isLive) {
                            return this._composeLiveQuery(dsAttrs, grafanaAttrs, target);
                        }
                        else {
                            return this._composeStaticQuery(dsAttrs, grafanaAttrs, target);
                        }
                    }
                    else {
                        return Promise.resolve({ data: { events: [], done: true } });
                    }
                };
                HumioQuery.prototype._composeLiveQuery = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    var start = humio_helper_1.default.parseDateFrom(range.raw.from);
                    var queryUpdated = this.updateQueryData({
                        start: start,
                        isLive: true,
                        queryString: target.humioQuery,
                    });
                    if (!this.queryId || queryUpdated) {
                        return this.cancel(dsAttrs, grafanaAttrs, target).then(function () {
                            return _this.init(dsAttrs, grafanaAttrs, target);
                        });
                    }
                    else {
                        return this.pollUntillDone(dsAttrs, grafanaAttrs, target);
                    }
                };
                HumioQuery.prototype._composeStaticQuery = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    var start = range.from._d.getTime();
                    var end = range.to._d.getTime();
                    var queryUpdated = this.updateQueryData({
                        start: start,
                        end: end,
                        isLive: false,
                        queryString: target.humioQuery,
                    });
                    if (this.queryId && !queryUpdated) {
                        return this.pollUntillDone(dsAttrs, grafanaAttrs, target);
                    }
                    else {
                        return this.cancel(dsAttrs, grafanaAttrs, target).then(function () {
                            return _this.init(dsAttrs, grafanaAttrs, target);
                        });
                    }
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