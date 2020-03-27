interface IGrafanaAttrs {
  grafanaQueryOpts: any;
  errorCallback: (errorTitle: string, errorBody: any) => void;
  doRequest: (data: any) => any;
}

export default IGrafanaAttrs;
