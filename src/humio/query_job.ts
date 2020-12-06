import { QueryDefinition, UpdatedQueryDefinition } from '../Types/QueryData';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import IDatasourceRequestOptions from '../Interfaces/IDatasourceRequestOptions';
import DatasourceRequestHeaders from '../Interfaces/IDatasourceRequestHeaders';
import HumioHelper from './humio_helper';
import _ from 'lodash';
import { HumioQuery } from 'HumioDataSource';
import { getBackendSrv } from '@grafana/runtime';
import { DataQueryError } from '@grafana/data';

/**
 * Manages a Humio Query Job.
 */

class QueryJob {
  queryId?: string;
  queryDefinition: QueryDefinition;
  failCounter: number;

  constructor(queryStr: string) {
    this.queryDefinition = {
      queryString: queryStr,
      timeZoneOffsetMinutes: -new Date().getTimezoneOffset(),
      showQueryEventDistribution: false,
      start: '24h',
      isLive: false,
    };

    this.failCounter = 0;
    this.queryId = undefined;
    this._handleErr = this._handleErr.bind(this);
  }

  executeQuery(location: Location, grafanaAttrs: IGrafanaAttrs, target: HumioQuery): Promise<any> {
    if (!target.humioRepository) {
      let error: DataQueryError = {
        message: 'No Repository Selected',
        data: { message: 'No Repository Selected', error: 'Please select a repository.' },
      };
      return Promise.resolve({ data: { events: [], done: true }, error: error });
    }

    const requestedQueryDefinition = this._getRequestedQueryDefinition(location, grafanaAttrs, target);

    // Executing the same live query again
    if (this.queryId && !this._queryDefinitionHasChanged(requestedQueryDefinition)) {
      return this.poll(location, grafanaAttrs, target, []);
    } else {
      this._updateQueryDefinition(requestedQueryDefinition);
      return this._cancelCurrentQueryJob(grafanaAttrs, target).then(() => {
        return this._initializeNewQueryJob(grafanaAttrs, target)
          .then(
            () => {
              return Promise.resolve(this.poll(location, grafanaAttrs, target, []));
            },
            err => {
              return Promise.reject(err);
            }
          )
          .then(
            res => {
              return Promise.resolve(res);
            },
            err => {
              return this._handleErr(location, grafanaAttrs, target, err).then(res => {
                return Promise.reject(res);
              });
            }
          );
      });
    }
  }

  private _doRequest(options: IDatasourceRequestOptions, headers: DatasourceRequestHeaders, proxy_url: string) {
    options.headers = headers;
    options.url = proxy_url + options.url;

    return getBackendSrv().datasourceRequest(options);
  }

  private _getRequestedQueryDefinition(location: Location, grafanaAttrs: IGrafanaAttrs, target: HumioQuery) {
    let isLive = HumioHelper.queryIsLive(location, grafanaAttrs.grafanaQueryOpts.range.raw);
    return isLive
      ? this._makeLiveQueryDefinition(grafanaAttrs, target.humioQuery)
      : this._makeStaticQueryDefinition(grafanaAttrs, target.humioQuery);
  }

  private _makeLiveQueryDefinition(grafanaAttrs: IGrafanaAttrs, humioQuery: string) {
    let range = grafanaAttrs.grafanaQueryOpts.range;
    if (!HumioHelper.isAllowedRangeForLive(range.raw.from) || range.raw.to !== 'now') {
      return this._makeStaticQueryDefinition(grafanaAttrs, humioQuery);
    } else {
      return {
        isLive: true,
        queryString: humioQuery,
        start: HumioHelper.parseLiveFrom(range.raw.from),
      };
    }
  }

  private _makeStaticQueryDefinition(grafanaAttrs: IGrafanaAttrs, humioQuery: string) {
    let range = grafanaAttrs.grafanaQueryOpts.range;

    return {
      isLive: false,
      queryString: humioQuery,
      start: range.from._d.getTime(),
      end: range.to._d.getTime(),
    };
  }

