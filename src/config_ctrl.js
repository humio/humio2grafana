export class HumioConfigCtrl {

  /** @ngInject */
  constructor($scope, $injector, $q, $http) {


    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";

    // NOTE: for humio we use only 'direct' mode, if using proxy we need more workaround
    this.current.access = 'direct';
  }

}

HumioConfigCtrl.templateUrl = 'partials/config.html';
