System.register([], function (exports_1, context_1) {
    "use strict";
    var RequestStatus;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            (function (RequestStatus) {
                RequestStatus[RequestStatus["INITIAL"] = 1] = "INITIAL";
                RequestStatus[RequestStatus["REQUESTING"] = 2] = "REQUESTING";
                RequestStatus[RequestStatus["CANCELLING_REQUEST"] = 3] = "CANCELLING_REQUEST";
                RequestStatus[RequestStatus["DONE"] = 4] = "DONE";
            })(RequestStatus || (RequestStatus = {}));
            exports_1("default", RequestStatus);
        }
    };
});
//# sourceMappingURL=RequestStatus.js.map