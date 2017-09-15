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
  }

  getOptions(query) {
    return this.datasource.metricFindQuery(query || '');
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
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
