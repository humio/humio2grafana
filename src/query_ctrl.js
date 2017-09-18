import {
  QueryCtrl
} from 'app/plugins/sdk';
import './css/query-editor.css!';
import _ from "lodash";

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, $http, $q, datasourceSrv) {
    super($scope, $injector);

    this.$http = $http;
    this.$scope = $scope;
    this.$q = $q;

    this.target.humioQuery = this.target.humioQuery || 'timechart()';
    this.target.humioDataspace = this.target.humioDataspace || undefined;

    this.dataspaces = [];
    this._getHumioDataspaces().then((r) => {
      this.dataspaces = r;
    });


    // NOTE: settings for timechart
    let linkSettings = {
      'widgetType': 'time-chart',
      'query': this.target.humioQuery,
      'live': false, // TODO: take from grafana
      'start': '24h', // TODO: take time frame from grafana
      'legend': 'y',
      'lx': '',
      'ly': '',
      'mn': '',
      'mx': '',
      'op': '0.2',
      'p': 'a',
      'pl': '',
      'plY': '',
      's': '',
      'sc': 'lin',
      'stp': 'y'
    }

    this.humioLink = this.datasource.url + '/' + this.target.humioDataspace +
      '/search?' + this._serializeQueryOpts(linkSettings);

  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  showHumioLink() {
    return this.humioLink != undefined
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
