///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import IDatasourceAttrs from './Interfaces/IDatasourceAttrs';
import IDatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';
import IGrafanaAttrs from './Interfaces/IGrafanaAttrs';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';
import QueryJobManager from './humio/query_job_manager';

/**
 * Describes an instance of a Humio data source registered to Grafana
 */
export class HumioDatasource {
  url: string;
  id: string;
  humioToken : string;
  datasourceAttrs: IDatasourceAttrs;
  headers: IDatasourceRequestHeaders;
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

    this.timeRange = null;
    this._doRequest = this._doRequest.bind(this);
  }

  /**
   * Executes all queries registered to a panel, which uses this data source.
   * Implicitly called by Grafana during a panel refresh.
   */
  query(options) {
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
    let queryJobManager = QueryJobManager.getOrCreateQueryJobManager(options.panelId);
    
    return queryJobManager.update(this.datasourceAttrs, grafanaAttrs, options.targets);
  }

   /**
   * Tests connection to this data source given the registered url and token. 
   * Implicitly called by Grafana when user clicks the "Save & Test" button during data source configuration.
   */
  testDatasource() {
    const requestOpts: IDatasourceRequestOptions = {
      method: 'POST',
      url: this.url + '/graphql',
      headers: this.headers,
      data: { query: '{currentUser{id}}' }, 
    }

    return this.datasourceAttrs.backendSrv
      .datasourceRequest(requestOpts)
        .then(response => {
          if (response.data.data != null) {
            return {
            status: 'success',
            message: 'Data source is working',
            title: 'Success',
            };
          }
          else { // This case is reached if no Authorization was given, which still yields a 200 at the endpoint
            return {
              status: "error",
              message: response.data.errors[0].message,
              title: "Error"
            };
          }
        },
        err => { 
          return {
            status: "error",
            message: err.statusText,
            title: "Error"
          };
        });
  }

  private _doRequest(options) {
    options.headers = this.headers;
    options.url = this.url + options.url;
    return this.datasourceAttrs.backendSrv.datasourceRequest(options);
  }
}
