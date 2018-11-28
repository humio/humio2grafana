///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
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
  ): Promise<{data: Array<{target: string, datapoints: Array<[number, number]>}>}> {
    let allQueryPromise = targets.map((target: any, index: number) => {
      let query = this.queries.get(index);
      if (!query) {
        query = new HumioQuery(target.humioQuery);
        this.queries.set(index, query);
      }
      return query.composeQuery(dsAttrs, grafanaAttrs, target);
    });

    const responseList = await Promise.all(allQueryPromise);

    const result = _.flatMap(responseList, (res) => {
      const data = res.data;
      const isTimechart = data.metaData.extraData.timechart == 'true';
      const seriesField = data.metaData.extraData.series;
      const groupbyFields = data.metaData.extraData.groupby_fields;

      const valueField = getValueFieldName(data);

      if (res.data.events.length === 0) {
        return [];
      } else if (seriesField) {
        return this._composeMultiSeriesTimechart(data.events, seriesField, valueField);
      } else if (isTimechart) {
        return this._composeSingleSeriesTimechart(data.events, valueField);
      } else {
        return this._composeBarChart(data.events, groupbyFields, valueField)
      }
    });

    return {data: result};
  }

  private _composeSingleSeriesTimechart(events, valueField: string) {
    return [{
      target: valueField,
      datapoints: events.map(event => {
        return [parseFloat(event[valueField]), parseInt(event._bucket)];
      }),
    }];
  }

  private _composeMultiSeriesTimechart(
    events: any,
    seriesField: string,
    valueField: string,
  ): {target: string; datapoints: number[][]}[] {
    let series: Object = {};
    // multiple series
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      let point = [parseFloat(event[valueField]), parseInt(event._bucket)];
      if (!series[event[seriesField]]) {
        series[event[seriesField]] = [point];
      } else {
        series[event[seriesField]].push(point);
      }
    }
    return _.keys(series).map(s => {
      return {
        target: s,
        datapoints: series[s],
      };
    });
  }

  private _composeBarChart(events, groupbyFields, valueField) {
    return events.map(event => {
      if (_.keys(event).length > 1) {
        return {
          target: event[groupbyFields],
          datapoints: [
            [parseFloat(event[valueField]), '_' + event[groupbyFields]],
          ],
        };
      } else {
        return {
          target: valueField,
          datapoints: [[parseFloat(event[valueField]), valueField]],
        };
      }
    });
  }
}

export const getValueFieldName = (responseData) => {
  const timeseriesField = '_bucket';
  const seriesField = responseData.metaData.extraData.series;
  const groupbyFields = responseData.metaData.extraData.groupby_fields;
  const valueFieldsToExclude = _.flatten([timeseriesField, seriesField, groupbyFields]);
  const defaultValueFieldName = '_count';

  if (responseData.metaData.fieldOrder) {
    const valueFieldNames = _.filter(
      responseData.metaData.fieldOrder,
      fieldName => !_.includes(valueFieldsToExclude, fieldName)
    ); 
    
    return valueFieldNames[0] || defaultValueFieldName;
  }

  if (responseData.events.length > 0) {
    const valueFieldNames = responseData.events.reduce((allFieldNames, event) => {
      const valueFields = _.difference(Object.keys(event), valueFieldsToExclude);
      
      return [...valueFields, ...allFieldNames];
    }, []);

    return valueFieldNames[0] || defaultValueFieldName;
  }

  return defaultValueFieldName;
}

export default DsPanel;
