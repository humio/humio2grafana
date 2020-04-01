import {describe, beforeEach, it, expect} from './lib/common';
import { HumioDatasource } from '../src/datasource';
import Q from 'q';
import moment from 'moment';
import readJSON from './lib/json_reader';

var testResp = readJSON('specs/assets/test_response.json');
var testRespMultipleDS = readJSON('specs/assets/test_response_multiple_series.json');
var testRespSimpleGauge = readJSON('specs/assets/test_response_simple_gauge.json');

describe('HumioDatasource', function() {
  this.time
  let ctx: any = {
    backendSrv: {},
  };

  beforeEach(function() {
    ctx.$q = Q;
    ctx.instanceSettings = {url: "https://cloud.humio.com", id:1};
    ctx.$location = { search() {return true }}
    ctx.ds = new HumioDatasource(ctx.instanceSettings, ctx.$q, ctx.backendSrv, ctx.$location, {});
    
  });

  describe('Testing empty targets', () => {
    it('should return an empty array when no targets are set', (done) => {
      ctx.ds.query({targets: []}).then((result) => {
        expect(result.data).to.have.length(0);
        done();
      }).catch(done);
    });
  });
  
  // Testing response for timecharting a single series
  // ctx has been injected into the HumioDataSource object to make calls to Humio,
  // these API calls are mocked out for our tests. 
  describe('Testing timechart response', () => {
    beforeEach(() => {
      ctx.backendSrv.datasourceRequest = (request) => {
        // Mocking out API call for creating a query job
        if (request.url === "https://cloud.humio.com/api/v1/dataspaces/humio/queryjobs") {
          // NOTE: creating new query
          return ctx.$q.resolve({
            _request: request,
            data: {id: "wZXe96fINr7ZktsEvb4utIp2"}
          });
        // Mocking out API call for polling data from a query job
        } else {
          return ctx.$q.resolve({
            _request: request,
            data: testResp // Expected payload of response
          });
        }
      };
    });

    it('should return the server results when a target is set', async () => {
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

  describe("Testing multiple series", () => {
    // NOTE: timechart, multiple series
    beforeEach(() => {
      ctx.backendSrv.datasourceRequest = (request) => {
        if (request.url === "https://cloud.humio.com/api/v1/dataspaces/humio/queryjobs") {
          // NOTE: creating new query
          return ctx.$q.resolve({
            _request: request,
            data: {id: "wZXe96fINr7ZktsEvb4utIp2"}
          });
        } else {
          return ctx.$q.resolve({
            _request: request,
            data: testRespMultipleDS
          });
        }
      };
    });

    it('should return the server results when a target is set, and multiple series are returned', async () => {
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
  
  describe("Testing simple gauge", () => {
    // NOTE: simple gauge
    beforeEach(() => {
      ctx.backendSrv.datasourceRequest = (request) => {
        if (request.url === "https://cloud.humio.com/api/v1/dataspaces/humio/queryjobs") {
          // NOTE: creating new query
          return ctx.$q.resolve({
            _request: request,
            data: {id: "wZXe96fINr7ZktsEvb4utIp2"}
          });
        } else {
          return ctx.$q.resolve({
            _request: request,
            data: testRespSimpleGauge
          });
        }
      };
    });
    it('should return the server results when a target is set for simple gauge visualisation', async () => {
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
