/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import IDatasourceAtts from "./Interfaces/IDatasourceAttrs";
import IGrafanaAttrs from "./Interfaces/IGrafanaAttrs";
import HumioQuery from "./HumioQuery";
declare class DsPanel {
    queries: Map<number, HumioQuery>;
    constructor();
    update(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, targets: any[]): any;
    private _composeTimechartData(seriesField, data, valueField);
    private _composeResult(queryOptions, r, resFx, errorCb);
}
export default DsPanel;
