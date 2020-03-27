/// <reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import IDatasourceAttrs from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import ITarget from '../Interfaces/ITarget';
import QueryJob from './query_job';
declare class QueryJobManager {
    static managers: Map<string, QueryJobManager>;
    queries: Map<number, QueryJob>;
    constructor();
    static getOrCreateQueryJobManager(managerId: string): QueryJobManager;
    update(datasourceAttrs: IDatasourceAttrs, grafanaAttrs: IGrafanaAttrs, targets: ITarget[]): Promise<{
        data: Array<{
            target: string;
            datapoints: Array<[number, number]>;
        }>;
    }>;
    private _executeAllQueries;
    private _getOrCreateQueryJob;
    private _convertHumioQueryResponseToGrafanaFormat;
    private _composeTimechart;
    private _composeTable;
    private _composeUntyped;
}
export declare const getValueFieldName: (responseData: any) => any;
export default QueryJobManager;
