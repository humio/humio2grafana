import { QueryDefinition } from '../Types/QueryData';
import IDatasourceAtts from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import ITarget from '../Interfaces/ITarget';
declare class HumioQuery {
    queryId: string;
    queryDefinition: QueryDefinition;
    failCounter: number;
    constructor(queryStr: string);
    init(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any>;
    pollUntilDone(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any>;
    poll(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any>;
    cancel(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any>;
    composeQuery(dsAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any>;
    private _noQueryHasBeenExecutedYet;
    private _startNewQuery;
    private _updateQueryDefinition;
    private _queryDefinitionHasChanged;
    private _queryIsLive;
    private _makeLiveQueryDefinition;
    private _makeStaticQueryDefinition;
    private _handleErr;
}
export default HumioQuery;
