/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import DsPanelStorage from './DsPanelStorage';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IDatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';
export declare class GenericDatasource {
    type: string;
    url: string;
    name: string;
    id: string;
    dsAttrs: IDatasourceAttrs;
    templateSrv: any;
    headers: IDatasourceRequestHeaders;
    dsPanelStorage: DsPanelStorage;
    withCredentials: boolean;
    timeRange: any;
    constructor(instanceSettings: any, $q: any, backendSrv: any, templateSrv: any, $location: any, $rootScope: any);
    query(options: any): any;
    testDatasource(): Promise<{
        status: string;
        message: string;
        title: string;
    }>;
    doRequest(options: any): Promise<{
        [key: string]: any;
        data: any;
    }>;
}
