export class HumioConfigCtrl {
  public static templateUrl = "partials/config.html";
  current: any;

  constructor() {
    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "";
  }
}

export default HumioConfigCtrl;
