System.register([], function (exports_1, context_1) {
    "use strict";
    var HumioHelper;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            HumioHelper = (function () {
                function HumioHelper() {
                }
                HumioHelper.checkToDateNow = function (toDateCheck) {
                    if (typeof toDateCheck === "string") {
                        return toDateCheck.match(/^(now[^-]|now$)/) != null;
                    }
                    else {
                        return false;
                    }
                };
                HumioHelper.getPanelType = function (queryStr) {
                    var buf = queryStr.split("|");
                    var lastFx = buf[buf.length - 1];
                    if (lastFx.trim().match(/^timechart\(.*\)$/)) {
                        return "time-chart";
                    }
                    else {
                        return undefined;
                    }
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