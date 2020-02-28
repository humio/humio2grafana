/// <reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import IDatasourceAtts from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import HumioQuery from './humio_query';
import ITarget from '../Interfaces/ITarget';
declare class Panel {
    queries: Map<number, HumioQuery>;
    constructor();
    update(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, targets: ITarget[]): Promise<{
        data: Array<{
            target: string;
            datapoints: Array<[number, number]>;
        }>;
    }>;
    private _composeSingleSeriesTimechart;
    private _composeMultiSeriesTimechart;
    private _composeBarChart;
}
export declare const getValueFieldName: (responseData: any) => any;
export default Panel;
