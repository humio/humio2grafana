import { getBackendSrv } from '@grafana/runtime';
import {} from '@grafana/data';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';
import _ from 'lodash';

export class HumioAnnotationQueryEditor {
  static templateUrl = 'partials/annotations.editor.html';

  annotation: any;
  repositories: string[];
  datasource: any;

  constructor($scope: any) {
    this.annotation.rawQuery = this.annotation.rawQuery || '';
    this.repositories = [];
    this.datasource = $scope.ctrl.datasource;

    let requestOpts: IDatasourceRequestOptions = {
      method: 'POST',
      url: this.datasource.graphql_endpoint,
      data: { query: '{searchDomains{name}}' },
      headers: this.datasource.headers,
    };

    getBackendSrv()
      .datasourceRequest(requestOpts)
      .then(res => {
        let searchDomainNames = res.data.data.searchDomains.map(({ name }: { name: string }) => ({
          label: name,
          value: name,
        }));

        this.repositories = _.sortBy(searchDomainNames, ['label']);
      });
  }
}
