import { QueryDefinition, UpdatedQueryDefinition } from '../Types/QueryData';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import IDatasourceRequestOptions from '../Interfaces/IDatasourceRequestOptions';
import DatasourceRequestHeaders from '../Interfaces/IDatasourceRequestHeaders';
import HumioHelper from './humio_helper';
import _ from 'lodash';
import { CSVQuery } from 'CSVDataSource';
import { getBackendSrv } from '@grafana/runtime';

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

  executeQuery(location: Location, grafanaAttrs: IGrafanaAttrs, target: CSVQuery): Promise<any> {
    if (!target.humioRepository) {
      return Promise.resolve({ data: { events: [], done: true } });
    }

    const requestedQueryDefinition = this._getRequestedQueryDefinition(location, grafanaAttrs, target);

    // Executing the same live query again
    if (this.queryId && !this._queryDefinitionHasChanged(requestedQueryDefinition)) {
      return this._pollQueryJobUntilDone(location, grafanaAttrs, target);
    } else {
      this._updateQueryDefinition(requestedQueryDefinition);
      return this._cancelCurrentQueryJob(grafanaAttrs, target)
        .then(() => {
          return this._initializeNewQueryJob(location, grafanaAttrs, target);
        })
        .then(() => {
          return this._pollQueryJobUntilDone(location, grafanaAttrs, target);
        });
    }
  }

  private _doRequest(options: IDatasourceRequestOptions, headers: DatasourceRequestHeaders, proxy_url: string) {
    /*
    if(!this.authenticateWithAToken){
      options.headers = this.headers;
      options.url = this.proxy_url + options.url;
    }
    else{
      options.url = this.proxy_url + "/humio" + options.url;
    }
    */

    options.headers = headers;
    options.url = proxy_url + options.url;

    return getBackendSrv().datasourceRequest(options);
  }

  private _getRequestedQueryDefinition(location: Location, grafanaAttrs: IGrafanaAttrs, target: CSVQuery) {
    let isLive = HumioHelper.queryIsLive(location, grafanaAttrs.grafanaQueryOpts.range.raw.to);
    return isLive
      ? this._makeLiveQueryDefinition(grafanaAttrs, target.humioQuery)
      : this._makeStaticQueryDefinition(grafanaAttrs, target.humioQuery);
  }

  private _makeLiveQueryDefinition(grafanaAttrs: IGrafanaAttrs, humioQuery: string) {
    let range = grafanaAttrs.grafanaQueryOpts.range;
    let start = HumioHelper.parseDateFrom(range.raw.from);

    return {
      isLive: true,
      queryString: humioQuery,
      start: start,
    };
  }

  private _makeStaticQueryDefinition(grafanaAttrs: IGrafanaAttrs, humioQuery: string) {
    let range = grafanaAttrs.grafanaQueryOpts.range;
    let start = range.from._d.getTime();
    let end = range.to._d.getTime();

    return {
      isLive: false,
      queryString: humioQuery,
      start: start,
      end: end,
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

  private _cancelCurrentQueryJob(grafanaAttrs: IGrafanaAttrs, target: CSVQuery): Promise<any> {
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

  private _initializeNewQueryJob(location: Location, grafanaAttrs: IGrafanaAttrs, target: CSVQuery): Promise<any> {
    return new Promise(resolve => {
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
          this._handleErr(location, grafanaAttrs, target, err).then(res => {
            return resolve(res);
          });
        }
      );
    });
  }

  private _pollQueryJobUntilDone(location: Location, grafanaAttrs: IGrafanaAttrs, target: CSVQuery): Promise<any> {
    return new Promise(resolve => {
      let recursivePollingFunc = () => {
        this._pollQueryJobForNextBatch(location, grafanaAttrs, target).then(res => {
          if (res['data'].done) {
            // Reset state if query is not live, as there is not reason to poll the old queryjob again
            if (!this.queryDefinition.isLive) {
              this.queryId = undefined;
            }
            resolve(res);
          } else {
            var waitTimeUntilNextPoll = res['data']['metaData']['pollAfter'];
            setTimeout(() => {
              recursivePollingFunc();
            }, waitTimeUntilNextPoll); // If we don't wait the stated amount, Humio will return the same data again.
          }
        });
      };
      recursivePollingFunc();
    });
  }

  private _pollQueryJobForNextBatch(location: Location, grafanaAttrs: IGrafanaAttrs, target: CSVQuery): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.queryId) {
        return resolve({ data: { events: [], done: true } });
      }

      return this._doRequest(
        {
          url: `/api/v1/dataspaces/${target.humioRepository}/queryjobs/${this.queryId}`,
          method: 'GET',
        },
        grafanaAttrs.headers,
        grafanaAttrs.proxy_url
      ).then(
        (res: any) => {
          return resolve(res);
        },
        (err: any) => {
          return this._handleErr(location, grafanaAttrs, target, err).then(res => {
            reject(res);
          });
        }
      );
    });
  }

  private _handleErr(
    location: Location,
    grafanaAttrs: IGrafanaAttrs,
    target: CSVQuery,
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
          grafanaAttrs.errorCallback('alert-error', ['failed to create query', 'tried 3 times']);
          return Promise.resolve({ data: { events: [], done: true } });
        }
      }
      case 400: {
        grafanaAttrs.errorCallback('alert-error', ['bad query', err['data']]);
        return Promise.resolve({ data: { events: [], done: true } });
      }
      default: {
        grafanaAttrs.errorCallback('alert-error', err['data']);
        return Promise.resolve({ data: { events: [], done: true } });
      }
    }
  }
}

export default QueryJob;
