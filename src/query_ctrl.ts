import {QueryCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import HumioHelper from './helper';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IDatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';

import './css/query-editor.css!';

class GenericDatasourceQueryCtrl extends QueryCtrl {
  public static templateUrl = 'partials/query.editor.html';

  $http: any;
  $scope: any;
  $q: any;
  $location: any;

  originalUrl: string;

  dataspaces: any[];
  datasource: {
    id: string,
    url: string,
    dsAttrs: IDatasourceAttrs,
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

  constructor($scope, $injector, $http, $q, datasourceSrv, $location) {
    super($scope, $injector);

    this.$http = $http;
    this.$scope = $scope;
    this.$q = $q;
    this.$location = $location;

    this.target.humioQuery = this.target.humioQuery || 'timechart()';
    this.target.humioDataspace = this.target.humioDataspace || undefined;

    this.dataspaces = [];
    this._getHumioDataspaces().then(r => {
      this.dataspaces = r;
    });

    this.originalUrl = '';
    $http({
      url: '/api/datasources/' + this.datasource.id,
      method: 'GET',
    }).then(res => {
      this.originalUrl = res.data.url;
    });
  }

  getHumioLink() {
    if (this.originalUrl === '') {
      return '#';
    } else {
      // NOTE: settings for timechart
      let isLive =
        this.$location.search().hasOwnProperty('refresh') &&
        HumioHelper.checkToDateNow(this.datasource.timeRange.raw.to);

      let start = '24h';
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

      let widgetType = HumioHelper.getPanelType(this.target.humioQuery);
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

      return (
        this.originalUrl +
        '/' +
        this.target.humioDataspace +
        '/search?' +
        this._serializeQueryOpts(linkSettings)
      );
    }
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  showHumioLink() {
    if (this.datasource.timeRange) {
      return true;
    } else {
      return false;
    }
  }

  _serializeQueryOpts(obj) {
    let str = [];
    for (let p in obj) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
    return str.join('&');
  }

  _getHumioDataspaces() {
    if (this.datasource.url) {
      const requestOpts: IDatasourceRequestOptions = {
        method: 'POST',
        url: this.datasource.url + '/graphql',
        headers: this.datasource.headers,
        data: { query: '{searchDomains{name}}' },
      }

      return this.datasource.dsAttrs.backendSrv
        .datasourceRequest(requestOpts)
        .then(r => {
          const res = r.data.data.searchDomains.map(({ name }) => ({ value: name, name }));
          return _.sortBy(res, ['name']);
        });
    } else {
      return this.$q.when([]);
    }
  }
}

export default GenericDatasourceQueryCtrl;
