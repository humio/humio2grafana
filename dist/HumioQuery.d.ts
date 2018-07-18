import { QueryData, UpdateQueryData } from './Types/QueryData';
import IDatasourceAtts from './Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from './Interfaces/IGrafanaAttrs';
declare class HumioQuery {
    queryId: string;
    data: QueryData;
    failCounter: number;
    constructor(queryStr: string);
    updateQueryData(newData: UpdateQueryData): boolean;
    init(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): Promise<any>;
    pollUntillDone(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): Promise<any>;
    poll(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): Promise<any>;
    cancel(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): Promise<any>;
    composeQuery(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): Promise<any>;
    private _composeLiveQuery;
    private _composeStaticQuery;
    private _handleErr;
}
export default HumioQuery;
