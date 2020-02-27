///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import DsPanelStorage from './humio/DsPanelStorage';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from './Interfaces/IGrafanaAttrs';

export class GenericDatasource {
  type: string;
  url: string;
  name: string;
  id: string;

  dsAttrs: IDatasourceAttrs;

  headers: any;

  dsPanelStorage: DsPanelStorage;
  withCredentials: boolean;

  timeRange: any; // FIXME: used by parent controller

  /** @ngInject */
  constructor(instanceSettings, $q, backendSrv, $location, $rootScope) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url
      ? instanceSettings.url.replace(/\/$/, '')
      : '';
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;

    this.dsAttrs = {
      $q: $q,
      $location: $location,
      backendSrv: backendSrv,
      $rootScope: $rootScope,
    };

    this.headers = {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer ' +
        (instanceSettings.jsonData
          ? instanceSettings.jsonData.humioToken || ''
          : ''),
    };

    this.dsPanelStorage = new DsPanelStorage();

    this.timeRange = null;

    this.doRequest = this.doRequest.bind(this);
  }

  query(options) {
    this.timeRange = options.range;
    let panelId = options.panelId;
    let dsPanel = this.dsPanelStorage.getOrCreatePanel(panelId);

    if (options.targets.length === 0 && !dsPanel) {
      return this.dsAttrs.$q.resolve({
        data: [],
      });
    }
  
    let grafanaAttrs: IGrafanaAttrs = {
      grafanaQueryOpts: options,
      errorCb: (errorTitle, errorBody) => {
        this.dsAttrs.$rootScope.appEvent(errorTitle, errorBody);
      },
      doRequest: this.doRequest,
    };
    return dsPanel.update(this.dsAttrs, grafanaAttrs, options.targets);
  }

  testDatasource() {
    return this.doRequest({
      url: '/api/v1/users/current',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Data source is working',
          title: 'Success',
        };
      }
    });
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    options.url = this.url + options.url;
    return this.dsAttrs.backendSrv.datasourceRequest(options);
  }
}
