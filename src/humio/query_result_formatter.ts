import _ from 'lodash';

import HumioHelper from './humio_helper';
import { WidgetType } from '../Types/WidgetType';
//import { HumioQuery } from 'HumioDataSource';
import { DataQueryResponse, AnnotationEvent } from '@grafana/data';

class QueryResultFormatter {
  static async formatAnnotationQueryResponse(
    annotationQueryResponseData: any,
    annotationText: string
  ): Promise<AnnotationEvent[]> {
    if (annotationQueryResponseData.events.length === 0) {
      return [];
    }

    const result = _.flatMap(annotationQueryResponseData.events, event => {
      if (!event['@timestamp']) {
        throw Error(
          'Annotation query result event does not contain a @timestamp field, and cannot be converted to an annotation'
        );
      }

      // Extract all fields from the annotation text.
      const regexp = /(?<=\{).+?(?=\})/g;
      let textFields = annotationText.match(regexp);

      if (textFields === null) {
        textFields = [];
      }

      // Extract all event values for the field specified from the annotation text.
      let textFieldValues: any[] = [];
      textFields.forEach(textField => {
        if (!_.get(event, textField)) {
          throw Error(textField + ' is not a field that exists on returned Humio events for annotation query');
        } else {
          let textFieldValue = _.get(event, textField);
          textFieldValues.push(textFieldValue);
        }
      });

      // Replace all fields in the annotation text with the actual event values.
      let currentAnnotationText = annotationText;
      textFieldValues.forEach(value => {
        currentAnnotationText = currentAnnotationText.replace(/{(.*?)}/, value);
      });

      return {
        time: event['@timestamp'],
        text: currentAnnotationText,
      };
    });

    return result;
  }

  static async formatQueryResponses(queryResponses: any, targets: any): Promise<DataQueryResponse> {
    const listOfGrafanaDataSeries = _.flatMap(queryResponses, (res, index) => {
      return QueryResultFormatter._convertHumioQueryResponseToGrafanaFormat(res.data, targets[index]);
    });

    // We will just choose the first error found on the responses to display.
    const firstWithError = _.find(queryResponses, (res, index) => {
      if (res.error) {
        return true;
      } else {
        return false;
      }
    });

    let error = undefined;
    if (firstWithError) {
      error = firstWithError.error;
    }

    return {
      data: listOfGrafanaDataSeries,
      error: error,
    };
  }

  private static _convertHumioQueryResponseToGrafanaFormat(humioQueryResult: any, target: any): any {
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
        return QueryResultFormatter._composeTimechart(humioQueryResult.events, seriesField, valueFields[0]);
      }
      case WidgetType.table:
        return QueryResultFormatter._composeTable(humioQueryResult.events, humioQueryResult.metaData.fieldOrder);
      case WidgetType.worldmap:
        return QueryResultFormatter._composeTable(humioQueryResult.events, valueFields); // The worldmap widget is also based on a table, however, with different inputs.
      default: {
        return QueryResultFormatter._composeUntyped(humioQueryResult, valueFields[0]);
      }
    }
  }

  private static _composeTimechart(
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

  private static _composeTable(rows: Array<{ [index: string]: any }>, columns: string[]) {
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

  private static _composeUntyped(data: any, valueField: any) {
    return _.flatMap(data.events, event => {
      const groupbyFields = data.metaData.extraData.groupby_fields;
      let targetName = groupbyFields ? QueryResultFormatter._createGroupByName(groupbyFields, event) : valueField;
      return {
        target: targetName,
        datapoints: [[parseFloat(event[valueField])]],
      };
    });
  }

  private static _createGroupByName(groupbyFields: any, event: any) {
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

export default QueryResultFormatter;
