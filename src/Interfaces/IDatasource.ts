import IDatasourceAttrs from './IDatasourceAttrs';
import IDatasourceRequestHeaders from './IDatasourceRequestHeaders'


interface IDatasource {
    id: string,
    url: string,
    datasourceAttrs: IDatasourceAttrs,
    headers: IDatasourceRequestHeaders,
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