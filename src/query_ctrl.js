import {
  QueryCtrl
} from 'app/plugins/sdk';
import './css/query-editor.css!';
import _ from "lodash";
import {
  HumioHelper
} from "./helper";

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, $http, $q, datasourceSrv, $location) {
    super($scope, $injector);

    this.$http = $http;
    this.$scope = $scope;
    this.$q = $q;
    this.$location = $location;

    this.target.humioQuery = this.target.humioQuery || 'timechart()';
    this.target.humioDataspace = this.target.humioDataspace || undefined;

    this.dataspaces = [];
    this._getHumioDataspaces().then((r) => {
      this.dataspaces = r;
    });
  }

  getHumioLink() {
    // NOTE: settings for timechart
    let isLive = this.$location.search().hasOwnProperty('refresh') &&
      (HumioHelper.checkToDateNow(this.datasource.timeRange.raw.to));

    let start = '24h';
    let end = undefined;

    if (isLive) {
      start = HumioHelper.parseDateFrom(this.datasource.timeRange.raw.from);
    } else {
      start = this.datasource.timeRange.from._d.getTime();
      end = this.datasource.timeRange.to._d.getTime();
    }

    let linkSettings = {
      'query': this.target.humioQuery,
      'live': isLive,
      'start': start,
    }

    if (end) {
      linkSettings['end'] = end;
    }

    let widgetType = HumioHelper.getPanelType(this.target.humioQuery);
    if (widgetType == 'time-chart') {
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

    return this.datasource.url + '/' + this.target.humioDataspace +
      '/search?' + this._serializeQueryOpts(linkSettings);
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
    var str = [];
    for (var p in obj)
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  }

  _getHumioDataspaces() {
    if (this.datasource.url) {

      var requestOpts = {
        method: 'GET',
        url: this.datasource.url + '/api/v1/dataspaces',
        headers: this.datasource.headers
      };

      return this.datasource.backendSrv.datasourceRequest(requestOpts).then((r) => {
        let res = r.data.map((ds) => {
          return ({
            value: ds.id,
            name: ds.id
          })
        });
        return _.sortBy(res, ['name']);
      });
    } else {
      return this.$q.when([]);
    }
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
