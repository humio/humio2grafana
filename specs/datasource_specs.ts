import {describe, beforeEach, it, sinon, expect, angularMocks} from './lib/common';
import { GenericDatasource } from '../src/datasource';
import TemplateSrvStub from './lib/template_srv_stub';
import Q from 'q';
import moment from 'moment';
import readJSON from './lib/json_reader';

var testResp = readJSON('specs/assets/test_response.json');
var testRespMultipleDS = readJSON('specs/assets/test_response_multiple_series.json');
var testRespSimpleGauge = readJSON('specs/assets/test_response_simple_gauge.json');

describe('GenericDatasource', function() {
  let ctx: any = {
    backendSrv: {},
    templateSrv: new TemplateSrvStub()
  };

  beforeEach(function() {
    ctx.$q = Q;
    ctx.instanceSettings = {};
    ctx.ds = new GenericDatasource(ctx.instanceSettings, ctx.$q, ctx.backendSrv, ctx.templateSrv, null, {});
  });

  describe('Testing empty targets', () => {
    it('should return an empty array when no targets are set', (done) => {
      ctx.ds.query({targets: []}).then((result) => {
        expect(result.data).to.have.length(0);
        done();
      });
    });
  });

  // NOTE: timechart, single series
  describe('Testing timechart response', () => {
    beforeEach(() => {
      ctx.backendSrv.datasourceRequest = (request) => {
        if (request.url === "/api/v1/dataspaces/humio/queryjobs") {
          // NOTE: creating new query
          return ctx.$q.resolve({
            _request: request,
            data: {id: "wZXe96fINr7ZktsEvb4utIp2"}
          });
        } else {
          return ctx.$q.resolve({
            _request: request,
            data: testResp
          });
        }
      };
    });

    it('should return the server results when a target is set', (done) => {

      ctx.templateSrv.replace = (data) => {
        return data;
      };

      var theQuery = ctx.ds.query({
        targets: [
          {
            humioQuery: 'timechart()',
            humioDataspace: 'humio'
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

      theQuery.then((result) => {
        expect(result.data).to.have.length(1);
        let series1 = result.data[0];
        expect(series1.target).to.equal('_count');
        expect(series1.datapoints.length).to.equal(241);
        done();
      });
    });
  });

  describe("Testing multiple series", () => {
    // NOTE: timechart, multiple series
    beforeEach(() => {
      ctx.backendSrv.datasourceRequest = (request) => {
        if (request.url === "/api/v1/dataspaces/humio/queryjobs") {
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

    it('should return the server results when a target is set, and multiple series are returned', (done) => {
      var theQuery = ctx.ds.query({
        targets: [
          {
            humioQuery: 'dataspace!=humio type=METER  m1>0 | \
              regex("written-events/(?<dataspace>.*)", field=name) | timechart(dataspace, function=avg(m1), span=10m)',
            humioDataspace: 'humio'
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

      theQuery.then((result) => {
        expect(result.data).to.have.length(62);
        let series1 = result.data[0];
        expect(series1.target).to.equal('syklon');
        expect(series1.datapoints.length).to.equal(145);
        done();
      });
    });
  });

  describe("Testing simple gauge", () => {
    // NOTE: simple gauge
    beforeEach(() => {
      ctx.backendSrv.datasourceRequest = (request) => {
        if (request.url === "/api/v1/dataspaces/humio/queryjobs") {
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
    it('should return the server results when a target is set for simple gauge visualisation', (done) => {
      var theQuery = ctx.ds.query({
        targets: [
          {
            humioQuery: 'count()',
            humioDataspace: 'humio'
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

      theQuery.then((result) => {
        expect(result.data).to.have.length(1);
        let series1 = result.data[0];
        expect(series1.target).to.equal('_count');
        expect(series1.datapoints.length).to.equal(1);
        done();
      });
    });
  });
});
