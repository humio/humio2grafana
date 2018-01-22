import * as _ from "lodash";
import HumioHelper from "./helper";

interface IQueryData {
  queryString: string
  timeZoneOffsetMinutes: number,
  showQueryEventDistribution: boolean,
  isLive: boolean,
  start: string,
  end?: string | null
}

class DsPanel {

  queryId: string | null;
  failCounter: number;

  queryData: IQueryData;

  constructor(queryStr: string, backendSrv: any) {
    this.queryData = {
      queryString: queryStr,
      timeZoneOffsetMinutes: -(new Date()).getTimezoneOffset(),
      showQueryEventDistribution: false,
      start: "24h",
      isLive: false
    };

    this.queryId = null;
    this.failCounter = 0;
  }

  update(backendSrv: any, $q: any, $location: any, grafanaQueryOpts: any, humioQueryStr: string, humioDataspace: string,
    errorCb: (errorTitle: string, errorBody: any) => void, doRequest: (data: any) => any): any {

    return $q((resolve, reject) => {
      let handleErr = (err) => {
        console.log("fallback ->");
        console.log(err);
        // TODO: add a counter, if several times get a error - consider query to be
        // invalid, or distinguish between error types
        if (err.status === 401) {
          // NOTE: query not found - trying to recreate
          this.setQueryId(null);
          this.incFailCounter();
          if (this.failCounter <= 3) {
            this._composeQuery($location, this.getQueryData(), grafanaQueryOpts, humioDataspace, doRequest)
              .then(handleRes, handleErr);
          } else {
            this.resetFailCounter()
          }
        } else {
          if (err.status = 400) {
            errorCb("Query error", err.data);
          } else {
            errorCb(err.status.toString(), err.data);
          }
          resolve({
            data: []
          });
        }
      }

      let handleRes = (r) => {
        if (r.data.done) {
          console.log("query done");
          this.resetFailCounter();
          // TODO: move this check to DsPanel;
          this.setQueryId(this.queryData.isLive ? this.queryId : null);

          resolve(this._composeResult(grafanaQueryOpts, r, () => {
            let dt = _.clone(r.data);
            let timeseriesField = "_bucket";
            let seriesField = dt.metaData.extraData.series;
            let series = {};
            let valueField = _.filter(dt.metaData.fields, (f) => {
              return f["name"] !== timeseriesField && f["name"] !== seriesField;
            })[0]["name"];

            // NOTE: aggregating result
            if (seriesField) {
              // multiple series
              for (let i = 0; i < r.data.events.length; i++) {
                let ev = r.data.events[i];
                if (!series[ev[seriesField]]) {
                  series[ev[seriesField]] = [
                    [ev[valueField], parseInt(ev._bucket)]
                  ];
                } else {
                  series[ev[seriesField]].push([ev[valueField], parseInt(ev._bucket)]);
                }
              }
              r.data = _.keys(series).map((s) => {
                return {
                  target: s,
                  datapoints: series[s]
                }
              })
            } else {
              // NOTE: single series
              if (dt.events.length === 1) {
                // NOTE: consider to be gauge
                r.data = dt.events.map((ev) => {
                  return {
                    target: valueField,
                    datapoints: [[parseFloat(ev[valueField]), valueField]]
                  }
                });
              } else {
                // NOTE: consider to be a barchart
                r.data = dt.events.map((ev) => {
                  return {
                    target: ev[valueField],
                    datapoints: [[parseFloat(ev._count), "_" + ev[valueField]]]
                  }
                });
              }
            }
            return r;
          }, errorCb));
        } else {
          console.log("query running...");
          console.log("" + (r.data.metaData.workDone / r.data.metaData.totalWork * 100).toFixed(2) + "%");
          setTimeout(() => {
            this._composeQuery($location, this.getQueryData(), grafanaQueryOpts, humioDataspace, doRequest)
              .then(handleRes, handleErr);
          }, 1000);
        }
      }

      this._composeQuery($location, this.getQueryData(), grafanaQueryOpts, humioDataspace, doRequest)
        .then(handleRes, handleErr);
    });
  }

