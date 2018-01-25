interface IGrafanaAttrs {
  grafanaQueryOpts: any;
  errorCb: (errorTitle: string, errorBody: any) => void;
  doRequest: (data: any) => any;
}

export default IGrafanaAttrs;
