import IDatasourceAttrs from './IDatasourceAttrs';


interface IDatasource {
    id: string,
    proxy_url: string,
    datasourceAttrs: IDatasourceAttrs,
    tokenAuth: any,
    headers: any,
    timeRange: {
      from: any, // Moment
      to: any, // Moment
      raw: {
        from: string,
        to: string
      }
    }
  }

export default IDatasource;