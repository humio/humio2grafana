declare type QueryData = {
    queryString: string;
    timeZoneOffsetMinutes: number;
    showQueryEventDistribution: boolean;
    isLive: boolean;
    start: string;
    end?: string;
};
declare type UpdateQueryData = {
    queryString?: string;
    timeZoneOffsetMinutes?: number;
    showQueryEventDistribution?: boolean;
    isLive?: boolean;
    start?: string;
    end?: string;
};
export { QueryData as QueryData, UpdateQueryData as UpdateQueryData };
