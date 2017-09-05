import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv, $location) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.$location = $location;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;


    // NOTE: humio specific options
    this.token = instanceSettings.jsonData.humioToken;
    this.humioDataspace = instanceSettings.jsonData.humioDataspace;

    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + instanceSettings.jsonData.humioToken
    };

    // TODO: remove
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }

    // NOTE: session query storage
    this.queryParams = {
      queryId: null,
    };

  }

  query(options) {

    var query = this.buildQueryParameters(options);

    console.log('the options ->');
    console.log(options);

    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets.length <= 0) {
      return this.q.when({
        data: []
      });
    }

    var dt = {
      "queryString": "timechart()",
      "timeZoneOffsetMinutes": 180,
      "showQueryEventDistribution": false,
      "start": "5m"
    }

    let composedQuery = this._composeQuery(dt);
    return composedQuery.then((r) => {

      var convertEvs = (evs) => {
        return evs.map((ev) => {
          return [ev._count, ev._bucket];
        })
      };

      r.data = [{
        target: "_count",
        datapoints: convertEvs(r.data.events)
      }]

      return r;

    });
  }

  _composeQuery(queryDt) {
    let refresh = this.$location.search().refresh || null;
    queryDt.isLive = refresh != null;
    if (refresh) {
      return this._composeLiveQuery(queryDt);
    } else {
      return this._initQuery(queryDt).then((r) => {
        return this._pollQuery(r.data.id);
      });
    }
  }

  _composeLiveQuery(queryDt) {
    if (this.queryParams.queryId == null) {
      return this._initQuery(queryDt).then((r) => {
        this.queryParams.queryId = r.data.id;
        return this._pollQuery(r.data.id);
      });
    } else {
      return this._pollQuery(this.queryParams.queryId);
    }
  }

  _initQuery(queryDt) {
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + this.humioDataspace + '/queryjobs',
      data: queryDt,
      method: 'POST',
    })
  }

  _pollQuery(queryId) {
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + this.humioDataspace + '/queryjobs/' + queryId,
      method: 'GET',
    })
  }

  testDatasource() {
    console.log("-> 10");
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
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

  annotationQuery(options) {
    var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    var annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.doRequest({
      url: this.url + '/annotations',
      method: 'POST',
      data: annotationQuery
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(query) {
    // TODO: for now handling only timechart queries
    return [{
      text: "_count",
      value: "_count",
    }];
  }

  mapToTextValue(result) {
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return {
          text: d.text,
          value: d.value
        };
      } else if (_.isObject(d)) {
        return {
          text: d,
          value: i
        };
      }
      return {
        text: d,
        value: d
      };
    });
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });

    options.targets = targets;

    return options;
  }
}
