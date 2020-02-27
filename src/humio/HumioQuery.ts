import {QueryData, UpdateQueryData} from '../Types/QueryData';
import IDatasourceAtts from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import HumioHelper from './helper';
import _ from 'lodash';

class HumioQuery {
  queryId: string;
  data: QueryData;
  failCounter: number;

  constructor(queryStr: string) {
    this.data = {
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

  // NOTE: returns true if data is updated
  updateQueryData(newData: UpdateQueryData): boolean {
    let oldData = _.clone(this.data);
    _.assign(this.data, newData);
    if (this.data.isLive && this.data.end) {
      delete this.data.end;
    }
    return JSON.stringify(this.data) !== JSON.stringify(oldData);
  }

  // NOTE: manage query
  init(
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: any,
  ): Promise<any> {
    return new Promise(resolve => {
      return grafanaAttrs
        .doRequest({
          url: '/api/v1/dataspaces/' + target.humioDataspace + '/queryjobs',
          data: this.data,
          method: 'POST',
        })
        .then(
          res => {
            this.queryId = res['data'].id;
            this.pollUntillDone(dsAttrs, grafanaAttrs, target).then(res => {
              resolve(res);
            });
          },
          err => {
            this._handleErr(dsAttrs, grafanaAttrs, target, err).then(res => {
              resolve(res);
            });
          },
        );
    });
  }

  pollUntillDone(
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: any,
  ): Promise<any> {
    return new Promise(resolve => {
      let pollFx = () => {
        this.poll(dsAttrs, grafanaAttrs, target).then(res => {
          // console.log("" + (res["data"].metaData.workDone / res["data"].metaData.totalWork * 100).toFixed(2) + "%");
          if (res['data'].done) {
            // NOTE: for static queries id no longer makes sense
            if (!this.data.isLive) {
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
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.queryId) {
        return grafanaAttrs
          .doRequest({
            url:
              '/api/v1/dataspaces/' +
              target.humioDataspace +
              '/queryjobs/' +
              this.queryId,
            method: 'GET',
          })
          .then(
            res => {
              resolve(res);
            },
            err => {
              return this._handleErr(dsAttrs, grafanaAttrs, target, err).then(
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
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: any,
  ): Promise<any> {
    return new Promise(resolve => {
      if (this.queryId) {
        return grafanaAttrs
          .doRequest({
            url:
              '/api/v1/dataspaces/' +
              target.humioDataspace +
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

  // NOTE: composing query
  composeQuery(
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: any,
  ): Promise<any> {
    let refresh = dsAttrs.$location
      ? dsAttrs.$location.search().refresh || null
      : null;
    let range = grafanaAttrs.grafanaQueryOpts.range;

    let isLive = refresh != null && HumioHelper.checkToDateNow(range.raw.to);
    if (target.humioDataspace) {
      if (isLive) {
        return this._composeLiveQuery(dsAttrs, grafanaAttrs, target);
      } else {
        return this._composeStaticQuery(dsAttrs, grafanaAttrs, target);
      }
    } else {
      return Promise.resolve({data: {events: [], done: true}});
    }
  }

  private _composeLiveQuery(
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: any,
  ): Promise<any> {
    let range = grafanaAttrs.grafanaQueryOpts.range;
    let start = HumioHelper.parseDateFrom(range.raw.from);
    // TODO: CONSIDER changing dataspace as well
    let queryUpdated = this.updateQueryData({
      start: start,
      isLive: true,
      queryString: target.humioQuery,
    });

    if (!this.queryId || queryUpdated) {
      return this.cancel(dsAttrs, grafanaAttrs, target).then(() => {
        return this.init(dsAttrs, grafanaAttrs, target);
      });
    } else {
      return this.pollUntillDone(dsAttrs, grafanaAttrs, target);
    }
  }

  private _composeStaticQuery(
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: any,
  ): Promise<any> {
    let range = grafanaAttrs.grafanaQueryOpts.range;
    let start = range.from._d.getTime();
    let end = range.to._d.getTime();

    // TODO: CONSIDER changing dataspace as well
    let queryUpdated = this.updateQueryData({
      start: start,
      end: end,
      isLive: false,
      queryString: target.humioQuery,
    });

    if (this.queryId && !queryUpdated) {
      return this.pollUntillDone(dsAttrs, grafanaAttrs, target);
    } else {
      return this.cancel(dsAttrs, grafanaAttrs, target).then(() => {
        return this.init(dsAttrs, grafanaAttrs, target);
      });
    }
  }

  private _handleErr(
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    target: any,
    err: Object,
  ): Promise<any> {
    switch (err['status']) {
      case 404: {
        // NOTE: query not found - trying to recreate
        this.failCounter += 1;
        this.queryId = null;
        if (this.failCounter <= 3) {
          return this.composeQuery(dsAttrs, grafanaAttrs, target);
        } else {
          this.failCounter = 0;
          grafanaAttrs.errorCb('alert-error', [
            'failed to create query',
            'tried 3 times',
          ]);
          return Promise.resolve({data: {events: [], done: true}});
        }
      }
      case 400: {
        grafanaAttrs.errorCb('alert-error', ['bad query', err['data']]);
        return Promise.resolve({data: {events: [], done: true}});
      }
      default: {
        grafanaAttrs.errorCb('alert-error', err['data']);
        return Promise.resolve({data: {events: [], done: true}});
      }
    }
  }
}

export default HumioQuery;
