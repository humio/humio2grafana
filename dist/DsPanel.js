///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(["lodash", "./helper"], function(exports_1) {
    var lodash_1, helper_1;
    var DsPanel;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (helper_1_1) {
                helper_1 = helper_1_1;
            }],
        execute: function() {
            DsPanel = (function () {
                function DsPanel(queryStr) {
                    this.queryData = {
                        queryString: queryStr,
                        timeZoneOffsetMinutes: -(new Date()).getTimezoneOffset(),
                        showQueryEventDistribution: false,
                        start: "24h",
                        isLive: false
                    };
                    this.queryId = null;
                    this.failCounter = 0;
                }
                DsPanel.prototype.update = function (backendSrv, $q, $location, grafanaQueryOpts, humioQueryStr, humioDataspace, errorCb, doRequest) {
                    var _this = this;
                    return $q(function (resolve, reject) {
                        var handleRes = function (r) {
                            if (r.data.done) {
                                console.log("query done");
                                _this.resetFailCounter();
                                // TODO: move this check to DsPanel;
                                _this.setQueryId(_this.queryData.isLive ? _this.queryId : null);
                                resolve(_this._composeResult(grafanaQueryOpts, r, function () {
                                    if (r.data.events.length === 0) {
                                        r.data = [];
                                    }
                                    else {
                                        var dt = lodash_1.default.clone(r.data);
                                        var timeseriesField = "_bucket";
                                        var isTimechart = dt.metaData.extraData.timechart === "true";
                                        var seriesField = dt.metaData.extraData.series;
                                        var series = {};
                                        var valueField = lodash_1.default.filter(dt.metaData.fields, function (f) {
                                            return f["name"] !== timeseriesField && f["name"] !== seriesField;
                                        })[0]["name"];
                                        // NOTE: aggregating result
                                        if (seriesField) {
                                            // multiple series
                                            for (var i = 0; i < r.data.events.length; i++) {
                                                var ev = r.data.events[i];
                                                if (!series[ev[seriesField]]) {
                                                    series[ev[seriesField]] = [
                                                        [ev[valueField], parseInt(ev._bucket)]
                                                    ];
                                                }
                                                else {
                                                    series[ev[seriesField]].push([ev[valueField], parseInt(ev._bucket)]);
                                                }
                                            }
                                            r.data = lodash_1.default.keys(series).map(function (s) {
                                                return {
                                                    target: s,
                                                    datapoints: series[s]
                                                };
                                            });
                                        }
                                        else {
                                            // NOTE: single series
                                            if (dt.events.length === 1) {
                                                // NOTE: consider to be gauge
                                                r.data = dt.events.map(function (ev) {
                                                    return {
                                                        target: valueField,
                                                        datapoints: [[parseFloat(ev[valueField]), valueField]]
                                                    };
                                                });
                                            }
                                            else {
                                                if (isTimechart) {
                                                    r.data = [{
                                                            target: "_count",
                                                            datapoints: dt.events.map(function (ev) {
                                                                return [parseFloat(ev._count), parseInt(ev._bucket)];
                                                            })
                                                        }];
                                                }
                                                else {
                                                    // NOTE: consider to be a barchart
                                                    r.data = dt.events.map(function (ev) {
                                                        return {
                                                            target: ev[valueField],
                                                            datapoints: [[parseFloat(ev._count), "_" + ev[valueField]]]
                                                        };
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    return r;
                                }, errorCb));
                            }
                            else {
                                console.log("query running...");
                                console.log("" + (r.data.metaData.workDone / r.data.metaData.totalWork * 100).toFixed(2) + "%");
                                setTimeout(function () {
                                    _this._composeQuery($location, _this.getQueryData(), grafanaQueryOpts, humioDataspace, doRequest)
                                        .then(handleRes, function (err) {
                                        // TODO: handle error
                                        resolve({
                                            data: []
                                        });
                                    });
                                }, 1000);
                            }
                        };
                        var handleErr = function (err) {
                            console.log("fallback ->");
                            console.log(err);
                            // TODO: add a counter, if several times get a error - consider query to be
                            // invalid, or distinguish between error types
                            if (err.status === 401) {
                                // NOTE: query not found - trying to recreate
                                _this.setQueryId(null);
                                _this.incFailCounter();
                                if (_this.failCounter <= 3) {
                                    _this._composeQuery($location, _this.getQueryData(), grafanaQueryOpts, humioDataspace, doRequest)
                                        .then(handleRes, handleErr);
                                }
                                else {
                                    _this.resetFailCounter();
                                }
                            }
                            else {
                                if (err.status = 400) {
                                    errorCb("Query error", err.data);
                                }
                                else {
                                    errorCb(err.status.toString(), err.data);
                                }
                                resolve({
                                    data: []
                                });
                            }
                        };
                        _this._composeQuery($location, _this.getQueryData(), grafanaQueryOpts, humioDataspace, doRequest)
                            .then(handleRes, handleErr);
                    });
                };
                DsPanel.prototype._composeResult = function (queryOptions, r, resFx, errorCb) {
                    var currentTarget = queryOptions.targets[0];
                    if ((currentTarget.hasOwnProperty("type") &&
                        ((currentTarget.type === "timeserie") || (currentTarget.type === "table")) &&
                        (r.data.hasOwnProperty("metaData") && r.data.metaData.hasOwnProperty("extraData") &&
                            r.data.metaData.extraData.timechart === "true"))) {
                        // NOTE: timechart
                        return resFx();
                    }
                    else if (!currentTarget.hasOwnProperty("type") &&
                        (r.data.hasOwnProperty("metaData") && r.data.metaData.isAggregate === true)) {
                        // NOTE: gauge
                        return resFx();
                    }
                    else {
                        // NOTE: unsuported query for this type of panel
                        errorCb("alert-error", ["Unsupported visualisation", "can\'t visulize the query result on this panel."]);
                        return {
                            data: []
                        };
                    }
                };
                DsPanel.prototype._composeQuery = function ($location, queryDt, grafanaQueryOpts, humioDataspace, doRequest) {
                    var _this = this;
                    var refresh = $location ? ($location.search().refresh || null) : null;
                    var range = grafanaQueryOpts.range;
                    queryDt.isLive = ((refresh != null) && (helper_1.default.checkToDateNow(range.raw.to)));
                    // NOTE: setting date range
                    if (queryDt.isLive) {
                        queryDt.start = helper_1.default.parseDateFrom(range.raw.from);
                        // TODO: shoudl be moved to _updateQueryParams
                        this._stopUpdatedQuery(queryDt, humioDataspace, doRequest);
                        this.updateQueryParams(queryDt);
                        return this._composeLiveQuery(queryDt, humioDataspace, doRequest);
                    }
                    else {
                        // TODO: shoudl be moved to _updateQueryParams
                        this._stopUpdatedQuery(queryDt, humioDataspace, doRequest);
                        if (this.queryId != null) {
                            return this._pollQuery(this.queryId, humioDataspace, doRequest);
                        }
                        else {
                            queryDt.start = range.from._d.getTime();
                            queryDt.end = range.to._d.getTime();
                            // TODO: shoudl be moved to _updateQueryParams
                            this._stopUpdatedQuery(queryDt, humioDataspace, doRequest);
                            this.updateQueryParams(queryDt);
                            return this._initQuery(this.getQueryData(), humioDataspace, doRequest).then(function (r) {
                                _this.setQueryId(r.data.id);
                                _this.updateQueryParams({ isLive: false });
                                return _this._pollQuery(r.data.id, humioDataspace, doRequest);
                            });
                        }
                        ;
                    }
                    ;
                };
                DsPanel.prototype._stopUpdatedQuery = function (queryDt, humioDataspace, doRequest) {
                    // TODO: move this to DsPanel completely;
                    if (JSON.stringify(this.getQueryData()) !== JSON.stringify(queryDt)) {
                        console.log("STOP!");
                        if (this.queryId) {
                            // TODO: make a promise
                            this._stopExecution(this.queryId, humioDataspace, doRequest);
                        }
                        this.setQueryId(null);
                        this.updateQueryParams(queryDt);
                    }
                    ;
                };
                DsPanel.prototype._composeLiveQuery = function (queryDt, humioDataspace, doRequest) {
                    var _this = this;
                    if (this.queryId == null) {
                        return this._initQuery(this.getQueryData(), humioDataspace, doRequest).then(function (r) {
                            _this.setQueryId(r.data.id);
                            _this.updateQueryParams({ isLive: true });
                            return _this._pollQuery(r.data.id, humioDataspace, doRequest);
                        });
                    }
                    else {
                        return this._pollQuery(this.queryId, humioDataspace, doRequest);
                    }
                };
                DsPanel.prototype._initQuery = function (queryDt, humioDataspace, doRequest) {
                    return doRequest({
                        url: "/api/v1/dataspaces/" + humioDataspace + "/queryjobs",
                        data: queryDt,
                        method: "POST",
                    });
                };
                DsPanel.prototype._pollQuery = function (queryId, humioDataspace, doRequest) {
                    return doRequest({
                        url: "/api/v1/dataspaces/" + humioDataspace + "/queryjobs/" + queryId,
                        method: "GET",
                    });
                };
                DsPanel.prototype._stopExecution = function (queryId, humioDataspace, doRequest) {
                    console.log("stopping execution");
                    return doRequest({
                        url: "/api/v1/dataspaces/" + humioDataspace + "/queryjobs/" + queryId,
                        method: "DELETE",
                    });
                };
                // *
                // * RECONSIDER FOLOWING
                // *
                DsPanel.prototype.getQueryData = function () {
                    var _this = this;
                    var resObj = {};
                    Object.keys(this.queryData).forEach(function (key) {
                        // NOTE: filtering null parameters;
                        if (_this.queryData[key] !== null) {
                            resObj[key] = _this.queryData[key];
                        }
                    });
                    return resObj;
                };
                DsPanel.prototype.updateQueryParams = function (newQueryParams) {
                    lodash_1.default.assign(this.queryData, newQueryParams);
                    this.cleanupQueryData();
                };
                DsPanel.prototype.cleanupQueryData = function () {
                    if (this.queryData["isLive"]) {
                        this.queryData["end"] = null;
                    }
                };
                DsPanel.prototype.setQueryId = function (newId) {
                    this.queryId = newId;
                };
                // TODO: deprecated;
                DsPanel.prototype.incFailCounter = function () {
                    this.failCounter += 1;
                };
                DsPanel.prototype.resetFailCounter = function () {
                    this.failCounter = 0;
                };
                return DsPanel;
            })();
            exports_1("default",DsPanel);
        }
    }
});
//# sourceMappingURL=DsPanel.js.map