import DatasourceRequestOptions from './IDatasourceRequestOptions';

interface DatasourceAttrs {
  backendSrv: {
    datasourceRequest: (
      options: DatasourceRequestOptions
    ) => Promise<{
      data: any;
      [key: string]: any;
    }>;
  };
}

export default DatasourceAttrs;
