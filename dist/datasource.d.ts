/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IDatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';
export declare class HumioDatasource {
    url: string;
    id: string;
    humioToken: string;
    datasourceAttrs: IDatasourceAttrs;
    headers: IDatasourceRequestHeaders;
    timeRange: any;
    constructor(instanceSettings: any, $q: any, backendSrv: any, $location: any, $rootScope: any);
    query(options: any): any;
    testDatasource(): Promise<{
        status: string;
        message: string;
        title: string;
    }>;
    private _doRequest;
}
