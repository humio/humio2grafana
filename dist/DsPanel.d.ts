/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import IQueryData from "./Interfaces/IQueryData";
import IDatasourceAtts from "./Interfaces/IDatasourceAttrs";
import IQueryAttrs from "./Interfaces/IQueryAttrs";
import RequestStatus from "./Enums/RequestStatus";
declare class DsPanel {
    queryId: string;
    failCounter: number;
    requestStatus: RequestStatus;
    queryData: IQueryData;
    constructor(queryStr: string);
    update(dsAttrs: IDatasourceAtts, queryAttrs: IQueryAttrs): any;
    private _handleRes(dsAttrs, queryAttrs, res, resolve);
    private _handleErr(dsAttrs, queryAttrs, err, resolve);
    private _composeResult(queryOptions, r, resFx, errorCb);
    private _composeQuery(dsAttrs, queryAttrs, queryDt);
    private _stopUpdatedQuery(queryDt, humioDataspace, doRequest);
    private _composeLiveQuery(queryDt, humioDataspace, doRequest);
    private _initQuery(queryDt, humioDataspace, doRequest);
    private _pollQuery(queryId, humioDataspace, doRequest);
    private _stopExecution(queryId, humioDataspace, doRequest);
    getQueryData(): Object;
    updateQueryParams(newQueryParams: Object): void;
    cleanupQueryData(): void;
    setQueryId(newId: string): void;
    incFailCounter(): void;
    resetFailCounter(): void;
}
export default DsPanel;
