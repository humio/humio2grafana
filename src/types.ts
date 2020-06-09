import { DataSourceJsonData } from '@grafana/data';

export interface HumioOptions extends DataSourceJsonData {
  humioToken?: string;
}
