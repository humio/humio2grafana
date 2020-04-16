import IDatasourceAttrs from './IDatasourceAttrs';


interface IDatasource {
    id: string,
    proxy_url: string,
    datasourceAttrs: IDatasourceAttrs,
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