import _ from 'lodash';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import QueryJob from './query_job';
import HumioHelper from './humio_helper';
import { WidgetType } from '../Types/WidgetType';
import { CSVQuery } from 'CSVDataSource';

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
    // See if the manager already exists.
    let manager = this.managers.get(managerId);
    if (!manager) {
      manager = new this();
      this.managers.set(managerId, manager);
    }

    return manager;
  }

  async update(
    location: Location,
    grafanaAttrs: IGrafanaAttrs,
    targets: CSVQuery[]
  ): Promise<{ data: Array<{ target: any; datapoints: Array<[number, number]> }> }> {
    const queryResponses = await this._executeAllQueries(location, grafanaAttrs, targets);
    const listOfGrafanaDataSeries = _.flatMap(queryResponses, (res, index) => {
      if (res.data.metaData.isAggregate) {
        return this._convertHumioQueryResponseToGrafanaFormat(res.data, targets[index]);
      } else {
        return this._convertHumioQueryResponseFromFilterQueryToGrafanaFormat(res.data, targets[index]);
      }
    });
    return { data: listOfGrafanaDataSeries };
  }

  private async _executeAllQueries(location: Location, grafanaAttrs: IGrafanaAttrs, targets: CSVQuery[]) {
    let allQueryPromise = targets.map((target: CSVQuery, index: number) => {
      let query = this._getOrCreateQueryJob(index, target.humioQuery);
      let res = query.executeQuery(location, grafanaAttrs, target);
      return res;
    });

    return Promise.all(allQueryPromise);
  }

  private _getOrCreateQueryJob(index: number, humioQuery: string) {
    let query = this.queries.get(index);

    if (!query) {
      query = new QueryJob(humioQuery);
      this.queries.set(index, query);
    }

    return query;
  }

  private _convertHumioQueryResponseToGrafanaFormat(humioQueryResult: any, target: any): any {
    if (humioQueryResult.events.length === 0) {
      return [];
    }
    const valueFields = getValueFieldName(humioQueryResult);

    let widgetType = HumioHelper.widgetType(humioQueryResult, target);

    switch (widgetType) {
      case WidgetType.timechart: {
        let seriesField = humioQueryResult.metaData.extraData.series;
        if (!seriesField) {
          seriesField = 'placeholder';
          humioQueryResult.events = humioQueryResult.events.map((event: any) => {
            event[seriesField] = valueFields[0];
            return event;
          });
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

  private _convertHumioQueryResponseFromFilterQueryToGrafanaFormat(humioQueryResult: any, target: any): any {
    if (humioQueryResult.events.length === 0) {
      return [];
    }
    //const valueFields = getValueFieldName(humioQueryResult);
    return _.flatMap(humioQueryResult.events, event => {
      return {
        target: event, // This one doesn't matter.
        datapoints: [[parseFloat(event['@timestamp'])]],
      };
    });
  }

  private _composeTimechart(
    events: any,
    seriesField: string,
    valueField: string
  ): Array<{ target: string; datapoints: number[][] }> {
    let series: { [index: string]: any } = {};
    // multiple series
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      let point = [parseFloat(event[valueField]), parseInt(event._bucket, 10)];
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

  private _composeTable(rows: Array<{ [index: string]: any }>, columns: string[]) {
    return [
      {
        columns: columns.map(column => {
          return { text: column };
        }),
        rows: rows.map(row => columns.map(column => row[column])),
        type: 'table',
      },
    ];
  }

  private _composeUntyped(data: any, valueField: any) {
    return _.flatMap(data.events, event => {
      const groupbyFields = data.metaData.extraData.groupby_fields;
      let targetName = groupbyFields ? this._createGroupByName(groupbyFields, event) : valueField;
      return {
        target: targetName,
        datapoints: [[parseFloat(event[valueField])]],
      };
    });
  }

  private _createGroupByName(groupbyFields: any, event: any) {
    return groupbyFields
      .split(',')
      .map((field: string) => '[' + event[field.trim()] + ']')
      .join(' ');
  }
}

export const getValueFieldName = (responseData: any) => {
  const timeseriesField = '_bucket';
  const seriesField = responseData.metaData.extraData.series;
  const groupByFields = responseData.metaData.extraData.groupby_fields;
  let groupByFieldsSplit = [];
  if (groupByFields) {
    groupByFieldsSplit = groupByFields.split(',').map((field: string) => field.trim());
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
    const valueFieldNames = responseData.events.reduce((allFieldNames: any, event: any) => {
      const valueFields = _.difference(Object.keys(event), valueFieldsToExclude);

      return [...valueFields, ...allFieldNames];
    }, []);

    return valueFieldNames || defaultValueFieldName;
  }

  return defaultValueFieldName;
};

export default QueryJobManager;
