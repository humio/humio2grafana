System.register(["lodash", "./query_job", "./humio_helper", "../Types/WidgetType"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var lodash_1, query_job_1, humio_helper_1, WidgetType_1, QueryJobManager, getValueFieldName;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (query_job_1_1) {
                query_job_1 = query_job_1_1;
            },
            function (humio_helper_1_1) {
                humio_helper_1 = humio_helper_1_1;
            },
            function (WidgetType_1_1) {
                WidgetType_1 = WidgetType_1_1;
            }
        ],
        execute: function () {
            QueryJobManager = (function () {
                function QueryJobManager() {
                    this.queries = new Map();
                }
                QueryJobManager.getOrCreateQueryJobManager = function (managerId) {
                    var manager = this.managers.get(managerId);
                    if (!manager) {
                        manager = new this();
                        this.managers.set(managerId, manager);
                    }
                    return manager;
                };
                QueryJobManager.prototype.update = function (datasourceAttrs, grafanaAttrs, targets) {
                    return __awaiter(this, void 0, void 0, function () {
                        var queryResponses, listOfGrafanaDataSeries;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, this._executeAllQueries(datasourceAttrs, grafanaAttrs, targets)];
                                case 1:
                                    queryResponses = _a.sent();
                                    listOfGrafanaDataSeries = lodash_1.default.flatMap(queryResponses, function (res, index) {
                                        return _this._convertHumioQueryResponseToGrafanaFormat(res.data, targets[index]);
                                    });
                                    return [2, { data: listOfGrafanaDataSeries }];
                            }
                        });
                    });
                };
                QueryJobManager.prototype._executeAllQueries = function (datasourceAttrs, grafanaAttrs, targets) {
                    return __awaiter(this, void 0, void 0, function () {
                        var allQueryPromise;
                        var _this = this;
                        return __generator(this, function (_a) {
                            allQueryPromise = targets.map(function (target, index) {
                                var query = _this._getOrCreateQueryJob(index, target.humioQuery);
                                return query.executeQuery(datasourceAttrs, grafanaAttrs, target);
                            });
                            return [2, Promise.all(allQueryPromise)];
                        });
                    });
                };
                QueryJobManager.prototype._getOrCreateQueryJob = function (index, humioQuery) {
                    var query = this.queries.get(index);
                    if (!query) {
                        query = new query_job_1.default(humioQuery);
                        this.queries.set(index, query);
                    }
                    return query;
                };
                QueryJobManager.prototype._convertHumioQueryResponseToGrafanaFormat = function (humioQueryResult, target) {
                    if (humioQueryResult.events.length === 0) {
                        return [];
                    }
                    var valueFields = getValueFieldName(humioQueryResult);
                    var widgetType = humio_helper_1.default.widgetType(humioQueryResult, target);
                    switch (widgetType) {
                        case WidgetType_1.WidgetType.timechart: {
                            var seriesField_1 = humioQueryResult.metaData.extraData.series;
                            if (!seriesField_1) {
                                seriesField_1 = "placeholder";
                                humioQueryResult.events = humioQueryResult.events.map(function (event) { event[seriesField_1] = valueFields[0]; return event; });
                            }
                            return this._composeTimechart(humioQueryResult.events, seriesField_1, valueFields[0]);
                        }
                        case WidgetType_1.WidgetType.table:
                            return this._composeTable(humioQueryResult.events, humioQueryResult.metaData.fieldOrder);
                        case WidgetType_1.WidgetType.worldmap:
                            return this._composeTable(humioQueryResult.events, valueFields);
                        default: {
                            return this._composeUntyped(humioQueryResult, valueFields[0]);
                        }
                    }
                };
                QueryJobManager.prototype._composeTimechart = function (events, seriesField, valueField) {
                    var series = {};
                    for (var i = 0; i < events.length; i++) {
                        var event_1 = events[i];
                        var point = [parseFloat(event_1[valueField]), parseInt(event_1._bucket)];
                        if (!series[event_1[seriesField]]) {
                            series[event_1[seriesField]] = [point];
                        }
                        else {
                            series[event_1[seriesField]].push(point);
                        }
                    }
                    return lodash_1.default.keys(series).map(function (s) {
                        return {
                            target: s,
                            datapoints: series[s],
                        };
                    });
                };
                QueryJobManager.prototype._composeTable = function (rows, columns) {
                    return [{
                            columns: columns.map(function (column) { return { text: column }; }),
                            rows: rows.map(function (row) { return columns.map(function (column) { return row[column]; }); }),
                            type: 'table'
                        }];
                };
                QueryJobManager.prototype._composeUntyped = function (data, valueField) {
                    return lodash_1.default.flatMap(data.events, function (event) {
                        var groupbyFields = data.metaData.extraData.groupby_fields;
                        if (groupbyFields) {
                            var groupName = groupbyFields.split(',').map(function (field) { return '[' + event[field.trim()] + ']'; }).join(' ');
                            if (lodash_1.default.keys(event).length > 1) {
                                return {
                                    target: groupName,
                                    datapoints: [[parseFloat(event[valueField])]],
                                };
                            }
                        }
                        else {
                            return {
                                target: valueField,
                                datapoints: [[parseFloat(event[valueField])]],
                            };
                        }
                    });
                };
                QueryJobManager.managers = new Map();
                return QueryJobManager;
            }());
            exports_1("getValueFieldName", getValueFieldName = function (responseData) {
                var timeseriesField = '_bucket';
                var seriesField = responseData.metaData.extraData.series;
                var groupByFields = responseData.metaData.extraData.groupby_fields;
                var groupByFieldsSplit = [];
                if (groupByFields) {
                    groupByFieldsSplit = groupByFields.split(',').map(function (field) { return field.trim(); });
                }
                var valueFieldsToExclude = lodash_1.default.flatten([timeseriesField, seriesField, groupByFieldsSplit]);
                var defaultValueFieldName = '_count';
                if (responseData.metaData.fieldOrder) {
                    var valueFieldNames = lodash_1.default.filter(responseData.metaData.fieldOrder, function (fieldName) { return !lodash_1.default.includes(valueFieldsToExclude, fieldName); });
                    return valueFieldNames || defaultValueFieldName;
                }
                if (responseData.events.length > 0) {
                    var valueFieldNames = responseData.events.reduce(function (allFieldNames, event) {
                        var valueFields = lodash_1.default.difference(Object.keys(event), valueFieldsToExclude);
                        return valueFields.concat(allFieldNames);
                    }, []);
                    return valueFieldNames || defaultValueFieldName;
                }
                return defaultValueFieldName;
            });
            exports_1("default", QueryJobManager);
        }
    };
});
//# sourceMappingURL=query_job_manager.js.map