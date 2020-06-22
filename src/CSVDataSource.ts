import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataQuery,
  AnnotationQueryRequest,
  AnnotationEvent,
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
  queryText?: string;
  text?: string;
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

  async annotationQuery(options: AnnotationQueryRequest<CSVQuery>): Promise<AnnotationEvent[]> {
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

    // Get query from ui.
    options.annotation.humioQuery = options.annotation.queryText || '';
    options.annotation.refId = 'Hej'; // How to set this? It just needs to be a unique string.

    // Create targets.
    let query: CSVQuery = {
      humioQuery: options.annotation.queryText || '',
      humioRepository: options.annotation.humioRepository, // How to set this?
      refId: options.annotation.refId,
    };

    let targets: CSVQuery[] = [];
    targets.push(query);

    const events: AnnotationEvent[] = [];

    // Make query to Humio.
    let queryJobManager = QueryJobManager.getOrCreateQueryJobManager(options.annotation.refId.toString());
    const humio_events = await queryJobManager.update(location, grafanaAttrs, targets);
    // TODO: Pull the rest of events and add to humio_events.
    humio_events['data'].forEach(target => {
      const event: AnnotationEvent = {
        time: target.datapoints[0][0],
        text: options.annotation.text, // Use query?
        //tags: ['bar'],
      };
      events.push(event);
    });
    return events;
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
