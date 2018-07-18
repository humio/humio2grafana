System.register(["lodash", "./HumioQuery"], function (exports_1, context_1) {
    "use strict";
    var lodash_1, HumioQuery_1, DsPanel;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (HumioQuery_1_1) {
                HumioQuery_1 = HumioQuery_1_1;
            }
        ],
        execute: function () {
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
                        return query.composeQuery(dsAttrs, grafanaAttrs, target);
                    });
                    return Promise.all(allQueryPromise).then(function (responseList) {
                        var result = [];
                        lodash_1.default.each(responseList, function (res, index) {
                            if (res['data'].events.length === 0) {
                                result.push([]);
                            }
                            else {
                                var dt = res['data'];
                                var timeseriesField_1 = '_bucket';
                                var isTimechart = dt.metaData.extraData.timechart === 'true';
                                var isAggregate = dt.metaData.isAggregate;
                                var seriesField_1 = dt.metaData.extraData.series;
                                var groupbyFields_1 = dt.metaData.extraData.groupby_fields;
                                var series = {};
                                var valueField_1 = lodash_1.default.filter(dt.metaData.fields, function (f) {
                                    return (f['name'] !== timeseriesField_1 &&
                                        f['name'] !== seriesField_1 &&
                                        f['name'] !== groupbyFields_1);
                                })[0]['name'];
                                if (seriesField_1) {
                                    result = result.concat(_this._composeTimechartData(seriesField_1, dt, valueField_1));
                                }
                                else {
                                    if (isTimechart) {
                                        result = result.concat([
                                            {
                                                target: valueField_1,
                                                datapoints: dt.events.map(function (ev) {
                                                    return [parseFloat(ev[valueField_1]), parseInt(ev._bucket)];
                                                }),
                                            },
                                        ]);
                                    }
                                    else {
                                        result = result.concat(dt.events.map(function (ev) {
                                            if (lodash_1.default.keys(ev).length > 1) {
                                                return {
                                                    target: ev[groupbyFields_1],
                                                    datapoints: [
                                                        [parseFloat(ev[valueField_1]), '_' + ev[groupbyFields_1]],
                                                    ],
                                                };
                                            }
                                            else {
                                                return {
                                                    target: valueField_1,
                                                    datapoints: [[parseFloat(ev[valueField_1]), valueField_1]],
                                                };
                                            }
                                        }));
                                    }
                                }
                            }
                        });
                        return { data: result };
                    });
                };
                DsPanel.prototype._composeTimechartData = function (seriesField, data, valueField) {
                    var series = {};
                    for (var i = 0; i < data['events'].length; i++) {
                        var ev = data['events'][i];
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
                            datapoints: series[s],
                        };
                    });
                };
                DsPanel.prototype._composeResult = function (queryOptions, r, resFx, errorCb) {
                    var currentTarget = queryOptions.targets[0];
                    if (currentTarget.hasOwnProperty('type') &&
                        (currentTarget.type === 'timeserie' || currentTarget.type === 'table') &&
                        (r.data.hasOwnProperty('metaData') &&
                            r.data.metaData.hasOwnProperty('extraData') &&
                            r.data.metaData.extraData.timechart === 'true')) {
                        return resFx();
                    }
                    else if (!currentTarget.hasOwnProperty('type') &&
                        (r.data.hasOwnProperty('metaData') &&
                            r.data.metaData.isAggregate === true)) {
                        return resFx();
                    }
                    else {
                        errorCb('alert-error', [
                            'Unsupported visualisation',
                            "can't visulize the query result on this panel.",
                        ]);
                        return {
                            data: [],
                        };
                    }
                };
                return DsPanel;
            }());
            exports_1("default", DsPanel);
        }
    };
});
//# sourceMappingURL=DsPanel.js.map