System.register(["./humio_helper", "lodash"], function (exports_1, context_1) {
    "use strict";
    var __assign = (this && this.__assign) || Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    var humio_helper_1, lodash_1, QueryJob;
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
            QueryJob = (function () {
                function QueryJob(queryStr) {
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
                QueryJob.prototype.executeQuery = function (datasourceAttrs, grafanaAttrs, target) {
                    var _this = this;
                    if (!target.humioRepository) {
                        return Promise.resolve({ data: { events: [], done: true } });
                    }
                    var requestedQueryDefinition = this._getRequestedQueryDefinition(datasourceAttrs, grafanaAttrs, target);
                    if (this.queryId && !this._queryDefinitionHasChanged(requestedQueryDefinition)) {
                        return this._pollQueryJobUntilDone(datasourceAttrs, grafanaAttrs, target);
                    }
                    else {
                        this._updateQueryDefinition(requestedQueryDefinition);
                        return this._cancelCurrentQueryJob(grafanaAttrs, target)
                            .then(function () { return _this._initializeNewQueryJob(datasourceAttrs, grafanaAttrs, target); })
                            .then(function () { return _this._pollQueryJobUntilDone(datasourceAttrs, grafanaAttrs, target); });
                    }
                };
                QueryJob.prototype._getRequestedQueryDefinition = function (datasourceAttrs, grafanaAttrs, target) {
                    var isLive = humio_helper_1.default.queryIsLive(datasourceAttrs.$location, grafanaAttrs.grafanaQueryOpts.range.raw.to);
                    return isLive ?
                        this._makeLiveQueryDefinition(grafanaAttrs, target.humioQuery) :
                        this._makeStaticQueryDefinition(grafanaAttrs, target.humioQuery);
                };
                QueryJob.prototype._makeLiveQueryDefinition = function (grafanaAttrs, humioQuery) {
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    var start = humio_helper_1.default.parseDateFrom(range.raw.from);
                    return {
                        isLive: true,
                        queryString: humioQuery,
                        start: start,
                    };
                };
                QueryJob.prototype._makeStaticQueryDefinition = function (grafanaAttrs, humioQuery) {
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
                QueryJob.prototype._queryDefinitionHasChanged = function (newQueryDefinition) {
                    var queryDefinitionCopy = __assign({}, this.queryDefinition);
                    lodash_1.default.assign(queryDefinitionCopy, newQueryDefinition);
                    return JSON.stringify(this.queryDefinition) !== JSON.stringify(queryDefinitionCopy);
                };
                QueryJob.prototype._updateQueryDefinition = function (newQueryDefinition) {
                    lodash_1.default.assign(this.queryDefinition, newQueryDefinition);
                    if (newQueryDefinition.isLive && this.queryDefinition.end) {
                        delete this.queryDefinition.end;
                    }
                };
                QueryJob.prototype._cancelCurrentQueryJob = function (grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        if (!_this.queryId) {
                            return resolve({});
                        }
                        return grafanaAttrs
                            .doRequest({
                            url: "/api/v1/dataspaces/" + target.humioRepository + "/queryjobs/" + _this.queryId,
                            method: 'DELETE',
                        })
                            .then(function () {
                            return resolve({});
                        });
                    });
                };
                QueryJob.prototype._initializeNewQueryJob = function (datasourceAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        return grafanaAttrs
                            .doRequest({
                            url: '/api/v1/dataspaces/' + target.humioRepository + '/queryjobs',
                            method: 'POST',
                            data: _this.queryDefinition,
                        })
                            .then(function (res) {
                            _this.queryId = res['data'].id;
                            return resolve({});
                        }, function (err) {
                            _this._handleErr(datasourceAttrs, grafanaAttrs, target, err)
                                .then(function (res) { return resolve(res); });
                        });
                    });
                };
                QueryJob.prototype._pollQueryJobUntilDone = function (datasourceAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        var recursivePollingFunc = function () {
                            _this._pollQueryJobForNextBatch(datasourceAttrs, grafanaAttrs, target).then(function (res) {
                                if (res['data'].done) {
                                    if (!_this.queryDefinition.isLive) {
                                        _this.queryId = null;
                                    }
                                    resolve(res);
                                }
                                else {
                                    var waitTimeUntilNextPoll = res['data']['metaData']['pollAfter'];
                                    setTimeout(function () { recursivePollingFunc(); }, waitTimeUntilNextPoll);
                                }
                            });
                        };
                        recursivePollingFunc();
                    });
                };
                QueryJob.prototype._pollQueryJobForNextBatch = function (datasourceAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        if (!_this.queryId) {
                            return Promise.resolve([]);
                        }
                        return grafanaAttrs
                            .doRequest({
                            url: "/api/v1/dataspaces/" + target.humioRepository + "/queryjobs/" + _this.queryId,
                            method: 'GET'
                        })
                            .then(function (res) { return resolve(res); }, function (err) {
                            return _this._handleErr(datasourceAttrs, grafanaAttrs, target, err)
                                .then(function (res) { reject(res); });
                        });
                    });
                };
                QueryJob.prototype._handleErr = function (datasourceAttrs, grafanaAttrs, target, err) {
                    switch (err['status']) {
                        case 404: {
                            this.failCounter += 1;
                            this.queryId = null;
                            if (this.failCounter <= 3) {
                                return this.executeQuery(datasourceAttrs, grafanaAttrs, target);
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
                return QueryJob;
            }());
            exports_1("default", QueryJob);
        }
    };
});
//# sourceMappingURL=query_job.js.map