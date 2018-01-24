
interface IQueryData {
  queryString: string;
  timeZoneOffsetMinutes: number;
  showQueryEventDistribution: boolean;
  isLive: boolean;
  start: string;
  end?: string;
}

export default IQueryData;
