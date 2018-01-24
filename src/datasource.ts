///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import HumioHelper from "./helper";
import DsPanel from "./DsPanel";
import DsPanelStorage from "./DsPanelStorage";
import IDatasourceAttrs from "./Interfaces/IDatasourceAttrs";
import IQueryAttrs from "./Interfaces/IQueryAttrs";

export class GenericDatasource {
  type: string;
  url: string;
  name: string;

  dsAttrs: IDatasourceAttrs;

  templateSrv: any; // TODO: not sure if needed

  headers: any;

  dsPanelStorage: DsPanelStorage;
  withCredentials: boolean;

  timeRange: any; // FIXME: used by parent controller

  /** @ngInject */
  constructor(instanceSettings, $q, backendSrv, templateSrv, $location, $rootScope) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url ? instanceSettings.url.replace(/\/$/, "") : "";
    this.name = instanceSettings.name;

    this.dsAttrs = {
      $q: $q,
      $location: $location,
      backendSrv: backendSrv,
      $rootScope: $rootScope
    }


    this.templateSrv = templateSrv;

    this.headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " +
        (instanceSettings.jsonData ? (instanceSettings.jsonData.humioToken || "developer") :
          "developer")
    };

    this.dsPanelStorage = new DsPanelStorage();

    this.timeRange = null;

    this.doRequest = this.doRequest.bind(this);
  }

  query(options) {

    this.timeRange = options.range;

    // NOTE: if no tragests just return an empty result
    if (options.targets.length === 0) {
      return this.dsAttrs.$q.resolve({
        data: []
      });
    }

    let panelId = options.panelId;
    let humioQueryStr = options.targets[0].humioQuery;
    let humioDataspace = options.targets[0].humioDataspace;

    // NOTE: if no humio dataspace or no query - consider configuration invalid
    if (!humioDataspace || !humioQueryStr) {
      return this.dsAttrs.$q.resolve({
        data: []
      });
    }

    let dsPanel = this.dsPanelStorage.getOrGreatePanel(panelId, humioQueryStr);

    if (dsPanel) {
      let queryAttrs: IQueryAttrs = {
        grafanaQueryOpts: options,
        humioQueryStr: humioQueryStr,
        humioDataspace: humioDataspace,
        errorCb: (errorTitle, errorBody) => {
          this.dsAttrs.$rootScope.appEvent(errorTitle, errorBody);
        },
        doRequest: this.doRequest
      }


      return dsPanel.update(this.dsAttrs, queryAttrs);
    } else {
      // TODO: handle the case
      return this.dsAttrs.$q.resolve({
        data: []
      });
    }
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + "/",
      method: "GET",
    }).then(response => {
      if (response.status === 200) {
        return {
          status: "success",
          message: "Data source is working",
          title: "Success"
        };
      }
    });
  }

  // // TODO: handle annotationQuery
  // annotationQuery(options) {
  //   console.log("annotationQuery -> ");
  //   var query = this.templateSrv.replace(options.annotation.query, {}, "glob");
  //   var annotationQuery = {
  //     range: options.range,
  //     annotation: {
  //       name: options.annotation.name,
  //       datasource: options.annotation.datasource,
  //       enable: options.annotation.enable,
  //       iconColor: options.annotation.iconColor,
  //       query: query
  //     },
  //     rangeRaw: options.rangeRaw
  //   };
  //
  //   return this.doRequest({
  //     url: this.url + "/annotations",
  //     method: "POST",
  //     data: annotationQuery
  //   }).then(result => {
  //     return result.data;
  //   });
  // }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    options.url = this.url + options.url; // NOTE: adding base
    return this.dsAttrs.backendSrv.datasourceRequest(options);
  }

}
