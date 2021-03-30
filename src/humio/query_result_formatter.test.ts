import QueryResultFormatter from './query_result_formatter';

describe('Regular Query Formatting', () => {
  it('returns an empty list if no events are given', () => {
    var res = { data: { events: [] } };
    var target = {};

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res =>
      expect(res).toEqual({ data: [], error: undefined })
    );
  });

  it('returns a single set of graph data when given a Humio timechart result for 1 series', () => {
    var events = [
      { seriesName: 'series1', _count: '7', _bucket: '1598613360000' },
      { seriesName: 'series1', _count: '9', _bucket: '1598613600000' },
      { seriesName: 'series1', _count: '0', _bucket: '1598613840000' },
    ];
    var metaData = {
      costs: {},
      eventCount: 3,
      extraData: {
        series: 'seriesName',
        timechart: 'true',
        bucket_last_bucket: '1598613840000',
        groupby_fields: 'seriesName',
        bucket_span_humanized: '4 minutes',
        bucket_span_millis: '240000',
        'ui:suggested-widget': 'time-chart',
        bucket_first_bucket: '1598613360000',
      },
      fieldOrder: ['_bucket', 'seriesName', '_count'],
    };

    var res = { data: { events: events, metaData: metaData } };
    var target = { humioQuery: 'timechart()' };

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res => {
      expect(res).toEqual({
        data: [
          {
            datapoints: [
              [7, 1598613360000],
              [9, 1598613600000],
              [0, 1598613840000],
            ],
            target: 'series1',
          },
        ],
        error: undefined,
      });
    });
  });

  it('returns a single set of graph data when given a Humio timechart result for 1 series,  even if the fieldOrder does not contain the value field', () => {
    var events = [
      { seriesName: 'series1', sum: '7', _bucket: '1598613360000' },
      { seriesName: 'series1', sum: '9', _bucket: '1598613600000' },
      { seriesName: 'series1', sum: '0', _bucket: '1598613840000' },
    ];
    var metaData = {
      costs: {},
      eventCount: 3,
      extraData: {
        series: 'seriesName',
        timechart: 'true',
        bucket_last_bucket: '1598613840000',
        groupby_fields: 'seriesName',
        bucket_span_humanized: '4 minutes',
        bucket_span_millis: '240000',
        'ui:suggested-widget': 'time-chart',
        bucket_first_bucket: '1598613360000',
      },
      fieldOrder: ['_bucket', 'seriesName'],
    };

    var res = { data: { events: events, metaData: metaData } };
    var target = { humioQuery: 'timechart()' };

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res => {
      expect(res).toEqual({
        data: [
          {
            datapoints: [
              [7, 1598613360000],
              [9, 1598613600000],
              [0, 1598613840000],
            ],
            target: 'series1',
          },
        ],
        error: undefined,
      });
    });
  });

  it('returns multiple sets of graph data when given a Humio timechart result for multiple series', () => {
    var events = [
      { seriesName: 'series1', _count: '7', _bucket: '1598613360000' },
      { seriesName: 'series1', _count: '9', _bucket: '1598613600000' },
      { seriesName: 'series1', _count: '0', _bucket: '1598613840000' },
      { seriesName: 'series2', _count: '1', _bucket: '1598613360000' },
      { seriesName: 'series2', _count: '2', _bucket: '1598613600000' },
      { seriesName: 'series2', _count: '3', _bucket: '1598613840000' },
    ];
    var metaData = {
      costs: {},
      eventCount: 6,
      extraData: {
        series: 'seriesName',
        timechart: 'true',
        bucket_last_bucket: '1598613840000',
        groupby_fields: 'seriesName',
        bucket_span_humanized: '4 minutes',
        bucket_span_millis: '240000',
        'ui:suggested-widget': 'time-chart',
        bucket_first_bucket: '1598613360000',
      },
      fieldOrder: ['_bucket', 'seriesName', '_count'],
    };

    var res = { data: { events: events, metaData: metaData } };
    var target = { humioQuery: 'timechart()' };

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res => {
      expect(res).toEqual({
        data: [
          {
            datapoints: [
              [7, 1598613360000],
              [9, 1598613600000],
              [0, 1598613840000],
            ],
            target: 'series1',
          },
          {
            datapoints: [
              [1, 1598613360000],
              [2, 1598613600000],
              [3, 1598613840000],
            ],
            target: 'series2',
          },
        ],
        error: undefined,
      });
    });
  });

  it('returns multiple sets of graph data when given a Humio timechart result for multiple series, even if the fieldOrder does not contain the value field', () => {
    var events = [
      { seriesName: 'series1', sum: '7', _bucket: '1598613360000' },
      { seriesName: 'series1', sum: '9', _bucket: '1598613600000' },
      { seriesName: 'series1', sum: '0', _bucket: '1598613840000' },
      { seriesName: 'series2', sum: '1', _bucket: '1598613360000' },
      { seriesName: 'series2', sum: '2', _bucket: '1598613600000' },
      { seriesName: 'series2', sum: '3', _bucket: '1598613840000' },
    ];

    var metaData = {
      costs: {},
      eventCount: 6,
      extraData: {
        series: 'seriesName',
        timechart: 'true',
        bucket_last_bucket: '1598613840000',
        groupby_fields: 'seriesName',
        bucket_span_humanized: '4 minutes',
        bucket_span_millis: '240000',
        'ui:suggested-widget': 'time-chart',
        bucket_first_bucket: '1598613360000',
      },
      fieldOrder: ['_bucket', 'seriesName'],
    };

    var res = { data: { events: events, metaData: metaData } };
    var target = { humioQuery: 'timechart()' };

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res => {
      expect(res).toEqual({
        data: [
          {
            datapoints: [
              [7, 1598613360000],
              [9, 1598613600000],
              [0, 1598613840000],
            ],
            target: 'series1',
          },
          {
            datapoints: [
              [1, 1598613360000],
              [2, 1598613600000],
              [3, 1598613840000],
            ],
            target: 'series2',
          },
        ],
        error: undefined,
      });
    });
  });

  it('returns single data point, when using count()', () => {
    var events = [{ _count: '5' }];
    var metaData = { costs: {}, eventCount: 1, extraData: {}, fieldOrder: ['_count'] };
    var res = { data: { events: events, metaData: metaData } };
    var target = { humioQuery: 'count()' };

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res => {
      expect(res).toEqual({ data: [{ datapoints: [[5]], target: '_count' }], error: undefined });
    });
  });

  it('returns data point for each grouping in Humio result for one groupBy field', () => {
    var events = [
      { hostName: 'host1', _avg: '1234' },
      { hostName: 'host2', _avg: '4321' },
    ];
    var metaData = {
      costs: {},
      eventCount: 2,
      extraData: { groupby_fields: 'hostName' },
      fieldOrder: ['hostName', '_avg'],
    };
    var res = { data: { events: events, metaData: metaData } };
    var target = { humioQuery: 'groupBy()' };

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res => {
      expect(res).toEqual({
        data: [
          { datapoints: [[1234]], target: '[host1]' },
          { datapoints: [[4321]], target: '[host2]' },
        ],
        error: undefined,
      });
    });
  });

  it('returns data point for each groupby in Humio result for multiple groupBy fields', () => {
    var events = [
      { hostName: 'host1', clusterName: 'cluster1', _avg: '1234' },
      { hostName: 'host2', clusterName: 'cluster1', _avg: '4321' },
      { hostName: 'host1', clusterName: 'cluster2', _avg: '1234' },
      { hostName: 'host2', clusterName: 'cluster2', _avg: '4321' },
    ];
    var metaData = {
      costs: {},
      eventCount: 4,
      extraData: { groupby_fields: 'hostName, clusterName' },
      fieldOrder: ['hostName', '_avg'],
    };
    var res = { data: { events: events, metaData: metaData } };
    var target = { humioQuery: 'groupBy()' };

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res => {
      expect(res).toEqual({
        data: [
          { datapoints: [[1234]], target: '[host1] [cluster1]' },
          { datapoints: [[4321]], target: '[host2] [cluster1]' },
          { datapoints: [[1234]], target: '[host1] [cluster2]' },
          { datapoints: [[4321]], target: '[host2] [cluster2]' },
        ],
        error: undefined,
      });
    });
  });

  it('returns grafana table data format when Humio result contains table data', () => {
    var events = [
      { Field: 'Field1', Value: '123' },
      { Field: 'Field2', Value: '321' },
    ];
    var metaData = {
      costs: {},
      eventCount: 2,
      extraData: { groupby_fields: 'Field', sortOrder: [{ field: '_count', order: 'desc', type: 'any' }] },
      fieldOrder: ['Field', 'Value'],
    };
    var res = { data: { events: events, metaData: metaData } };
    var target = { humioQuery: 'table(something)' }; // TODO: Alexander, seem metadata contains the actual query, could use that instead of passing it over using target.

    return QueryResultFormatter.formatQueryResponses([res], [target]).then(res => {
      expect(res).toEqual({
        data: [
          {
            columns: [{ text: 'Field' }, { text: 'Value' }],
            rows: [
              ['Field1', '123'],
              ['Field2', '321'],
            ],
            type: 'table',
          },
        ],
        error: undefined,
      });
    });
  });
});

