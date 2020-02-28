declare type QueryDefinition = {
    queryString: string;
    timeZoneOffsetMinutes: number;
    showQueryEventDistribution: boolean;
    isLive: boolean;
    start: string;
    end?: string;
};
declare type UpdatedQueryDefinition = {
    queryString?: string;
    timeZoneOffsetMinutes?: number;
    showQueryEventDistribution?: boolean;
    isLive?: boolean;
    start?: string;
    end?: string;
};
export { QueryDefinition as QueryDefinition, UpdatedQueryDefinition as UpdatedQueryDefinition };
