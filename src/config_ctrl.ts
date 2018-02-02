export class HumioConfigCtrl {
  public static templateUrl = "partials/config.html";

  current: any;

  /** @ngInject */
  constructor($scope, $injector, $q, $http) {
    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";
  }
}

export default HumioConfigCtrl;
