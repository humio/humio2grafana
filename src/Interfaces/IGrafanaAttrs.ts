import DatasourceRequestHeaders from '../Interfaces/IDatasourceRequestHeaders';

interface GrafanaAttrs {
  grafanaQueryOpts: any;
  headers: DatasourceRequestHeaders;
  proxy_url: string;
}

export default GrafanaAttrs;
