import IDatasourceRequestOptions from './IDatasourceRequestOptions';

interface IDatasourceAttrs {
  $q: any;
  $location: any;
  backendSrv: {
    datasourceRequest: (options: IDatasourceRequestOptions) => Promise<{ data: any, [key: string]: any }>
  };
  $rootScope: any;
}

export default IDatasourceAttrs;
