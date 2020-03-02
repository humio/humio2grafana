import {QueryDefinition, UpdatedQueryDefinition} from '../Types/QueryData';
import IDatasourceAtts from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import ITarget from '../Interfaces/ITarget';
import HumioHelper from './humio_helper';
import _ from 'lodash';

class HumioQuery {
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

  init(
    datasourceAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: ITarget,
  ): Promise<any> {
    return new Promise(resolve => {
      return grafanaAttrs
        .doRequest({
          url: '/api/v1/dataspaces/' + target.humioRepository + '/queryjobs',
          data: this.queryDefinition,
          method: 'POST',
        })
        .then(
          res => {
            this.queryId = res['data'].id;
            this.pollUntilDone(datasourceAttrs, grafanaAttrs, target).then(res => {
              resolve(res);
            });
          },
          err => {
            this._handleErr(datasourceAttrs, grafanaAttrs, target, err).then(res => {
              resolve(res);
            });
          },
        );
    });
  }

  pollUntilDone(
    datasourceAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: ITarget,
  ): Promise<any> {
    return new Promise(resolve => {
      let pollFx = () => {
        this.poll(datasourceAttrs, grafanaAttrs, target).then(res => {
          if (res['data'].done) {
            // NOTE: for static queries id no longer makes sense
            if (!this.queryDefinition.isLive) {
              this.queryId = null;
            }
            resolve(res);
          } else {
            var pollAfter = res['data']['metaData']['pollAfter'];
            setTimeout(() => {
              pollFx();
            }, pollAfter);
          }
        });
      };
      pollFx();
    });
  }

  poll(
    datasourceAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: ITarget,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.queryId) {
        return grafanaAttrs
          .doRequest({
            url:
              '/api/v1/dataspaces/' +
              target.humioRepository +
              '/queryjobs/' +
              this.queryId,
            method: 'GET',
          })
          .then(
            res => {
              resolve(res);
            },
            err => {
              return this._handleErr(datasourceAttrs, grafanaAttrs, target, err).then(
                res => {
                  reject(res);
                },
              );
            },
          );
      } else {
        return Promise.resolve([]);
      }
    });
  }

  cancel(
    datasourceAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: ITarget,
  ): Promise<any> {
    return new Promise(resolve => {
      if (this.queryId) {
        return grafanaAttrs
          .doRequest({
            url:
              '/api/v1/dataspaces/' +
              target.humioRepository +
              '/queryjobs/' +
              this.queryId,
            method: 'DELETE',
          })
          .then(() => {
            return resolve({});
          });
      } else {
        return resolve({});
      }
    });
  }

  composeQuery(
    datasourceAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: ITarget,
  ): Promise<any> {
    if (!target.humioRepository) {
      return Promise.resolve({data: {events: [], done: true}});
    }

    let isLive = this._queryIsLive(datasourceAttrs, grafanaAttrs)
    let newQueryDefinition = isLive ?
      this._makeLiveQueryDefinition(datasourceAttrs, grafanaAttrs, target.humioQuery) :
      this._makeStaticQueryDefinition(datasourceAttrs, grafanaAttrs, target.humioQuery);

    if (this._noQueryHasBeenExecutedYet() || this._queryDefinitionHasChanged(newQueryDefinition)) {
      this._updateQueryDefinition(newQueryDefinition)
      return this._startNewQuery(datasourceAttrs, grafanaAttrs, target)
    } else {
      return this.pollUntilDone(datasourceAttrs, grafanaAttrs, target);
    }
  }

  private _noQueryHasBeenExecutedYet(){
    return !this.queryId
  }

  private _startNewQuery(datasourceAttrs: IDatasourceAtts, 
    grafanaAttrs: IGrafanaAttrs,
    target: ITarget){
      return this.cancel(datasourceAttrs, grafanaAttrs, target).then(() => {
        return this.init(datasourceAttrs, grafanaAttrs, target);
      });
    }


  private _updateQueryDefinition(newQueryDefinition :UpdatedQueryDefinition){
    _.assign(this.queryDefinition, newQueryDefinition)
    if (newQueryDefinition.isLive && this.queryDefinition.end) {
      delete this.queryDefinition.end; // Grafana will throw errors if 'end' has been set on a live query
    }
  }

  private _queryDefinitionHasChanged(newQueryDefinition : UpdatedQueryDefinition){
    return JSON.stringify(this.queryDefinition) !== JSON.stringify(newQueryDefinition);
  }

  private _queryIsLive(datasourceAttrs: IDatasourceAtts,  grafanaAttrs: IGrafanaAttrs){
    let refresh = datasourceAttrs.$location
      ? datasourceAttrs.$location.search().refresh || null
      : null;
    let range = grafanaAttrs.grafanaQueryOpts.range;

    return refresh != null && HumioHelper.checkToDateNow(range.raw.to);
  }

  private _makeLiveQueryDefinition(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, humioQuery){
    let range = grafanaAttrs.grafanaQueryOpts.range;
    let start = HumioHelper.parseDateFrom(range.raw.from);

    return {
      isLive: true,
      queryString: humioQuery,
      start: start,
    };
  }

  private _makeStaticQueryDefinition(datasourceAttrs: IDatasourceAtts, grafanaAttrs: IGrafanaAttrs, humioQuery){
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

  private _handleErr(
    datasourceAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: ITarget,
    err: Object,
  ): Promise<any> {
    switch (err['status']) {
      case 404: {
        // NOTE: query not found - trying to recreate
        this.failCounter += 1;
        this.queryId = null;
        if (this.failCounter <= 3) {
          return this.composeQuery(datasourceAttrs, grafanaAttrs, target);
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

export default HumioQuery;
