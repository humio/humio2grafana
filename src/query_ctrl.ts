import {QueryCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import HumioHelper from './humio/humio_helper';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IDatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';

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
  target: any;
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
      let linkSettings = this._createLinkSettings(this.target.humioQuery);
      return `${this.hostUrl}/${this.target.humioRepository}/search?${this._serializeQueryArgs(linkSettings)}`
    }
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data. 
  }

  showHumioLink() {
    if (this.datasource.timeRange) return true;
    else return true;
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

  _createLinkSettings(query){
    // NOTE: Settings for timechart widget, add new case when adding a groupby widget
    let isLive =
    this.$location.search().hasOwnProperty('refresh') &&
    HumioHelper.checkToDateNow(this.datasource.timeRange.raw.to);

    let start = undefined;
    let end = undefined;

    if (isLive) {
      start = HumioHelper.parseDateFrom(this.datasource.timeRange.raw.from);
    } else {
      start = this.datasource.timeRange.from._d.getTime();
      end = this.datasource.timeRange.to._d.getTime();
    }

    let linkSettings = {
      query: this.target.humioQuery,
      live: isLive,
      start: start,
    };

    if (end) {
      linkSettings['end'] = end;
    }

    let widgetType = HumioHelper.getPanelType(query);
    if (widgetType === 'time-chart') {
      linkSettings['widgetType'] = widgetType;
      linkSettings['legend'] = 'y';
      linkSettings['lx'] = '';
      linkSettings['ly'] = '';
      linkSettings['mn'] = '';
      linkSettings['mx'] = '';
      linkSettings['op'] = '0.2';
      linkSettings['p'] = 'a';
      linkSettings['pl'] = '';
      linkSettings['plY'] = '';
      linkSettings['s'] = '';
      linkSettings['sc'] = 'lin';
      linkSettings['stp'] = 'y';
    }

    return linkSettings
  }
}

export default HumioQueryCtrl;
