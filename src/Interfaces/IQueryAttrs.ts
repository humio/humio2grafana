
interface IQueryAttrs {
  grafanaQueryOpts: any;
  humioQueryStr: string;
  humioDataspace: string;
  errorCb: (errorTitle: string, errorBody: any) => void;
  doRequest: (data: any) => any;
}

export default IQueryAttrs;
