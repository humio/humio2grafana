import {Datasource} from '../module';
import Q from 'q';
import moment from 'moment';

var testResp = require('./test_response.json');
var testRespMultipleDS = require('./test_response_multiple_series.json');

describe('GenericDatasource', function() {
  var ctx = {};

  beforeEach(function() {
    ctx.$q = Q.Promise;
    ctx.backendSrv = {};
    ctx.templateSrv = {};
    ctx.ds = new Datasource({}, ctx.$q, ctx.backendSrv, ctx.templateSrv);
  });

  it('should pass a default dummy test', function(done) {
    done();
  });

  it('should return an empty array when no targets are set', function(done) {
    ctx.ds.query({targets: []}).then(function(result) {
      expect(result.data).to.have.length(0);
      done();
    });
  });

  it('should return the server results when a target is set', function(done) {
    ctx.backendSrv.datasourceRequest = function(request) {
      return ctx.$q.resolve({
        _request: request,
        data: testResp
      });
    };

    ctx.templateSrv.replace = function(data) {
      return data;
    }

    var theQuery = ctx.ds.query({
      targets: [
        {
          humioQuery:'timechart()', 
          humioDataspace:'humio'
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

  it('should return the server results when a target is set, and multiple series are returned', function(done) {
    ctx.backendSrv.datasourceRequest = function(request) {
      return ctx.$q.resolve({
        _request: request,
        data: testRespMultipleDS
      });
    };

    ctx.templateSrv.replace = function(data) {
      return data;
    }

    var theQuery = ctx.ds.query({
      targets: [
        {
          humioQuery:'dataspace!=humio type=METER  m1>0 | regex("written-events/(?<dataspace>.*)", field=name) | timechart(dataspace, function=avg(m1), span=10m)', 
          humioDataspace:'humio'
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

  // TODO: 
  // implement tests for:
  // 2. simple gauge
});
