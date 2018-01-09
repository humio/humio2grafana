export class HumioConfigCtrl {

  /** @ngInject */
  constructor($scope, $injector, $q, $http) {
    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";
  }
}

HumioConfigCtrl.templateUrl = 'partials/config.html';
