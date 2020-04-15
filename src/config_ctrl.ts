export class HumioConfigCtrl {
  public static templateUrl = "partials/config.html";
  current: any;

  constructor() {
    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.baseUrl = this.current.url || "";
    this.current.secureJsonData = this.current.secureJsonData || {};
    this.current.secureJsonData.humioToken = this.current.secureJsonData.humioToken || "";
  }
}

export default HumioConfigCtrl;
