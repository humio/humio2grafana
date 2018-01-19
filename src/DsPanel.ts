import * as _ from "lodash";

class DsPanel {

  queryId: string | null;

  queryData: Object;
  // {
  //   queryString: string
  //   timeZoneOffsetMinutes: number,
  //   showQueryEventDistribution: boolean,
  //   start: string | null,
  //   end: string | null
  // };

  backendSrv: any;

  failCounter: number;



  // headers = {
  //   'Content-Type': string,
  //   'Authorization': string
  // };

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

    this.backendSrv = backendSrv;
  }

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
