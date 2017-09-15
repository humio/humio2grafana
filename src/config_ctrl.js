import angular from 'angular';
// import _ from 'lodash';

export class HumioConfigCtrl {

  /** @ngInject */
  constructor($scope, $injector, $q, $http) {
    this.$http = $http;

    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";
  }

}
HumioConfigCtrl.templateUrl = 'partials/config.html';
