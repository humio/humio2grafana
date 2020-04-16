///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import _ from 'lodash';
import IDatasourceAttrs from '../Interfaces/IDatasourceAttrs';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import ITarget from '../Interfaces/ITarget';
import QueryJob from './query_job';
import HumioHelper from './humio_helper';
import { WidgetType } from '../Types/WidgetType';

/**
 * Keeps account of the different queryjobs running to populate a Grafana panel,
 * and converts their output to Grafana readable data formats.
 */
class QueryJobManager {
  static managers: Map<string, QueryJobManager> = new Map<string, QueryJobManager>();
  queries: Map<number, QueryJob>;

  constructor() {
    this.queries = new Map<number, QueryJob>();
  }

  static getOrCreateQueryJobManager(managerId: string): QueryJobManager {
    let manager = this.managers.get(managerId);
    if (!manager) {
      manager = new this();
      this.managers.set(managerId, manager);
    }
    return manager;
  }

  async update(datasourceAttrs: IDatasourceAttrs, grafanaAttrs: IGrafanaAttrs, targets: ITarget[]):
   Promise<{data: Array<{target: string, datapoints: Array<[number, number]>}>}> {
    const queryResponses = await this._executeAllQueries(datasourceAttrs, grafanaAttrs, targets)

    const listOfGrafanaDataSeries = _.flatMap(queryResponses, (res, index) => {
      return this._convertHumioQueryResponseToGrafanaFormat(res.data, targets[index])
    });
    return {data: listOfGrafanaDataSeries};
  }

  private async _executeAllQueries(datasourceAttrs: IDatasourceAttrs, grafanaAttrs: IGrafanaAttrs, targets: ITarget[]){
    let allQueryPromise = targets.map((target: ITarget, index: number) => 
    {
      let query = this._getOrCreateQueryJob(index, target.humioQuery);
      let res = query.executeQuery(datasourceAttrs, grafanaAttrs, target);
      return res;
    });

    return Promise.all(allQueryPromise);
  }

  private  _getOrCreateQueryJob(index, humioQuery){
    let query = this.queries.get(index);

      if (!query) {
        query = new QueryJob(humioQuery);
        this.queries.set(index, query);
      }

    return query;
  }

  private _convertHumioQueryResponseToGrafanaFormat(humioQueryResult, target){
    if (humioQueryResult.events.length === 0) {
      return [];
    }
    const valueFields = getValueFieldName(humioQueryResult);
    
    let widgetType = HumioHelper.widgetType(humioQueryResult, target);

    switch (widgetType) {
      case WidgetType.timechart: {
        let seriesField = humioQueryResult.metaData.extraData.series;
        if(!seriesField){
          seriesField = "placeholder";
          humioQueryResult.events = humioQueryResult.events.map(event => {event[seriesField] = valueFields[0]; return event});
        }
        return this._composeTimechart(humioQueryResult.events, seriesField, valueFields[0]);
      }
      case WidgetType.table:
        return this._composeTable(humioQueryResult.events, humioQueryResult.metaData.fieldOrder);
      case WidgetType.worldmap:
        return this._composeTable(humioQueryResult.events, valueFields); // The worldmap widget is also based on a table, however, with different inputs. 
      default: {
        return this._composeUntyped(humioQueryResult, valueFields[0]);
      }
    }
  }

  private _composeTimechart(events: any, seriesField: string, valueField: string): {target: string; datapoints: number[][]}[] {
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

  private _composeTable(rows: Array<object>, columns: Array<string>) {
    return [{
      columns: columns.map(column => { return { text: column } }),
      rows: rows.map(row => columns.map(column => row[column])),
      type: 'table'
    }];
  }
      
  private _composeUntyped(data, valueField) {
    return _.flatMap(data.events, (event) => {
      const groupbyFields = data.metaData.extraData.groupby_fields;
      if(groupbyFields) {
        const groupName = groupbyFields.split(',').map(field => '[' + event[field.trim()] + ']').join(' ');
        if (_.keys(event).length > 1) {
          return {
            target: groupName,
            datapoints: [[parseFloat(event[valueField])]],
          };
        }
      } else {
        return {
          target: valueField,
          datapoints: [[parseFloat(event[valueField])]],
        }
      }
    });
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
      fieldName => !_.includes(valueFieldsToExclude, fieldName)
    ); 
    
    return valueFieldNames || defaultValueFieldName;
  }

  if (responseData.events.length > 0) {
    const valueFieldNames = responseData.events.reduce((allFieldNames, event) => {
      const valueFields = _.difference(Object.keys(event), valueFieldsToExclude);
      
      return [...valueFields, ...allFieldNames];
    }, []);

    return valueFieldNames || defaultValueFieldName;
  }

  return defaultValueFieldName;
}

export default QueryJobManager;
