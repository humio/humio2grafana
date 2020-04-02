import {QueryDefinition, UpdatedQueryDefinition} from '../Types/QueryData';
import IDatasourceAtts from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import ITarget from '../Interfaces/ITarget';
import HumioHelper from './humio_helper';
import _ from 'lodash';

/**
 * Manages a Humio Query Job.
 */ 
class QueryJob {
  queryId: string;
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
    this.queryId = null;
    this._handleErr = this._handleErr.bind(this);
  }

  executeQuery(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any> {
    if(!target.humioRepository) {
      return Promise.resolve({data: {events: [], done: true}});
    }

    const requestedQueryDefinition = this._getRequestedQueryDefinition(datasourceAttrs, grafanaAttrs, target);

    if(this.queryId && !this._queryDefinitionHasChanged(requestedQueryDefinition)){
      return this._pollQueryJobUntilDone(datasourceAttrs, grafanaAttrs, target);
    }
    else{
      this._updateQueryDefinition(requestedQueryDefinition);
      return this._cancelCurrentQueryJob(grafanaAttrs, target)
        .then(() => {return this._initializeNewQueryJob(datasourceAttrs, grafanaAttrs, target)})
        .then(() => {return this._pollQueryJobUntilDone(datasourceAttrs, grafanaAttrs, target)});
    }
  }

  private _getRequestedQueryDefinition(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget){
    let isLive =  HumioHelper.queryIsLive(datasourceAttrs.$location, grafanaAttrs.grafanaQueryOpts.range.raw.to)
    return isLive ?
      this._makeLiveQueryDefinition(grafanaAttrs, target.humioQuery):
      this._makeStaticQueryDefinition(grafanaAttrs, target.humioQuery);
  }

  private _makeLiveQueryDefinition(grafanaAttrs: IGrafanaAttrs, humioQuery: string){
    let range = grafanaAttrs.grafanaQueryOpts.range;
    let start = HumioHelper.parseDateFrom(range.raw.from);

    return {
      isLive: true,
      queryString: humioQuery,
      start: start,
    };
  }

  private _makeStaticQueryDefinition(grafanaAttrs: IGrafanaAttrs, humioQuery: string){
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
  
  private _queryDefinitionHasChanged(newQueryDefinition: UpdatedQueryDefinition){
    let queryDefinitionCopy = {...this.queryDefinition};
    _.assign(queryDefinitionCopy, newQueryDefinition);
    return JSON.stringify(this.queryDefinition) !== JSON.stringify(queryDefinitionCopy);
  }

  private _updateQueryDefinition(newQueryDefinition: UpdatedQueryDefinition){
    _.assign(this.queryDefinition, newQueryDefinition)
    if (newQueryDefinition.isLive && this.queryDefinition.end) {
      delete this.queryDefinition.end; // Grafana will throw errors if 'end' has been set on a live query
    }
  }

  private _cancelCurrentQueryJob(grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any> {
    return new Promise(resolve => {
      if (!this.queryId){
        return resolve({});
      } 
      return grafanaAttrs
          .doRequest({
            url: `/api/v1/dataspaces/${target.humioRepository}/queryjobs/${this.queryId}`,
            method: 'DELETE',
          })
          .then(() => {
            return resolve({});
          });
    });
  }

  private _initializeNewQueryJob(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any> {
    return new Promise(resolve => {
      return grafanaAttrs
        .doRequest({
          url: '/api/v1/dataspaces/' + target.humioRepository + '/queryjobs',
          method: 'POST',
          data: this.queryDefinition,
        })
        .then(
          res => {
            this.queryId = res['data'].id;
            return resolve({});
          },
          err => {
            this._handleErr(datasourceAttrs, grafanaAttrs, target, err)
              .then(res => {return resolve(res);});
          },
        );
    });
  }

  private _pollQueryJobUntilDone(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any> {
    return new Promise(resolve => {
      let recursivePollingFunc = () => {
        this._pollQueryJobForNextBatch(datasourceAttrs, grafanaAttrs, target).then(res => {
          if (res['data'].done) {
            // Reset state if query is not live, as there is not reason to poll the old queryjob again
            if (!this.queryDefinition.isLive) {
              this.queryId = null;
            }
            resolve(res);
          } else {
            var waitTimeUntilNextPoll = res['data']['metaData']['pollAfter'];
            setTimeout(() => {recursivePollingFunc();}, waitTimeUntilNextPoll); // If we don't wait the stated amount, Humio will return the same data again.
          }
        });
      };
      recursivePollingFunc();
    });
  }

  private _pollQueryJobForNextBatch(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.queryId) {
        return resolve({data: {events: [], done: true}});
      }

      return grafanaAttrs
        .doRequest({
          url: `/api/v1/dataspaces/${target.humioRepository}/queryjobs/${this.queryId}`,
          method: 'GET'})
        .then(
          res => {return resolve(res);},
          err => {
            return this._handleErr(datasourceAttrs, grafanaAttrs, target, err)
              .then(res => {reject(res);});
          },
        ); 
    }); 
  }

  private _handleErr(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, target: ITarget, err: Object): Promise<any> {
    switch (err['status']) {
      // Getting a 404 during a query, it is possible that our queryjob has expired.
      // Thus we attempt to restart the query process, where we will aquire a new queryjob.
      case 404: {
        this.failCounter += 1;
        this.queryId = null;
        if (this.failCounter <= 3) {
          return this.executeQuery(datasourceAttrs, grafanaAttrs, target);
        } else {
          this.failCounter = 0; 
          grafanaAttrs.errorCallback('alert-error', [
            'failed to create query',
            'tried 3 times',
          ]);
          return Promise.resolve({data: {events: [], done: true}});
        }
      }
      case 400: {
        grafanaAttrs.errorCallback('alert-error', ['bad query', err['data']]);
        return Promise.resolve({data: {events: [], done: true}});
      }
      default: {
        grafanaAttrs.errorCallback('alert-error', err['data']);
        return Promise.resolve({data: {events: [], done: true}});
      }
    }
  }
}

export default QueryJob;
