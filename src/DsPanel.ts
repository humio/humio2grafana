///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from "lodash";
import HumioHelper from "./helper";
import IQueryData from "./Interfaces/IQueryData";
import IDatasourceAtts from "./Interfaces/IDatasourceAttrs";
import IQueryAttrs from "./Interfaces/IQueryAttrs";
import RequestStatus from "./Enums/RequestStatus";

class DsPanel {

  queryId: string;
  failCounter: number;
  requestStatus: RequestStatus;
  queryData: IQueryData;

  constructor(queryStr: string) {
    this.queryData = {
      queryString: queryStr,
      timeZoneOffsetMinutes: -(new Date()).getTimezoneOffset(),
      showQueryEventDistribution: false,
      start: "24h",
      isLive: false
    };

    this.queryId = null;
    this.failCounter = 0;
    this.requestStatus = RequestStatus.INITIAL;

    this._handleErr = this._handleErr.bind(this);
  }

  update(dsAttrs: IDatasourceAtts, queryAttrs: IQueryAttrs): any {
    return dsAttrs.$q((resolve, reject) => {
      this._composeQuery(dsAttrs, queryAttrs, this.getQueryData())
        .then((result) => {
          this._handleRes(dsAttrs, queryAttrs, result, resolve);
        }, (err: Object) => {
          this._handleErr(dsAttrs, queryAttrs, err, resolve);
        });
    });
  }

  private _handleRes(dsAttrs: IDatasourceAtts, queryAttrs: IQueryAttrs, res: Object, resolve: any): any {
    if (res["data"].done) {
      console.log("query done");
      this.resetFailCounter();
      // TODO: move this check to DsPanel;
      this.setQueryId(this.queryData.isLive ? this.queryId : null);

      resolve(this._composeResult(queryAttrs.grafanaQueryOpts, res, () => {
        if (res["data"].events.length === 0) {
          res["data"] = [];
        } else {
          let dt = res["data"];
          let timeseriesField = "_bucket";
          let isTimechart = dt.metaData.extraData.timechart === "true";
          let seriesField = dt.metaData.extraData.series;
          let series = {};
          let valueField = _.filter(dt.metaData.fields, (f) => {
            return f["name"] !== timeseriesField && f["name"] !== seriesField;
          })[0]["name"];

          // NOTE: aggregating result
          if (seriesField) {
            // multiple series
            for (let i = 0; i < res["data"].events.length; i++) {
              let ev = res["data"].events[i];
              if (!series[ev[seriesField]]) {
                series[ev[seriesField]] = [
                  [ev[valueField], parseInt(ev._bucket)]
                ];
              } else {
                series[ev[seriesField]].push([ev[valueField], parseInt(ev._bucket)]);
              }
            }
            res["data"] = _.keys(series).map((s) => {
              return {
                target: s,
                datapoints: series[s]
              }
            })
          } else {
            // NOTE: single series
            if (dt.events.length === 1) {
              // NOTE: consider to be gauge
              res["data"] = dt.events.map((ev) => {
                return {
                  target: valueField,
                  datapoints: [[parseFloat(ev[valueField]), valueField]]
                }
              });
            } else {
              if (isTimechart) {
                res["data"] = [{
                  target: "_count",
                  datapoints: dt.events.map((ev) => {
                    return [parseFloat(ev._count), parseInt(ev._bucket)];
                  })
                }];
              } else {
                // NOTE: consider to be a barchart
                res["data"] = dt.events.map((ev) => {
                  return {
                    target: ev[valueField],
                    datapoints: [[parseFloat(ev._count), "_" + ev[valueField]]]
                  }
                });
              }
            }
          }
        }
        return res;
      }, queryAttrs.errorCb));
    } else {
      console.log("query running...");
      console.log("" + (res["data"].metaData.workDone / res["data"].metaData.totalWork * 100).toFixed(2) + "%");
      setTimeout(() => {
        this._composeQuery(dsAttrs, queryAttrs, this.getQueryData())
          .then((result) => {
            this._handleRes(dsAttrs, queryAttrs, result, resolve);
          }, (err) => {
            // TODO: handle error
            resolve({
              data: []
            });
          });
      }, 1000);
    }
  }

  private _handleErr(dsAttrs: IDatasourceAtts, queryAttrs: IQueryAttrs, err: Object, resolve: any): any {
    // TODO: add a counter, if several times get a error - consider query to be
    // invalid, or distinguish between error types
    switch (err["status"]) {
      case (401): {
        // NOTE: query not found - trying to recreate
        this.setQueryId(null);
        this.incFailCounter();
        if (this.failCounter <= 3) {
          this._composeQuery(dsAttrs, queryAttrs, this.getQueryData())
            .then((result) => {
              this._handleRes(dsAttrs, queryAttrs, result, resolve);
            }, (err: Object) => {
              this._handleErr(dsAttrs, queryAttrs, err, resolve);
            });
        } else {
          this.resetFailCounter()
        }
      } break;
      case (400): {
        queryAttrs.errorCb("Query error", err["data"]);
        resolve({data: []});
      } break;
      default: {
        queryAttrs.errorCb(err["status"].toString(), err["data"]);
        resolve({data: []});
      }
    }
  }

