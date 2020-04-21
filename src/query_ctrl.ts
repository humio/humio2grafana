import {QueryCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import HumioHelper from './humio/humio_helper';
import IDatasource from './Interfaces/IDatasource';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';
import ITarget from './Interfaces/ITarget';

import './css/query-editor.css!';

/**
 * Represents a query widget registered to a Grafana panel,
 * enabling visual costumization of the widget.
 */
class HumioQueryCtrl extends QueryCtrl {
  public static templateUrl = 'partials/query.editor.html';
  $http: any;
  $scope: any;
  $q: any;
  $location: any;
  hostUrl: string = '';
  repositories: any[] = [];
  datasource: IDatasource;
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
    this.target.humioRepository = this.target.humioRepository || "";

    this.hostUrl = '';
    $http({
      url: '/api/datasources/' + this.datasource.id,
      method: 'GET',
    }).then(res => {
      this.hostUrl = res.data.jsonData.baseUrl;
      // Trim off the last / if it exists. Otherwise later url concatinations will be incorrect.
      if(this.hostUrl[this.hostUrl.length - 1] === "/"){
        this.hostUrl = this.hostUrl.substring(0, this.hostUrl.length - 1);
      }
    });

    this._getHumioRepositories().then(repositories => {
      this.repositories = repositories;
    });
  }
  
  getHumioLink() {
    if (this.hostUrl === '') {
      return '#';
    } else {
      let queryParams = this._composeQueryArgs();
      return `${this.hostUrl}/${this.target.humioRepository}/search?${this._serializeQueryArgs(queryParams)}`
    }
  }

  showHumioLink() {
    if (this.datasource.timeRange && this.target.humioRepository) return true;
    else return false;
  }

  onChangeInternal() {
    this.panelCtrl.refresh();
  }

  private _getHumioRepositories() {
    if (!this.datasource.proxy_url) {
      return this.$q.when([]);
    }

    let requestOpts : IDatasourceRequestOptions = {
      method: 'POST',
      url: this.datasource.proxy_url,
      data: { query: '{searchDomains{name}}' }
    };

    if(this.datasource.tokenAuth){
      requestOpts.url += "/humio/graphql"
    }
    else
    {
      requestOpts.url += '/graphql';
      requestOpts.headers = this.datasource.headers;
    }

    return this.datasource.datasourceAttrs.backendSrv
      .datasourceRequest(requestOpts)
      .then(response => {
        const searchDomainNames = response.data.data.searchDomains.map(({ name }) => ({ value: name, name }));
        return _.sortBy(searchDomainNames, ['name']);
      }); 
  }

  private _composeQueryArgs(){
    let isLive = HumioHelper.queryIsLive(this.$location, this.datasource.timeRange.raw.to);

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

  private _serializeQueryArgs(queryArgs) {
    let str = [];
    for (let argument in queryArgs) {
      str.push(encodeURIComponent(argument) + '=' + encodeURIComponent(queryArgs[argument]));
    }
    return str.join('&');
  }
}

export default HumioQueryCtrl;
