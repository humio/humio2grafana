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
            datapoints: Array<[number, number]>;
        }>;
    }>;
    private _composeSingleSeriesTimechart;
    private _composeMultiSeriesTimechart;
    private _composeBarChart;
    private _composeTable;
    private _isTableQuery;
}
export declare const getValueFieldName: (responseData: any) => any;
export default DsPanel;
