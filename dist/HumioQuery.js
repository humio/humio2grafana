System.register(["./helper", "lodash"], function(exports_1) {
    var helper_1, lodash_1;
    var HumioQuery;
    return {
        setters:[
            function (helper_1_1) {
                helper_1 = helper_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            HumioQuery = (function () {
                function HumioQuery(queryStr) {
                    this.data = {
                        queryString: queryStr,
                        timeZoneOffsetMinutes: -(new Date()).getTimezoneOffset(),
                        showQueryEventDistribution: false,
                        start: "24h",
                        isLive: false
                    };
                    this.failCounter = 0;
                    this.queryId = null;
                    this._handleErr = this._handleErr.bind(this);
                }
                // NOTE: returns true if data is updated
                HumioQuery.prototype.updateQueryData = function (newData) {
                    var oldData = lodash_1.default.clone(this.data);
                    lodash_1.default.assign(this.data, newData);
                    if (this.data.isLive && this.data.end) {
                        delete this.data.end;
                    }
                    return JSON.stringify(this.data) !== JSON.stringify(oldData);
                };
                // NOTE: manage query
                HumioQuery.prototype.init = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return grafanaAttrs.doRequest({
                        url: "/api/v1/dataspaces/" + target.humioDataspace + "/queryjobs",
                        data: this.data,
                        method: "POST",
                    }).then(function (res) {
                        _this.queryId = res["data"].id;
                        return _this.pollUntillDone(dsAttrs, grafanaAttrs, target);
                    }, function (err) {
                        _this._handleErr(dsAttrs, grafanaAttrs, target, err);
                    });
                };
                HumioQuery.prototype.pollUntillDone = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    return dsAttrs.$q(function (resolve, reject) {
                        var pollFx = function () {
                            _this.poll(dsAttrs, grafanaAttrs, target).then(function (res) {
                                // console.log("" + (res["data"].metaData.workDone / res["data"].metaData.totalWork * 100).toFixed(2) + "%");
                                if (res["data"].done) {
                                    // NOTE: for static queries id no longer makes sense
                                    if (!_this.data.isLive) {
                                        _this.queryId = null;
                                    }
                                    resolve(res);
                                }
                                else {
                                    setTimeout(function () {
                                        pollFx();
                                    }, 1000);
                                }
                            });
                        };
                        pollFx();
                    });
                };
                HumioQuery.prototype.poll = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    if (this.queryId) {
                        return grafanaAttrs.doRequest({
                            url: "/api/v1/dataspaces/" + target.humioDataspace + "/queryjobs/" + this.queryId,
                            method: "GET",
                        }).then(function (res) { return res; }, function (err) {
                            _this._handleErr(dsAttrs, grafanaAttrs, target, err);
                        });
                    }
                    else {
                        return dsAttrs.$q.when([]);
                    }
                };
                HumioQuery.prototype.cancel = function (dsAttrs, grafanaAttrs, target) {
                    if (this.queryId) {
                        return grafanaAttrs.doRequest({
                            url: "/api/v1/dataspaces/" + target.humioDataspace + "/queryjobs/" + this.queryId,
                            method: "DELETE",
                        });
                    }
                    else {
                        return dsAttrs.$q.when({});
                    }
                };
                // NOTE: composing query
                HumioQuery.prototype.composeQuery = function (dsAttrs, grafanaAttrs, target) {
                    var refresh = dsAttrs.$location ? (dsAttrs.$location.search().refresh || null) : null;
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    var isLive = ((refresh != null) && (helper_1.default.checkToDateNow(range.raw.to)));
                    console.log(target.humioDataspace);
                    if (target.humioDataspace) {
                        if (isLive) {
                            return this._composeLiveQuery(dsAttrs, grafanaAttrs, target);
                        }
                        else {
                            return this._composeStaticQuery(dsAttrs, grafanaAttrs, target);
                        }
                    }
                    else {
                        return dsAttrs.$q.when({ data: { events: [], done: true } });
                    }
                };
                HumioQuery.prototype._composeLiveQuery = function (dsAttrs, grafanaAttrs, target) {
                    var _this = this;
                    var range = grafanaAttrs.grafanaQueryOpts.range;
                    var start = helper_1.default.parseDateFrom(range.raw.from);
                    // TODO: CONSIDER changing dataspace as well
                    var queryUpdated = this.updateQueryData({
                        start: start,
                        isLive: true,
                        queryString: target.humioQuery
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
                    // TODO: CONSIDER changing dataspace as well
                    var queryUpdated = this.updateQueryData({
                        start: start,
                        end: end,
                        isLive: false,
                        queryString: target.humioQuery
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
                    switch (err["status"]) {
                        case (404):
                            {
                                // NOTE: query not found - trying to recreate
                                this.failCounter += 1;
                                this.queryId = null;
                                if (this.failCounter <= 3) {
                                    return this.composeQuery(dsAttrs, grafanaAttrs, target);
                                }
                                else {
                                    this.failCounter = 0;
                                    grafanaAttrs.errorCb("alert-error", ["failed to create query", "tried 3 times"]);
                                    return dsAttrs.$q.when({ data: { events: [], done: true } });
                                }
                            }
                            break;
                        case (400):
                            {
                                grafanaAttrs.errorCb("alert-error", ["bad query", err["data"]]);
                                return dsAttrs.$q.when({ data: { events: [], done: true } });
                            }
                            break;
                        default: {
                            grafanaAttrs.errorCb("alert-error", err["data"]);
                            return dsAttrs.$q.when({ data: { events: [], done: true } });
                        }
                    }
                };
                return HumioQuery;
            })();
            exports_1("default",HumioQuery);
        }
    }
});
//# sourceMappingURL=HumioQuery.js.map