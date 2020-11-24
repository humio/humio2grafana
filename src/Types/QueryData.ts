import { DataQueryError } from '@grafana/data';

type QueryDefinition = {
  queryString: string;
  timeZoneOffsetMinutes: number;
  showQueryEventDistribution: boolean;
  isLive: boolean;
  start: string;
  end?: string;
};

type UpdatedQueryDefinition = {
  queryString?: string;
  timeZoneOffsetMinutes?: number;
  showQueryEventDistribution?: boolean;
  isLive?: boolean;
  start?: string;
  end?: string;
};

type QueryResult = Promise<DataQueryError | any[]>;

type RawQueryResult = Promise<{ [index: string]: any } | any>;

export { QueryDefinition, UpdatedQueryDefinition, QueryResult, RawQueryResult };
