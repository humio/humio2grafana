///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(["lodash", "./HumioQuery"], function(exports_1) {
    var lodash_1, HumioQuery_1;
    var DsPanel;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (HumioQuery_1_1) {
                HumioQuery_1 = HumioQuery_1_1;
            }],
        execute: function() {
            DsPanel = (function () {
                function DsPanel() {
                    this.queries = new Map();
                }
                DsPanel.prototype.update = function (dsAttrs, grafanaAttrs, targets) {
                    var _this = this;
                    var allQueryPromise = targets.map(function (target, index) {
                        var query = _this.queries.get(index);
                        if (!query) {
                            query = new HumioQuery_1.default(target.humioQuery);
                            _this.queries.set(index, query);
                        }
                        var result = query.composeQuery(dsAttrs, grafanaAttrs, target);
                        return result;
                    });
                    return dsAttrs.$q.all(allQueryPromise).then(function (responseList) {
                        var result = [];
                        lodash_1.default.each(responseList, function (res, index) {
                            if (res["data"].events.length === 0) {
                                result.push([]);
                            }
                            else {
                                var dt = res["data"];
                                var timeseriesField = "_bucket";
                                var isTimechart = dt.metaData.extraData.timechart === "true";
                                var seriesField = dt.metaData.extraData.series;
                                var series = {};
                                var valueField = lodash_1.default.filter(dt.metaData.fields, function (f) {
                                    return f["name"] !== timeseriesField && f["name"] !== seriesField;
                                })[0]["name"];
                                // NOTE: aggregating result
                                if (seriesField) {
                                    result = result.concat(_this._composeTimechartData(seriesField, dt, valueField));
                                }
                                else {
                                    // NOTE: single series
                                    if (dt.events.length === 1) {
                                        // NOTE: consider to be gauge
                                        result = result.concat(dt.events.map(function (ev) {
                                            return {
                                                target: valueField,
                                                datapoints: [[parseFloat(ev[valueField]), valueField]]
                                            };
                                        }));
                                    }
                                    else {
                                        if (isTimechart) {
                                            result = result.concat([{
                                                    target: valueField,
                                                    datapoints: dt.events.map(function (ev) {
                                                        return [parseFloat(ev[valueField]), parseInt(ev._bucket)];
                                                    })
                                                }]);
                                        }
                                        else {
                                            // NOTE: consider to be a barchart
                                            result = result.concat(dt.events.map(function (ev) {
                                                return {
                                                    target: ev[valueField],
                                                    datapoints: [[parseFloat(ev._count), "_" + ev[valueField]]]
                                                };
                                            }));
                                        }
                                    }
                                }
                            }
                        });
                        return { data: result };
                    });
                };
                // NOTE: Multiple series timecharts
                DsPanel.prototype._composeTimechartData = function (seriesField, data, valueField) {
                    var series = {};
                    // multiple series
                    for (var i = 0; i < data["events"].length; i++) {
                        var ev = data["events"][i];
                        var point = [ev[valueField], parseInt(ev._bucket)];
                        if (!series[ev[seriesField]]) {
                            series[ev[seriesField]] = [point];
                        }
                        else {
                            series[ev[seriesField]].push(point);
                        }
                    }
                    return lodash_1.default.keys(series).map(function (s) {
                        return {
                            target: s,
                            datapoints: series[s]
                        };
                    });
                };
                DsPanel.prototype._composeResult = function (queryOptions, r, resFx, errorCb) {
                    var currentTarget = queryOptions.targets[0];
                    if ((currentTarget.hasOwnProperty("type") &&
                        ((currentTarget.type === "timeserie") ||
                            (currentTarget.type === "table")) &&
                        (r.data.hasOwnProperty("metaData") &&
                            r.data.metaData.hasOwnProperty("extraData") &&
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
                        errorCb("alert-error", [
                            "Unsupported visualisation",
                            "can\'t visulize the query result on this panel."
                        ]);
                        return {
                            data: []
                        };
                    }
                };
                return DsPanel;
            })();
            exports_1("default",DsPanel);
        }
    }
});
//# sourceMappingURL=DsPanel.js.map