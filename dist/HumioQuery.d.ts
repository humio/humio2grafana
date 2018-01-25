import { QueryData, UpdateQueryData } from "./Types/QueryData";
import IDatasourceAtts from "./Interfaces/IDatasourceAttrs";
import IGrafanaAttrs from "./Interfaces/IGrafanaAttrs";
declare class HumioQuery {
    queryId: string;
    data: QueryData;
    failCounter: number;
    constructor(queryStr: string);
    updateQueryData(newData: UpdateQueryData): boolean;
    init(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): any;
    pollUntillDone(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): any;
    poll(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): any;
    cancel(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): any;
    composeQuery(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: any): any;
    private _composeLiveQuery(dsAttrs, grafanaAttrs, target);
    private _composeStaticQuery(dsAttrs, grafanaAttrs, target);
    private _handleErr(dsAttrs, grafanaAttrs, target, err);
}
export default HumioQuery;
