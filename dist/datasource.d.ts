/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import DsPanelStorage from './humio/DsPanelStorage';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
export declare class GenericDatasource {
    type: string;
    url: string;
    name: string;
    id: string;
    dsAttrs: IDatasourceAttrs;
    headers: any;
    dsPanelStorage: DsPanelStorage;
    withCredentials: boolean;
    timeRange: any;
    constructor(instanceSettings: any, $q: any, backendSrv: any, $location: any, $rootScope: any);
    query(options: any): any;
    testDatasource(): any;
    doRequest(options: any): any;
}
