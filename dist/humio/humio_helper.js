System.register(["../Types/WidgetType"], function (exports_1, context_1) {
    "use strict";
    var WidgetType_1, HumioHelper;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (WidgetType_1_1) {
                WidgetType_1 = WidgetType_1_1;
            }
        ],
        execute: function () {
            HumioHelper = (function () {
                function HumioHelper() {
                }
                HumioHelper.dateIsNow = function (toDateCheck) {
                    if (typeof toDateCheck === "string") {
                        return toDateCheck.match(/^(now[^-]|now$)/) != null;
                    }
                    else {
                        return false;
                    }
                };
                HumioHelper.queryIsLive = function ($location, date) {
                    return HumioHelper.automaticPanelRefreshHasBeenActivated($location) &&
                        HumioHelper.dateIsNow(date);
                };
                HumioHelper.automaticPanelRefreshHasBeenActivated = function ($location) {
                    return ($location ? $location.search().refresh || null : null) != null;
                };
                HumioHelper.widgetType = function (data, target) {
                    if (data.metaData.extraData.timechart == 'true')
                        return WidgetType_1.WidgetType.timechart;
                    if (this.isTableQuery(target))
                        return WidgetType_1.WidgetType.table;
                    if (data.metaData.extraData['ui:suggested-widget'] == 'world-map')
                        return WidgetType_1.WidgetType.worldmap;
                    else
                        return WidgetType_1.WidgetType.untyped;
                };
                HumioHelper.isTableQuery = function (target) {
                    return typeof (target.humioQuery) === 'string'
                        ? new RegExp(/(table\()(.+)(\))/).exec(target.humioQuery) !== null
                        : false;
                };
                HumioHelper.parseDateFrom = function (date) {
                    switch (date) {
                        case "now-2d":
                            {
                                return "2d";
                            }
                        case "now-7d":
                            {
                                return "7d";
                            }
                        case "now-30d":
                            {
                                return "30d";
                            }
                        case "now-90d":
                            {
                                return "90d";
                            }
                        case "now-6M":
                            {
                                return "180d";
                            }
                        case "now-1y":
                            {
                                return "1y";
                            }
                        case "now-2y":
                            {
                                return "2y";
                            }
                        case "now-5y":
                            {
                                return "5y";
                            }
                        case "now-1d/d":
                            {
                                return "1d";
                            }
                        case "now-2d/d":
                            {
                                return "2d";
                            }
                        case "now-7d/d":
                            {
                                return "7d";
                            }
                        case "now-1w/w":
                            {
                                return "7d";
                            }
                        case "now-1M/M":
                            {
                                return "1m";
                            }
                        case "now-1y/y":
                            {
                                return "1y";
                            }
                        case "now/d":
                            {
                                return "1d";
                            }
                        case "now/w":
                            {
                                return "7d";
                            }
                        case "now/M":
                            {
                                return "1m";
                            }
                        case "now/y":
                            {
                                return "1y";
                            }
                        case "now-5m":
                            {
                                return "5m";
                            }
                        case "now-15m":
                            {
                                return "15m";
                            }
                        case "now-30m":
                            {
                                return "30m";
                            }
                        case "now-1h":
                            {
                                return "1h";
                            }
                        case "now-3h":
                            {
                                return "3h";
                            }
                        case "now-6h":
                            {
                                return "6h";
                            }
                        case "now-12h":
                            {
                                return "12h";
                            }
                        case "now-24h":
                            {
                                return "24h";
                            }
                        default:
                            {
                                return "24h";
                            }
                    }
                };
                return HumioHelper;
            }());
            exports_1("default", HumioHelper);
        }
    };
});
//# sourceMappingURL=humio_helper.js.map