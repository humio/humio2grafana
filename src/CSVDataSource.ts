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
import { AppEvents, MetricFindValue } from '@grafana/data';
import { HumioOptions } from './types';
import { getTemplateSrv } from '@grafana/runtime';
import _ from 'lodash';
import MetricFindQuery from './MetricFindQuery';

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
  async metricFindQuery(query: any, options: any): Promise<MetricFindValue[]> {
    const mfq = new MetricFindQuery(this, query, options);
    return mfq.process();
  }

  // Formats $var strings in queries. Uses regexes when using multiple selected vars, which right now only works for some kind of filtering, such as host=$hostname
  formatting(vars: any) {
    if (vars.length === 1) {
      return _.escapeRegExp(vars);
    } else {
      let args = vars.map((v: string) => _.escapeRegExp(v));
      return '/^' + args.join('|') + '$/';
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

    options.targets.forEach(target => {
      target.humioQuery = getTemplateSrv().replace(target.humioQuery, options.scopedVars, this.formatting); // Scopedvars is for panel repeats
    });

    let errorCallback = (errorTitle: any, errorBody: any) => {
      alertError;
    }; // TODO(AlexanderBrandborg): Double check that this can be used to throw exceptions.
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
