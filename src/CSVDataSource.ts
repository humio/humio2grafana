import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataQuery,
} from '@grafana/data';
import IDatasourceRequestOptions from './Interfaces/IDatasourceRequestOptions';
import DatasourceRequestHeaders from './Interfaces/IDatasourceRequestHeaders';
import IGrafanaAttrs from './Interfaces/IGrafanaAttrs';
import { getBackendSrv } from '@grafana/runtime';
import QueryJobManager from './humio/query_job_manager';
import { AppEvents } from '@grafana/data';
import { HumioOptions } from './types';

const { alertError } = AppEvents;

export interface CSVQuery extends DataQuery {
  humioQuery: string;
  humioRepository?: string;
}

export class HumioDataSource extends DataSourceApi<CSVQuery, HumioOptions> {
  proxy_url: string;
  id: number;
  timeRange: any;
  //authenticateWithAToken: false;
  //humioToken : string;
  headers: DatasourceRequestHeaders;

  constructor(instanceSettings: DataSourceInstanceSettings<HumioOptions>) {
    super(instanceSettings);

    instanceSettings.jsonData.humioToken;

    if (instanceSettings.url === undefined) {
      this.proxy_url = 'https://cloud.humio.com/';
    } else {
      this.proxy_url = instanceSettings.url;
    }

    console.log(this.proxy_url);
    this.id = instanceSettings.id;
    //this.authenticateWithAToken = instanceSettings.jsonData.authenticateWithAToken;

    this.headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + instanceSettings.jsonData.humioToken,
    };
  }

  query(options: DataQueryRequest<CSVQuery>): Promise<DataQueryResponse> {
    if (options.targets.length === 0) {
      return new Promise(resolve =>
        resolve({
          data: [],
        })
      );
    }

    let errorCallback = (errorTitle: any, errorBody: any) => {
      alertError;

      //AppEvent(errorTitle, errorBody);
    };
    let grafanaAttrs: IGrafanaAttrs = {
      grafanaQueryOpts: options,
      errorCallback: errorCallback,
      headers: this.headers,
      proxy_url: this.proxy_url,
    };

    this.timeRange = options.range;
    let queryJobManager = QueryJobManager.getOrCreateQueryJobManager(options.panelId.toString());

    return queryJobManager.update(location, grafanaAttrs, options.targets);
  }

  testDatasource() {
    let requestOpts: IDatasourceRequestOptions = {
      url: this.proxy_url,
      method: 'POST',
      data: { query: '{currentUser{id}}' },
      headers: this.headers,
    };

    requestOpts.url += '/graphql';

    return getBackendSrv()
      .datasourceRequest(requestOpts)
      .then(
        (response: any) => {
          if (response.data.data != null) {
            return {
              status: 'success',
              message: 'Data source is working',
              title: 'Success',
            };
          } else {
            // This case is reached if no Authorization was given, which still yields a 200 at the endpoint
            return {
              status: 'error',
              message: response.data.errors[0].message,
              title: 'Error',
            };
          }
        },
        (err: any) => {
          return {
            status: 'error',
            message: err.statusText,
            title: 'Error',
          };
        }
      );
  }
}
