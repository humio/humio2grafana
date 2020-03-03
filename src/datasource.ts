///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import PanelManager from './humio/panel_manager';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from './Interfaces/IGrafanaAttrs';
import IDatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';

export class HumioDatasource {
  url: string;
  id: string;
  humioToken : string;
  datasourceAttrs: IDatasourceAttrs;
  headers: IDatasourceRequestHeaders;
  panelManager: PanelManager;
  timeRange: any; // FIXME: used by parent controller 

  /** @ngInject */
  constructor(instanceSettings, $q, backendSrv, $location, $rootScope) {
    this.url = instanceSettings.url;
    this.id = instanceSettings.id;
    
    this.datasourceAttrs = {
      $q: $q,
      $location: $location,
      backendSrv: backendSrv,
      $rootScope: $rootScope,
    };

    let humioToken = instanceSettings.jsonData ? instanceSettings.jsonData.humioToken || ''  : ''
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + humioToken,
    };

    this.panelManager = new PanelManager();
    this.timeRange = null; // TODO: Add default value
    this.doRequest = this.doRequest.bind(this);
  }

  query(options) { //TODO: Type?
    if (options.targets.length === 0) {
      return this.datasourceAttrs.$q.resolve({
        data: [],
      });
    }
    
    let errorCallback = (errorTitle, errorBody) => {
      this.datasourceAttrs.$rootScope.appEvent(errorTitle, errorBody);
     }
    let grafanaAttrs: IGrafanaAttrs = {
      grafanaQueryOpts: options,
      errorCallback: errorCallback,
      doRequest: this.doRequest,
    };

    this.timeRange = options.range; 
    let panel = this.panelManager.getOrCreatePanel(options.panelId);

    return panel.update(this.datasourceAttrs, grafanaAttrs, options.targets);
  }

  testDatasource() {
    return this.doRequest({
      url: '/api/v1/users/current', // TODO: Make a dictionary for endpoints and perform a check that ensures we only succeed on non-ingest tokens
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

  doRequest(options) { //TODO: Type? Different from other 'options' in doc
    options.headers = this.headers;
    options.url = this.url + options.url;
    return this.datasourceAttrs.backendSrv.datasourceRequest(options);
  }
}
