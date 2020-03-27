import IDatasourceRequestHeaders from './IDatasourceRequestHeaders';

interface DatasourceRequestOptions {
  method: string;
  url: string;
  headers: IDatasourceRequestHeaders;
  data?: { [key: string]: any };
}

export default DatasourceRequestOptions;