  private _composeResult(queryOptions: any, r: any, resFx: any,
    errorCb: (errorTitle: string, errorBody: any) => void) {
    let currentTarget = queryOptions.targets[0];
    if ((currentTarget.hasOwnProperty("type") &&
        ((currentTarget.type === "timeserie") ||
        (currentTarget.type === "table")) &&
        (r.data.hasOwnProperty("metaData") &&
        r.data.metaData.hasOwnProperty("extraData") &&
          r.data.metaData.extraData.timechart === "true"))) {
      // NOTE: timechart
      return resFx();
    } else if (!currentTarget.hasOwnProperty("type") &&
      (r.data.hasOwnProperty("metaData") && r.data.metaData.isAggregate === true)) {
      // NOTE: gauge
      return resFx();
    } else {
      // NOTE: unsuported query for this type of panel
      errorCb("alert-error", [
        "Unsupported visualisation",
        "can\'t visulize the query result on this panel."
      ]);
      return {
        data: []
      }
    }
  }

  private _composeQuery(dsAttrs: IDatasourceAtts, queryAttrs: IQueryAttrs, queryDt: any) {
    let refresh = dsAttrs.$location ? (dsAttrs.$location.search().refresh || null) : null;
    let range = queryAttrs.grafanaQueryOpts.range;

    queryDt.isLive = ((refresh != null) && (HumioHelper.checkToDateNow(range.raw.to)));

    // NOTE: setting date range
    if (queryDt.isLive) {
      queryDt.start = HumioHelper.parseDateFrom(range.raw.from);

      // TODO: shoudl be moved to _updateQueryParams
      this._stopUpdatedQuery(queryDt, queryAttrs.humioDataspace, queryAttrs.doRequest);

      this.updateQueryParams(queryDt);
      return this._composeLiveQuery(queryDt, queryAttrs.humioDataspace, queryAttrs.doRequest);
    } else {

      // TODO: shoudl be moved to _updateQueryParams
      this._stopUpdatedQuery(queryDt, queryAttrs.humioDataspace, queryAttrs.doRequest);

      if (this.queryId != null) {
        return this._pollQuery(this.queryId, queryAttrs.humioDataspace, queryAttrs.doRequest);
      } else {
        queryDt.start = range.from._d.getTime();
        queryDt.end = range.to._d.getTime();

        // TODO: shoudl be moved to _updateQueryParams
        this._stopUpdatedQuery(queryDt, queryAttrs.humioDataspace, queryAttrs.doRequest);

        this.updateQueryParams(queryDt);
        return this._initQuery(this.getQueryData(), queryAttrs.humioDataspace,
          queryAttrs.doRequest).then((r) => {
          this.setQueryId(r.data.id);
          this.updateQueryParams({isLive: false});
          return this._pollQuery(r.data.id, queryAttrs.humioDataspace, queryAttrs.doRequest);
        });
      };
    };
  }

  private _stopUpdatedQuery(queryDt: Object, humioDataspace: string, doRequest: (data: any) => any) {
    if (JSON.stringify(this.getQueryData()) !== JSON.stringify(queryDt)) {
      if (this.queryId) {
        // TODO: make a promise
        this._stopExecution(this.queryId, humioDataspace, doRequest);
      }
      this.setQueryId(null);
      this.updateQueryParams(queryDt);
    };
  }

  private _composeLiveQuery(queryDt, humioDataspace, doRequest: (data: any) => any) {
    if (this.queryId == null) {
      return this._initQuery(this.getQueryData(), humioDataspace, doRequest).then((r) => {
        this.setQueryId(r.data.id);
        this.updateQueryParams({isLive: true});
        return this._pollQuery(r.data.id, humioDataspace, doRequest);
      });
    } else {
      return this._pollQuery(this.queryId, humioDataspace, doRequest);
    }
  }

  private _initQuery(queryDt, humioDataspace, doRequest: (data: any) => any) {
    return doRequest({
      url: "/api/v1/dataspaces/" + humioDataspace + "/queryjobs",
      data: queryDt,
      method: "POST",
    });
  }

  private _pollQuery(queryId, humioDataspace, doRequest: (data: any) => any) {
    return doRequest({
      url: "/api/v1/dataspaces/" + humioDataspace + "/queryjobs/" + queryId,
      method: "GET",
    });
  }

  private _stopExecution(queryId, humioDataspace, doRequest: (data: any) => any) {
    console.log("stopping execution");
    return doRequest({
      url: "/api/v1/dataspaces/" + humioDataspace + "/queryjobs/" + queryId,
      method: "DELETE",
    });
  }

  // *
  // * RECONSIDER FOLOWING
  // *
  getQueryData(): Object {
    let resObj = {};
    Object.keys(this.queryData).forEach((key) => {
      // NOTE: filtering null parameters;
      if (this.queryData[key] !== null) {
        resObj[key] = this.queryData[key];
      }
    });
    return resObj;
  }

  updateQueryParams(newQueryParams: Object) {
    _.assign(this.queryData, newQueryParams);
    this.cleanupQueryData();
  }

  cleanupQueryData() {
    if (this.queryData["isLive"]) {
      this.queryData["end"] = null;
    }
  }

  setQueryId(newId: string) {
    this.queryId = newId;
  }

  // TODO: deprecated;
  incFailCounter() {
    this.failCounter += 1;
  }

  resetFailCounter() {
    this.failCounter = 0;
  }
}

export default DsPanel;
