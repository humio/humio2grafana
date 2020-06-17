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
import { AppEvents, MetricFindValue, DefaultTimeRange } from '@grafana/data';
import { HumioOptions } from './types';

//import {ge} from '@grafana/runtime'

const { alertError } = AppEvents;

export interface CSVQuery extends DataQuery {
  humioQuery: string;
  humioRepository?: string;
}

export class HumioDataSource extends DataSourceApi<CSVQuery, HumioOptions> {
  proxy_url: string;
  graphql_endpoint: string;
  rest_endpoint: string;
  id: number;
  timeRange: any;
  authenticateWithAToken: boolean;
  headers: DatasourceRequestHeaders;

  constructor(instanceSettings: DataSourceInstanceSettings<HumioOptions>) {
    console.log(instanceSettings);
    super(instanceSettings);

    this.authenticateWithAToken = instanceSettings.jsonData.tokenAuth;

    if (instanceSettings.url === undefined) {
      this.proxy_url = '';
    } else {
      this.proxy_url = instanceSettings.url;
    }

    if (this.authenticateWithAToken) {
      this.graphql_endpoint = this.proxy_url + '/humio/graphql';
      this.rest_endpoint = this.proxy_url + '/humio';
    } else {
      this.graphql_endpoint = this.proxy_url + '/graphql';
      this.rest_endpoint = this.proxy_url;
    }

    this.id = instanceSettings.id;
    //this.authenticateWithAToken = instanceSettings.jsonData.authenticateWithAToken;

    if (this.authenticateWithAToken) {
      this.headers = {
        'Content-Type': 'application/json',
      };
    } else {
      this.headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + instanceSettings.jsonData.humioToken,
      };
    }
  }

  // Can't quite find a type for options that fits.
  metricFindQuery(query: any, options: any): Promise<MetricFindValue[]> {
    // TODO: Figure out how to get out a time range.
    //let timeRange = options.range.raw;
    //console.log(timeRange);

    console.log(location);
    console.log(DefaultTimeRange);


    if (!options.range) {
      // IF refresh is never:
        // STEP 1: Read url from location
        // IF time range there, use that
        // Else 
            // IF dashboard saved. Call API to get default time
            // ELSE Use DefaultTimeRange
      // IF refesh is on dashboard load
        // Just use the default dashboard time range. Again check if the dashboard has been saved.
      console.log('Range is undefined');
      return new Promise(resolve => resolve(options.variable.options));
    } else {
      console.log(options.range);
      return new Promise(resolve => resolve([{ text: query.repo }, { text: query.query }]));
    }
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
    };
    let grafanaAttrs: IGrafanaAttrs = {
      grafanaQueryOpts: options,
      errorCallback: errorCallback,
      headers: this.headers,
      proxy_url: this.rest_endpoint,
    };

    this.timeRange = options.range;
    let queryJobManager = QueryJobManager.getOrCreateQueryJobManager(options.panelId.toString());

    return queryJobManager.update(location, grafanaAttrs, options.targets);
  }

  testDatasource() {
    let requestOpts: IDatasourceRequestOptions = {
      url: this.graphql_endpoint,
      method: 'POST',
      data: { query: '{currentUser{id}}' },
      headers: this.headers,
    };

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
