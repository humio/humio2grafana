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
import { getBackendSrv, TemplateSrv } from '@grafana/runtime';
import QueryJobManager from './humio/query_job_manager';
import QueryResultFormatter from './humio/query_result_formatter';
import { MetricFindValue } from '@grafana/data';
import { HumioOptions } from './types';
import { getTemplateSrv } from '@grafana/runtime';
import _ from 'lodash';
import MetricFindQuery from './MetricFindQuery';
import HumioHelper from './humio/humio_helper';

export interface HumioQuery extends DataQuery {
  humioQuery: string;
  humioRepository?: string;
  annotationText?: string;
  annotationQuery?: string;
}

export class HumioDataSource extends DataSourceApi<HumioQuery, HumioOptions> {
  proxy_url: string;
  graphql_endpoint: string;
  rest_endpoint: string;
  id: number;
  timeRange: any;
  headers: DatasourceRequestHeaders;
  authenticateWithAToken: boolean;

  constructor(
    instanceSettings: DataSourceInstanceSettings<HumioOptions>,
    readonly templateSrv: TemplateSrv = getTemplateSrv()
  ) {
    super(instanceSettings);

    this.authenticateWithAToken = instanceSettings.jsonData.authenticateWithToken;

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
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  async metricFindQuery(query: any, options: any): Promise<MetricFindValue[]> {
    const mfq = new MetricFindQuery(this, query, options);
    return mfq.process();
  }

  // Formats $var strings in queries. Uses regexes when using multiple selected vars, which right now only works for some kind of filtering, such as host=$hostname
  formatting(vars: any) {
    if (_.isString(vars)) {
      // Regular variables are input as strings, while the input is an array when Multi-value variables are used.
      return vars;
    } else if (vars.length === 1) {
      return vars[0];
    } else {
      return '/^' + vars.join('|') + '$/';
    }
  }

  async query(options: DataQueryRequest<HumioQuery>): Promise<DataQueryResponse> {
    const targets = _.filter(options.targets, target => {
      return target.hide !== true && target.humioRepository !== undefined;
    });

    if (targets.length === 0) {
      return new Promise(resolve =>
        resolve({
          data: [],
        })
      );
    }

    targets.forEach(target => {
      target.humioQuery = this.templateSrv.replace(target.humioQuery, options.scopedVars, this.formatting); // Scopedvars is for panel repeats
    });

    let grafanaAttrs: IGrafanaAttrs = {
      grafanaQueryOpts: options,
      headers: this.headers,
      proxy_url: this.rest_endpoint,
    };

    this.timeRange = options.range;
    let isLive = HumioHelper.queryIsLive(location, grafanaAttrs.grafanaQueryOpts.range.raw);

    if (options.panelId !== undefined) {
      let queryJobManager = QueryJobManager.getOrCreateQueryJobManager(options.panelId?.toString());
      const raw_responses = await queryJobManager.update(isLive, grafanaAttrs, targets);
      return QueryResultFormatter.formatQueryResponses(raw_responses, targets);
    } else {
      throw new Error('panelId was undefined');
    }
  }

  async annotationQuery(options: AnnotationQueryRequest<HumioQuery>): Promise<AnnotationEvent[]> {
    let grafanaAttrs: IGrafanaAttrs = {
      grafanaQueryOpts: options,
      headers: this.headers,
      proxy_url: this.rest_endpoint,
    };
    this.timeRange = options.range;

    if (!options.annotation.annotationQuery) {
      options.annotation.annotationQuery = '';
    }

    options.annotation.humioQuery = this.templateSrv.replace(
      options.annotation.annotationQuery,
      undefined,
      this.formatting
    ); // Scopedvars is for panel repeats

    // Create targets.
    let query: HumioQuery = {
      humioQuery: options.annotation.humioQuery,
      humioRepository: options.annotation.humioRepository,
      refId: options.annotation.refId,
    };

    let targets: HumioQuery[] = [];
    targets.push(query);

    let annotationText = !options.annotation.annotationText ? '' : options.annotation.annotationText;

    // Make query to Humio.
    let queryIdentitifer =
      options.annotation.humioQuery + '-' + options.annotation.humioRepository + '-' + this.id.toString();

    let isLive = HumioHelper.queryIsLive(location, grafanaAttrs.grafanaQueryOpts.range.raw);
    let queryJobManager = QueryJobManager.getOrCreateQueryJobManager(queryIdentitifer);
    const queryResponse = (await queryJobManager.update(isLive, grafanaAttrs, targets))[0]; // Annotation query only has one target
    return QueryResultFormatter.formatAnnotationQueryResponse(queryResponse.data, annotationText);
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
            // This case is reached if no Authorization was given, which still yields a statuscode of 200 at the endpoint
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
