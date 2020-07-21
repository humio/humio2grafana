import { DataSourceJsonData } from '@grafana/data';

export interface HumioOptions extends DataSourceJsonData {
  baseUrl?: string;
  authenticateWithToken: boolean;
}

export interface SecretHumioOptions extends DataSourceJsonData {
  humioToken?: string;
}

export interface VariableQueryData {
  query: string;
  repo?: string;
  repositories: any;
  dataField: string;
}
