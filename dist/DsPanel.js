System.register(["lodash", "./HumioQuery"], function (exports_1, context_1) {
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
                    return __awaiter(this, void 0, void 0, function () {
                        var allQueryPromise, responseList, result;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    allQueryPromise = targets.map(function (target, index) {
                                        var query = _this.queries.get(index);
                                        if (!query) {
                                            query = new HumioQuery_1.default(target.humioQuery);
                                            _this.queries.set(index, query);
                                        }
                                        return query.composeQuery(dsAttrs, grafanaAttrs, target);
                                    });
                                    return [4, Promise.all(allQueryPromise)];
                                case 1:
                                    responseList = _a.sent();
                                    result = lodash_1.default.flatMap(responseList, function (res, index) {
                                        var dt = res.data;
                                        var timeseriesField = '_bucket';
                                        var isTimechart = dt.metaData.extraData.timechart == 'true';
                                        var isAggregate = dt.metaData.isAggregate;
                                        var seriesField = dt.metaData.extraData.series;
                                        var groupbyFields = dt.metaData.extraData.groupby_fields;
                                        var valueFieldsToExclude = lodash_1.default.flatten([timeseriesField, seriesField, groupbyFields]);
                                        var valueField = lodash_1.default.filter(dt.metaData.fieldOrder, function (f) { return !lodash_1.default.includes(valueFieldsToExclude, f); })[0] || '_count';
                                        if (res.data.events.length === 0) {
                                            return [];
                                        }
                                        else if (seriesField) {
                                            return _this._composeTimechartData(seriesField, dt, valueField);
                                        }
                                        else if (isTimechart) {
                                            return [{
                                                    target: valueField,
                                                    datapoints: dt.events.map(function (ev) {
                                                        return [parseFloat(ev[valueField]), parseInt(ev._bucket)];
                                                    }),
                                                }];
                                        }
                                        else {
                                            return dt.events.map(function (ev) {
                                                if (lodash_1.default.keys(ev).length > 1) {
                                                    return {
                                                        target: ev[groupbyFields],
                                                        datapoints: [
                                                            [parseFloat(ev[valueField]), '_' + ev[groupbyFields]],
                                                        ],
                                                    };
                                                }
                                                else {
                                                    return {
                                                        target: valueField,
                                                        datapoints: [[parseFloat(ev[valueField]), valueField]],
                                                    };
                                                }
                                            });
                                        }
                                    });
                                    return [2, { data: result }];
                            }
                        });
                    });
                };
                DsPanel.prototype._composeTimechartData = function (seriesField, data, valueField) {
                    var series = {};
                    for (var i = 0; i < data['events'].length; i++) {
                        var ev = data['events'][i];
                        var point = [parseFloat(ev[valueField]), parseInt(ev._bucket)];
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