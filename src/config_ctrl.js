import angular from 'angular';
import _ from 'lodash';

export class HumioConfigCtrl {
  // current: any;

  /** @ngInject */
  constructor($scope, $injector, $q, $http) {

    this.dataspaces = [];
    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";

    if (this.current.url && this.current.jsonData.humioToken) {
      var requestOpts = {
        method: 'GET',
        url: this.current.url + '/api/v1/dataspaces',
        headers: {
          'Authorization': 'Bearer ' + this.current.jsonData.humioToken
        }
      };
      $http(requestOpts).then((r) => {
        this.dataspaces = r.data.map((ds) => {
          return ({
            value: ds.id,
            name: ds.id
          })
        });
      })
    }
  }
}
HumioConfigCtrl.templateUrl = 'partials/config.html';
