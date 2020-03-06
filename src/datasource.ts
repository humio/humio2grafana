///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import PanelManager from './humio/panel_manager';
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from './Interfaces/IGrafanaAttrs';
import IDatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';

/**
 * Describes an issue of a Humio data source instance registered to Grafana
 */
export class HumioDatasource {
  url: string;
  id: string;
  humioToken : string;
  datasourceAttrs: IDatasourceAttrs;
  headers: IDatasourceRequestHeaders;
  panelManager: PanelManager;
  timeRange: any;

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
    this.timeRange = null; // TODO: Add default value?
    this._doRequest = this._doRequest.bind(this);
  }

  /**
   * Executes all queries registered to a panel, which uses this data source.
   * Implicitly called by Grafana during a panel refresh 
   */
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
      doRequest: this._doRequest,
    };

    this.timeRange = options.range; 
    let panel = this.panelManager.getOrCreatePanel(options.panelId);

    return panel.update(this.datasourceAttrs, grafanaAttrs, options.targets);
  }

   /**
   * Tests connection to this data source given the registered url and token. 
   * Implicitly called by Grafana when user clicks the "Save & Test" button during data source configuration
   */
  testDatasource() {
    return this._doRequest({
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

  _doRequest(options) { //TODO: Type? Different from other 'options' in doc
    options.headers = this.headers;
    options.url = this.url + options.url;
    return this.datasourceAttrs.backendSrv.datasourceRequest(options);
  }
}