  _composeResult(queryOptions: any, r: any, resFx: any, errorCb: (errorTitle: string, errorBody: any) => void) {
    let currentTarget = queryOptions.targets[0];
    if ((currentTarget.hasOwnProperty("type") &&
        ((currentTarget.type === "timeserie") || (currentTarget.type === "table")) &&
        (r.data.hasOwnProperty("metaData") && r.data.metaData.hasOwnProperty("extraData") &&
          r.data.metaData.extraData.timechart === "true"))) {
      // NOTE: timechart
      return resFx();
    } else if (!currentTarget.hasOwnProperty("type") &&
      (r.data.hasOwnProperty("metaData") && r.data.metaData.isAggregate === true)) {
      // NOTE: gauge
      return resFx();
    } else {
      // NOTE: unsuported query for this type of panel
      errorCb("alert-error", ["Unsupported visualisation", "can\'t visulize the query result on this panel."]);
      return {
        data: []
      }
    }
  }

  private _composeQuery($location: any, queryDt, grafanaQueryOpts, humioDataspace, doRequest: (data: any) => any) {
    let refresh = $location ? ($location.search().refresh || null) : null;
    let range = grafanaQueryOpts.range;

    queryDt.isLive = ((refresh != null) && (HumioHelper.checkToDateNow(range.raw.to)));

    // NOTE: setting date range
    if (queryDt.isLive) {
      queryDt.start = HumioHelper.parseDateFrom(range.raw.from);

      // TODO: shoudl be moved to _updateQueryParams
      this._stopUpdatedQuery(queryDt, humioDataspace, doRequest);

      this.updateQueryParams(queryDt);
      return this._composeLiveQuery(queryDt, humioDataspace, doRequest);
    } else {

      // TODO: shoudl be moved to _updateQueryParams
      this._stopUpdatedQuery(queryDt, humioDataspace, doRequest);

      if (this.queryId != null) {
        return this._pollQuery(this.queryId, humioDataspace, doRequest);
      } else {
        queryDt.start = range.from._d.getTime();
        queryDt.end = range.to._d.getTime();

        // TODO: shoudl be moved to _updateQueryParams
        this._stopUpdatedQuery(queryDt, humioDataspace, doRequest);

        this.updateQueryParams(queryDt);
        return this._initQuery(this.getQueryData(), humioDataspace, doRequest).then((r) => {
          this.setQueryId(r.data.id);
          this.updateQueryParams({isLive: false});
          return this._pollQuery(r.data.id, humioDataspace, doRequest);
        });
      };
    };
  }

  _stopUpdatedQuery(queryDt: Object, humioDataspace: string, doRequest: (data: any) => any) {
    // TODO: move this to DsPanel completely;
    if (JSON.stringify(this.getQueryData()) !== JSON.stringify(queryDt)) {
      console.log("STOP!");
      if (this.queryId) {
        // TODO: make a promise
        this._stopExecution(this.queryId, humioDataspace, doRequest);
      }
      this.setQueryId(null);
      this.updateQueryParams(queryDt);
    };
  }

  _composeLiveQuery(queryDt, humioDataspace, doRequest: (data: any) => any) {
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

  _initQuery(queryDt, humioDataspace, doRequest: (data: any) => any) {
    return doRequest({
      url: "/api/v1/dataspaces/" + humioDataspace + "/queryjobs",
      data: queryDt,
      method: "POST",
    });
  }

  _pollQuery(queryId, humioDataspace, doRequest: (data: any) => any) {
    return doRequest({
      url: "/api/v1/dataspaces/" + humioDataspace + "/queryjobs/" + queryId,
      method: "GET",
    });
  }

  _stopExecution(queryId, humioDataspace, doRequest: (data: any) => any) {
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
