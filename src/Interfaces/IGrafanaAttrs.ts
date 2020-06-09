import DatasourceRequestHeaders from '../Interfaces/IDatasourceRequestHeaders';

interface GrafanaAttrs {
  grafanaQueryOpts: any;
  errorCallback: (errorTitle: string, errorBody: any) => void;
  headers: DatasourceRequestHeaders;
  proxy_url: string;
}

export default GrafanaAttrs;
