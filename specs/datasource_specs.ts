import {describe, beforeEach, it, expect} from './lib/common';
import { HumioDatasource } from '../src/datasource';
import Q from 'q';
import moment from 'moment';
import readJSON from './lib/json_reader';

var testResp = readJSON('specs/assets/test_response.json');
var testRespMultipleDS = readJSON('specs/assets/test_response_multiple_series.json');
var testRespSimpleGauge = readJSON('specs/assets/test_response_simple_gauge.json');

function mockApiCallsForQueryJobs(ctx, expected_payload){
  ctx.backendSrv.datasourceRequest = (request) => {
    // Mocking out API call for creating a query job
    if (request.url === "https://cloud.humio.com/api/v1/dataspaces/humio/queryjobs") {
      return ctx.$q.resolve({
        _request: request,
        data: {id: "wZXe96fINr7ZktsEvb4utIp2"}
      });
    // Mocking out API call for polling data from an existing query job
    } else {
      return ctx.$q.resolve({
        _request: request,
        data: expected_payload
      });
    }
  };
}

describe('HumioDatasource', function() {
  this.time
  let ctx: any = {
    backendSrv: {},
  };

  // Sets up the HumopDatasource used by all tests.
  beforeEach(function() {
    ctx.$q = Q;
    ctx.instanceSettings = {url: "https://cloud.humio.com", id:1};
    ctx.$location = { search() {return true }}
    // $rootScope has not been mocked, may create issues when tests need to use it.  
    ctx.ds = new HumioDatasource(ctx.instanceSettings, ctx.$q, ctx.backendSrv, ctx.$location, {});
  });

  describe('Testing no targets', () => {
    it('should return an empty array when no targets are set', async () => {
      let result = await ctx.ds.query({targets: []});
      expect(result.data).to.have.length(0);
      })
    });
  
  describe('Testing response for a timechart() query with a single series', () => {
    beforeEach(() => mockApiCallsForQueryJobs(ctx, testResp));

    it('should return a single time series readable by Grafana', async () => {
      let result = await ctx.ds.query({
        targets: [
          {
            humioQuery: 'timechart()',
            humioRepository: 'humio'
          }
        ],
        panelId: 1,
        range: {
          'from': moment('2017-10-03T07:28:28.363Z'),
          'to': moment('2017-10-03T13:28:28.363Z'),
          'raw': {
            'from': 'now-6h',
            'to': 'now'
          }
        }
      });

      expect(result.data).to.have.length(1);
      let series1 = result.data[0];
      expect(series1.target).to.equal('_count');
      expect(series1.datapoints.length).to.equal(241);
    });
  });

  describe("Testing response for a timechart() query with multiple series", () => {
    beforeEach(() => mockApiCallsForQueryJobs(ctx, testRespMultipleDS));

    it('should return multiple time series readable by Grafana', async () => {
      var result = await ctx.ds.query({
        targets: [
          {
            humioQuery: 'dataspace!=humio type=METER  m1>0 | \
              regex("written-events/(?<dataspace>.*)", field=name) | timechart(dataspace, function=avg(m1), span=10m)',
              humioRepository: 'humio'
          }
        ],
        panelId: 1,
        range: {
          'from': moment('2017-10-03T07:28:28.363Z'),
          'to': moment('2017-10-03T13:28:28.363Z'),
          'raw': {
            'from': 'now-6h',
            'to': 'now'
          }
        }
      });

      expect(result.data).to.have.length(62);
      let series1 = result.data[0];
      expect(series1.target).to.equal('syklon');
      expect(series1.datapoints.length).to.equal(145);
    });
  });
  
  describe("Testing response for a query count() query", () => {
    beforeEach(() => mockApiCallsForQueryJobs(ctx, testRespSimpleGauge));
    it('should return a single data point in a format readable by Grafana', async () => {
      var result = await ctx.ds.query({
        targets: [
          {
            humioQuery: 'count()',
            humioRepository: 'humio'
          }
        ],
        panelId: 1,
        range: {
          'from': moment('2017-10-03T07:28:28.363Z'),
          'to': moment('2017-10-03T13:28:28.363Z'),
          'raw': {
            'from': 'now-6h',
            'to': 'now'
          }
        }
      });

      expect(result.data).to.have.length(1);
      let series1 = result.data[0];
      expect(series1.target).to.equal('_count');
      expect(series1.datapoints.length).to.equal(1);
    });
  });
});
