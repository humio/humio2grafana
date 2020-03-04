import {QueryCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import HumioHelper from './humio/humio_helper';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IDatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';
import ITarget from './Interfaces/ITarget';

import './css/query-editor.css!';

class HumioQueryCtrl extends QueryCtrl {
  public static templateUrl = 'partials/query.editor.html';
  $http: any;
  $scope: any;
  $q: any;
  $location: any;
  hostUrl: string = '';
  repositories: any[] = [];
  datasource: {
    id: string,
    url: string,
    datasourceAttrs: IDatasourceAttrs,
    headers: IDatasourceRequestHeaders,
    timeRange: {
      from: any, // Moment
      to: any, // Moment
      raw: {
        from: string,
        to: string
      }
    }
  };
  target: ITarget;
  panelCtrl: any;

  /** @ngInject */
  constructor($scope, $injector, $http, $q, $location) {
    super($scope, $injector);

    this.$http = $http;
    this.$scope = $scope;
    this.$q = $q;
    this.$location = $location;

    this.target.humioQuery = this.target.humioQuery || 'timechart()';
    this.target.humioRepository = this.target.humioRepository || undefined; // Throw exception?

    this._getHumioRepositories().then(repositories => {
      this.repositories = repositories;
    });

    // Calls Grafana's API to get the Url of the datasource
    $http({
      url: '/api/datasources/' + this.datasource.id,
      method: 'GET',
    }).then(response => {
      this.hostUrl = response.data.url;
    });
  }

  getHumioLink() {
    if (this.hostUrl === '') {
      return '#';
    } else {
      let queryParams = this._createQueryParams();
      return `${this.hostUrl}/${this.target.humioRepository}/search?${this._serializeQueryArgs(queryParams)}`
    }
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data. 
  }

  showHumioLink() {
    if (this.datasource.timeRange && this.target.humioRepository) return true;
    else return false;
  }

  _serializeQueryArgs(queryArgs) {
    let str = [];
    for (let argument in queryArgs) {
      str.push(encodeURIComponent(argument) + '=' + encodeURIComponent(queryArgs[argument]));
    }
    return str.join('&');
  }

  _getHumioRepositories() {
    if (!this.datasource.url) {
      return this.$q.when([]);
    }

    const requestOpts: IDatasourceRequestOptions = {
      method: 'POST',
      url: this.datasource.url + '/graphql',
      headers: this.datasource.headers,
      data: { query: '{searchDomains{name}}' },
    }

    return this.datasource.datasourceAttrs.backendSrv
      .datasourceRequest(requestOpts)
      .then(response => {
        const searchDomainNames = response.data.data.searchDomains.map(({ name }) => ({ value: name, name }));
        return _.sortBy(searchDomainNames, ['name']);
      }); 
  }

  _createQueryParams(){
    let isLive =
      this.$location.search().hasOwnProperty('refresh') &&
      HumioHelper.checkToDateNow(this.datasource.timeRange.raw.to);

    let queryParams =  {
      query: this.target.humioQuery,
      live: isLive,
    };

    if (isLive) {
      queryParams['start'] = HumioHelper.parseDateFrom(this.datasource.timeRange.raw.from);
      }
    else {
      queryParams['start'] = this.datasource.timeRange.from._d.getTime();
      queryParams['end'] = this.datasource.timeRange.to._d.getTime();
      }
    
    return queryParams;
  }
}

export default HumioQueryCtrl;
