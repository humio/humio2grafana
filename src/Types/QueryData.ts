type QueryDefinition = {
  queryString: string;
  timeZoneOffsetMinutes: number;
  showQueryEventDistribution: boolean;
  noResultUntilDone: boolean;
  isLive: boolean;
  start: string;
  end?: string;
};

type UpdatedQueryDefinition = {
  queryString?: string;
  timeZoneOffsetMinutes?: number;
  showQueryEventDistribution?: boolean;
  noResultUntilDone: boolean;
  isLive?: boolean;
  start?: string;
  end?: string;
};

export { QueryDefinition, UpdatedQueryDefinition };
