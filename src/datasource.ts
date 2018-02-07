///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import HumioHelper from "./helper";
import DsPanel from "./DsPanel";
import DsPanelStorage from "./DsPanelStorage";
import IDatasourceAttrs from "./Interfaces/IDatasourceAttrs";
import IGrafanaAttrs from "./Interfaces/IGrafanaAttrs";

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
    };

    this.templateSrv = templateSrv;

    this.headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " +
        (instanceSettings.jsonData ? (instanceSettings.jsonData.humioToken || "") :
          "")
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

    // TODO: take a look at the second argument
    let dsPanel = this.dsPanelStorage.getOrGreatePanel(panelId);

    if (dsPanel) {
      let grafanaAttrs: IGrafanaAttrs = {
        grafanaQueryOpts: options,
        errorCb: (errorTitle, errorBody) => {
          this.dsAttrs.$rootScope.appEvent(errorTitle, errorBody);
        },
        doRequest: this.doRequest
      };
      return dsPanel.update(this.dsAttrs, grafanaAttrs, options.targets);
    } else {
      // TODO: handle the case
      return this.dsAttrs.$q.resolve({
        data: []
      });
    }
  }

  testDatasource() {
    return this.doRequest({
      url: "/api/v1/users/current",
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

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    options.url = this.url + options.url; // NOTE: adding base
    return this.dsAttrs.backendSrv.datasourceRequest(options);
  }
}
