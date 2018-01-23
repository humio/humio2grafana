/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import IQueryData from "./IQueryData";
declare class DsPanel {
    queryId: string;
    failCounter: number;
    queryData: IQueryData;
    constructor(queryStr: string);
    update(backendSrv: any, $q: any, $location: any, grafanaQueryOpts: any, humioQueryStr: string, humioDataspace: string, errorCb: (errorTitle: string, errorBody: any) => void, doRequest: (data: any) => any): any;
    _composeResult(queryOptions: any, r: any, resFx: any, errorCb: (errorTitle: string, errorBody: any) => void): any;
    private _composeQuery($location, queryDt, grafanaQueryOpts, humioDataspace, doRequest);
    _stopUpdatedQuery(queryDt: Object, humioDataspace: string, doRequest: (data: any) => any): void;
    _composeLiveQuery(queryDt: any, humioDataspace: any, doRequest: (data: any) => any): any;
    _initQuery(queryDt: any, humioDataspace: any, doRequest: (data: any) => any): any;
    _pollQuery(queryId: any, humioDataspace: any, doRequest: (data: any) => any): any;
    _stopExecution(queryId: any, humioDataspace: any, doRequest: (data: any) => any): any;
    getQueryData(): Object;
    updateQueryParams(newQueryParams: Object): void;
    cleanupQueryData(): void;
    setQueryId(newId: string): void;
    incFailCounter(): void;
    resetFailCounter(): void;
}
export default DsPanel;
