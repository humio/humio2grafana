/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import PanelManager from './humio/panel_manager';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
export declare class HumioDatasource {
    url: string;
    id: string;
    humioToken: string;
    datasourceAttrs: IDatasourceAttrs;
    headers: any;
    panelManager: PanelManager;
    timeRange: any;
    constructor(instanceSettings: any, $q: any, backendSrv: any, $location: any, $rootScope: any);
    query(options: any): any;
    testDatasource(): any;
    doRequest(options: any): any;
}
