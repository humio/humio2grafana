export class HumioConfigCtrl {
  public static templateUrl = "partials/config.html";
  current: any;

  constructor() {
    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.baseUrl = this.current.jsonData.baseUrl || "";
    this.current.jsonData.tokenAuth = this.current.jsonData.authenticateWithAToken || false;
  }
}

export default HumioConfigCtrl;
