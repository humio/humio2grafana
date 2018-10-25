/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import IDatasourceAtts from './Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from './Interfaces/IGrafanaAttrs';
import HumioQuery from './HumioQuery';
declare class DsPanel {
    queries: Map<number, HumioQuery>;
    constructor();
    update(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, targets: any[]): Promise<{
        data: Array<{
            target: string;
            datapoints: any[];
        }>;
    }>;
    private _composeTimechartData;
    private _composeResult;
}
export default DsPanel;