  private _queryDefinitionHasChanged(newQueryDefinition: UpdatedQueryDefinition) {
    let queryDefinitionCopy = { ...this.queryDefinition };
    _.assign(queryDefinitionCopy, newQueryDefinition);
    return JSON.stringify(this.queryDefinition) !== JSON.stringify(queryDefinitionCopy);
  }

  private _updateQueryDefinition(newQueryDefinition: UpdatedQueryDefinition) {
    _.assign(this.queryDefinition, newQueryDefinition);
    if (newQueryDefinition.isLive && this.queryDefinition.end) {
      delete this.queryDefinition.end; // Grafana will throw errors if 'end' has been set on a live query
    }
  }

  private _cancelCurrentQueryJob(grafanaAttrs: IGrafanaAttrs, target: HumioQuery): Promise<any> {
    return new Promise(resolve => {
      if (!this.queryId) {
        return resolve({});
      }
      return this._doRequest(
        {
          url: `/api/v1/dataspaces/${target.humioRepository}/queryjobs/${this.queryId}`,
          method: 'DELETE',
        },
        grafanaAttrs.headers,
        grafanaAttrs.proxy_url
      ).then(() => {
        return resolve({});
      });
    });
  }

  private _initializeNewQueryJob(grafanaAttrs: IGrafanaAttrs, target: HumioQuery): Promise<any> {
    return new Promise((resolve, reject) => {
      return this._doRequest(
        {
          url: '/api/v1/dataspaces/' + target.humioRepository + '/queryjobs',
          method: 'POST',
          data: this.queryDefinition,
        },
        grafanaAttrs.headers,
        grafanaAttrs.proxy_url
      ).then(
        (res: any) => {
          this.queryId = res['data'].id;
          return resolve({});
        },
        (err: any) => {
          return reject(err);
        }
      );
    });
  }

  private poll(location: Location, grafanaAttrs: IGrafanaAttrs, target: HumioQuery, events: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.queryId) {
        let error: DataQueryError = {
          message: 'Queryjob not initialized.',
          data: { message: 'Queryjob not initialized.', error: 'No QueryJob for query is alive.' },
        };

        reject(error);
      }

      this._doRequest(
        {
          url: `/api/v1/dataspaces/${target.humioRepository}/queryjobs/${this.queryId}`,
          method: 'GET',
        },
        grafanaAttrs.headers,
        grafanaAttrs.proxy_url
      ).then(
        (res: any) => {
          if (res['data']['done']) {
            if (!this.queryDefinition.isLive) {
              this.queryId = undefined;
            }

            resolve(res);
          } else {
            setTimeout(() => {
              resolve(this.poll(location, grafanaAttrs, target, events));
            }, res['data']['metaData']['pollAfter']);
          }
        },
        (err: any) => {
          reject(err);
        }
      );
    });
  }

  private _handleErr(
    location: Location,
    grafanaAttrs: IGrafanaAttrs,
    target: HumioQuery,
    err: { [index: string]: any }
  ): Promise<any> {
    switch (err['status']) {
      // Getting a 404 during a query, it is possible that our queryjob has expired.
      // Thus we attempt to restart the query process, where we will aquire a new queryjob.
      case 404: {
        this.failCounter += 1;
        this.queryId = undefined;
        if (this.failCounter <= 3) {
          return this.executeQuery(location, grafanaAttrs, target);
        } else {
          this.failCounter = 0;
          let error: DataQueryError = {
            message: 'Failed to create query',
            data: { message: 'Failed to create query', error: 'Tried to query 3 times in a row.' },
          };
          return Promise.resolve({ data: { events: [], done: true }, error: error });
        }
      }
      default: {
        let error: DataQueryError = {
          message: 'Query Error',
          data: { message: 'Query Error', error: err.data },
          status: err.status,
          statusText: err.statusText,
        };
        return Promise.resolve({ data: { events: [], done: true }, error: error });
      }
    }
  }
}

export default QueryJob;
