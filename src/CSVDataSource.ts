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
import QueryJob from './humio/query_job';
import { AppEvents, MetricFindValue, DefaultTimeRange } from '@grafana/data';
import { HumioOptions } from './types';
import { getTemplateSrv } from '@grafana/runtime';
import _ from 'lodash';

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
    super(instanceSettings);
    console.log('Datasource constructed');

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
    // TODO: Figure out how to get out a time range.
    //let timeRange = options.range.raw;
    //console.log(timeRange);

    // Right now this just uses defaults for both dasboard onload and never.
    // Perhaps never should have access to the time query in the 'location'?

    if (!options.range) {
      let uid = location.pathname.split('/')[2];
      const params = new URLSearchParams(location.search);
      const from = params.get('from');
      const to = params.get('to');

      let time;
      if (uid === 'new') {
        if (from === null || to === null) {
          time = DefaultTimeRange;
        } else {
          time = { to: to, from: from };
        }

        options.range = { raw: time };

        let res = await this.queryVariableContents(query, options);

        return new Promise(resolve => resolve(res));
      } else {
        if (from === null || to === null) {
          return fetch('/api/dashboards/uid/' + uid)
            .then(res => res.json())
            .then(
              async (res: any) => {
                // TODO: Handle when the time is an absolute range, which is stored as a DateTime object, instead of a timestamp.
                let time = res.dashboard.time;
                if (time.to !== 'now') {
                  console.log('SAVED ABSOLUTE TIME');
                  console.log(time);
                  let f = Math.floor(new Date(time.from).getTime());
                  let t = Math.floor(new Date(time.to).getTime());

                  options.range = { raw: { from: f, to: t } };
                  console.log(options.range);
                } else {
                  options.range = { raw: { from: time.from, to: time.to } };
                }

                return await this.queryVariableContents(query, options);
              },
              (err: any) => {
                return []; // TODO: Throw an error here. Get mad.
              }
            );
        } else {
          time = { to: to, from: from };

          options.range.raw = time;
          let res = await this.queryVariableContents(query, options);

          console.log(time);
          return new Promise(resolve => resolve(res));
        }
      }

      // IF refresh is never:
      // STEP 1: Read url from location
      // IF time range there, use that
      // Else
      // IF dashboard saved. Call API to get default time
      // ELSE Use DefaultTimeRange
      // IF refesh is on dashboard load
      // Just use the default dashboard time range. Again check if the dashboard has been saved.
      //return new Promise(resolve => resolve( options.variable.options));
    } else {
      let res = await this.queryVariableContents(query, options);

      console.log(res);
      return new Promise(resolve => resolve(res));
    }
  }

  async queryVariableContents(query: any, options: any) {
    console.log('GOOD OPTIONS');
    console.log(options);
    let qj = new QueryJob(query.query);
    let errorCallback = (errorTitle: any, errorBody: any) => {
      alertError;
    };

    let grafanaAttrs: IGrafanaAttrs = {
      grafanaQueryOpts: options,
      errorCallback: errorCallback,
      headers: this.headers,
      proxy_url: this.rest_endpoint,
    };

    let target = {
      humioQuery: query.query,
      humioRepository: query.repo,
      refId: 'notUsed',
    };

    let data = await qj.executeQuery(location, grafanaAttrs, target);

    return _.flatMap(data.data.events, (res, index) => {
      return { text: _.get(res, query.dataField) }; // TODO: throw exception on error
    });
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