describe('AnnotationQuery Formatting', () => {
  it('returns an empty list if no events are given', () => {
    return QueryResultFormatter.formatAnnotationQueryResponse({ events: [] }, '').then(res => expect(res).toEqual([]));
  });

  it('throws error if event does not have timestamp', async () => {
    return await expect(
      QueryResultFormatter.formatAnnotationQueryResponse({ events: [{ NoTimestamp: 0 }] }, '')
    ).rejects.toThrow();
  });

  it('returns a list of annotations per event', () => {
    return QueryResultFormatter.formatAnnotationQueryResponse(
      { events: [{ '@timestamp': 0 }, { '@timestamp': 1234 }] },
      ''
    ).then(res =>
      expect(res).toEqual([
        { time: 0, text: '' },
        { time: 1234, text: '' },
      ])
    );
  });

  it('can inject an event field into an annotation text field', () => {
    var testFieldText = 'IamATestField';
    var expectedText = 'Here is the text: IamATestField';
    return QueryResultFormatter.formatAnnotationQueryResponse(
      { events: [{ '@timestamp': 0, test: testFieldText }] },
      'Here is the text: {test}'
    ).then(res => expect(res).toEqual([{ time: 0, text: expectedText }]));
  });

  it('throws error if field does not exist on event', async () => {
    return await expect(
      QueryResultFormatter.formatAnnotationQueryResponse({ events: [{ '@timestamp': 0 }] }, '{fieldThatDoesNotExist}')
    ).rejects.toThrow();
  });
});
