/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import DsPanelStorage from "./DsPanelStorage";
export declare class GenericDatasource {
    type: string;
    url: string;
    name: string;
    $q: any;
    $location: any;
    backendSrv: any;
    templateSrv: any;
    $rootScope: any;
    headers: any;
    dsPanelStorage: DsPanelStorage;
    withCredentials: boolean;
    timeRange: any;
    /** @ngInject */
    constructor(instanceSettings: any, $q: any, backendSrv: any, templateSrv: any, $location: any, $rootScope: any);
    query(options: any): any;
    testDatasource(): any;
    doRequest(options: any): any;
}
