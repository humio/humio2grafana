import { QueryDefinition } from '../Types/QueryData';
import IDatasourceAtts from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import ITarget from '../Interfaces/ITarget';
declare class QueryJob {
    queryId: string;
    queryDefinition: QueryDefinition;
    failCounter: number;
    constructor(queryStr: string);
    executeQuery(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any>;
    private _getRequestedQueryDefinition;
    private _makeLiveQueryDefinition;
    private _makeStaticQueryDefinition;
    private _queryDefinitionHasChanged;
    private _updateQueryDefinition;
    private _cancelCurrentQueryJob;
    private _initializeNewQueryJob;
    private _pollQueryJobUntilDone;
    private _pollQueryJobForNextBatch;
    private _handleErr;
}
export default QueryJob;
