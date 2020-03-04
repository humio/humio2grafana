///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import _ from 'lodash';
import IDatasourceAttrs from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import ITarget from '../Interfaces/ITarget';
import HumioQuery from './humio_query';

class Panel {
  queries: Map<number, HumioQuery>;

  constructor() {
    this.queries = new Map<number, HumioQuery>();
  }

  async update(datasourceAttrs: IDatasourceAttrs, grafanaAttrs: IGrafanaAttrs, targets: ITarget[]):
   Promise<{data: Array<{target: string, datapoints: Array<[number, number]>}>}> {
    let allQueryPromise = targets.map((target: ITarget, index: number) => {
      let query = this.queries.get(index);
      if (!query) {
        query = new HumioQuery(target.humioQuery);
        this.queries.set(index, query);
      }
      return query.composeQuery(datasourceAttrs, grafanaAttrs, target);
    });

    const queryResponses = await Promise.all(allQueryPromise);

    const result = _.flatMap(queryResponses, (res, index) => {
      const data = res.data;
      if (res.data.events.length === 0) {
        return [];
      }

      const isTable = this._isTableQuery(targets[index]);
      const isTimechart = data.metaData.extraData.timechart == 'true';
      const seriesField = data.metaData.extraData.series;
      const groupbyFields = data.metaData.extraData.groupby_fields;
      const valueField = getValueFieldName(data);

      if (isTable) {
        return this._composeTable(data.events, data.metaData.fieldOrder);
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

  //TODO: Mash together with the multi-series case?
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

  private _composeBarChart(events, groupByFields, valueField) {
    return _.flatMap(events, (event) => {
      const groupName = groupByFields.split(',').map(field => '[' + event[field.trim()] + ']').join(' ');
      if (_.keys(event).length > 1) {
        return {
          target: groupName,
          datapoints: [[parseFloat(event[valueField])]],
        };
        // Move to own function catching single value.
      } else {
        return {
          //target: valueField,
          datapoints: [[parseFloat(event[valueField]), event[groupByFields]]],
        };
      }
    });
  }

  private _composeTable(rows: Array<object>, columns: Array<string>) {
    return [{
      columns: columns.map(column => { return { text: column } }),
      rows: rows.map(row => columns.map(column => row[column])),
      type: 'table'
    }];
  }

    private _isTableQuery(target): boolean {
    return typeof (target.humioQuery) === 'string'
      // Check search string for 'table(*)'.
      ? new RegExp(/(table\()(.+)(\))/).exec(target.humioQuery) !== null
      : false;
  }
}

export const getValueFieldName = (responseData) => {
  const timeseriesField = '_bucket';
  const seriesField = responseData.metaData.extraData.series;
  const groupByFields = responseData.metaData.extraData.groupby_fields;
  let groupByFieldsSplit = [];
  if(groupByFields)
  {
    groupByFieldsSplit = groupByFields.split(',').map(field => field.trim());
  }
  const valueFieldsToExclude = _.flatten([timeseriesField, seriesField, groupByFieldsSplit]);
  const defaultValueFieldName = '_count';

  if (responseData.metaData.fieldOrder) {
    const valueFieldNames = _.filter(
      responseData.metaData.fieldOrder,
      fieldName => !_.includes(valueFieldsToExclude, fieldName) // TODO: Figure out what this does?
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

export default Panel;
