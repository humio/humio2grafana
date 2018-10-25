///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import HumioHelper from './helper';
import IDatasourceAtts from './Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from './Interfaces/IGrafanaAttrs';
import HumioQuery from './HumioQuery';

class DsPanel {
  queries: Map<number, HumioQuery>;

  constructor() {
    this.queries = new Map<number, HumioQuery>();
  }

  async update(
    dsAttrs: IDatasourceAtts,
    grafanaAttrs: IGrafanaAttrs,
    targets: any[],
  ): Promise<{data: Array<{target: string, datapoints: any[]}>}> {
    let allQueryPromise = targets.map((target: any, index: number) => {
      let query = this.queries.get(index);
      if (!query) {
        query = new HumioQuery(target.humioQuery);
        this.queries.set(index, query);
      }
      return query.composeQuery(dsAttrs, grafanaAttrs, target);
    });

    const responseList = await Promise.all(allQueryPromise);

    const result = _.flatMap(responseList, (res, index) => {

      const dt = res.data;
      const timeseriesField = '_bucket';
      const isTimechart = dt.metaData.extraData.timechart == 'true';
      const isAggregate = dt.metaData.isAggregate;
      const seriesField = dt.metaData.extraData.series;
      const groupbyFields = dt.metaData.extraData.groupby_fields;
      const valueField = _.filter(dt.metaData.fieldOrder, f => {
        return (
          f !== timeseriesField &&
          f !== seriesField &&
          f !== groupbyFields
        );
      })[0] || '_count';

      if (res.data.events.length === 0) {
        return [];
      } else if (seriesField) {
        return this._composeTimechartData(seriesField, dt, valueField);
      } else if (isTimechart) {
        return [{
          target: valueField,
          datapoints: dt.events.map(ev => {
            return [parseFloat(ev[valueField]), parseInt(ev._bucket)];
          }),
        }];
      } else {
        // NOTE: consider to be a barchart
        return dt.events.map(ev => {
          if (_.keys(ev).length > 1) {
            return {
              target: ev[groupbyFields],
              datapoints: [
                [parseFloat(ev[valueField]), '_' + ev[groupbyFields]],
              ],
            };
          } else {
            return {
              target: valueField,
              datapoints: [[parseFloat(ev[valueField]), valueField]],
            };
          }
        });
      }
    });

    return {data: result};
  }

  // NOTE: Multiple series timecharts
  private _composeTimechartData(
    seriesField: string,
    data: Object[],
    valueField: string,
  ): {target: string; datapoints: number[][]}[] {
    let series: Object = {};
    // multiple series
    for (let i = 0; i < data['events'].length; i++) {
      let ev = data['events'][i];
      let point = [parseFloat(ev[valueField]), parseInt(ev._bucket)];
      if (!series[ev[seriesField]]) {
        series[ev[seriesField]] = [point];
      } else {
        series[ev[seriesField]].push(point);
      }
    }
    return _.keys(series).map(s => {
      return {
        target: s,
        datapoints: series[s],
      };
    });
  }

  private _composeResult(
    queryOptions: any,
    r: any,
    resFx: any,
    errorCb: (errorTitle: string, errorBody: any) => void,
  ) {
    let currentTarget = queryOptions.targets[0];
    if (
      currentTarget.hasOwnProperty('type') &&
      (currentTarget.type === 'timeserie' || currentTarget.type === 'table') &&
      (r.data.hasOwnProperty('metaData') &&
        r.data.metaData.hasOwnProperty('extraData') &&
        r.data.metaData.extraData.timechart === 'true')
    ) {
      // NOTE: timechart
      return resFx();
    } else if (
      !currentTarget.hasOwnProperty('type') &&
      (r.data.hasOwnProperty('metaData') &&
        r.data.metaData.isAggregate === true)
    ) {
      // NOTE: gauge
      return resFx();
    } else {
      // NOTE: unsuported query for this type of panel
      errorCb('alert-error', [
        'Unsupported visualisation',
        "can't visulize the query result on this panel.",
      ]);
      return {
        data: [],
      };
    }
  }
}

export default DsPanel;
