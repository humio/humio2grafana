import { HumioDataSource, HumioQuery } from './HumioDataSource';
import { HumioOptions } from './types';
import _ from 'lodash';
import { of } from 'rxjs';
import {
  CoreApp,
  DataQueryRequest,
  DataSourceInstanceSettings,
  dateTime,
  
} from '@grafana/data';
import { TemplateSrv,  } from '@grafana/runtime';


const fetchMock = jest.fn().mockReturnValue(of(createDefaultPromResponse()));

jest.mock('@grafana/runtime', () => ({
  // @ts-ignore
  ...jest.requireActual('@grafana/runtime'),
  getBackendSrv: () => ({
    datasourceRequest: (options: any, headers: any, proxyUrl: any) => {
      if(options.method === "POST"){
        return Promise.resolve(createDefaultInitResponse())
      }
      else if(options.method === "GET"){
        return Promise.resolve(createDefaultPromResponse())
      }
      else{
        return Promise.resolve(createDefaultPromResponse())}
      }
  }),
}));

function createDefaultPromResponse() {
  return {
    data: {
      done: true,
      metaData: {
        extraData: {}
      },
      events: []
  }
}
}

function createDefaultInitResponse() {
  return {
    data: {
      id: "abcde"
    },
  };
}

function createDataRequest(targets: any[], panelId: Number = 0, overrides?: Partial<DataQueryRequest>): DataQueryRequest<HumioQuery> {
  const defaults = {
    app: CoreApp.Dashboard,
    targets: targets.map(t => {
      return {
        instant: false,
        start: dateTime().subtract(5, 'minutes'),
        end: dateTime(),
        expr: 'test',
        ...t,
      };
    }),
    range: {
      from: dateTime(),
      to: dateTime(),
    },
    interval: '15s',
    showingGraph: true,
    panelId: panelId
  };

  return Object.assign(defaults, overrides || {}) as DataQueryRequest<HumioQuery>;
}

const templateSrv: any = {
  replace: jest.fn(text => {
    if (text.startsWith('$')) {
      return `resolvedVariable`;
    } else {
      return text;
    }
  }),
  getAdhocFilters: jest.fn(() => []),
};


describe('HumioDataSource', () => {
  let ds: HumioDataSource;
  const instanceSettings = ({
    url: 'proxied',
    directUrl: 'direct',
    user: 'test',
    password: 'mupp',
    jsonData: {
      customQueryParameters: '',
    } as any,
  } as unknown) as DataSourceInstanceSettings<HumioOptions>;

  beforeEach(() => {
    ds = new HumioDataSource(instanceSettings,  templateSrv as TemplateSrv);
  });

  describe('Query', () => {
    it('returns empty array when no targets',  async () => {
      let res = await ds.query(createDataRequest([]))
      // TODO: Check eq
      expect(res['data']).toEqual([])
    });

    it('returns empty array when no repo given',  async () => {
      let res = await ds.query(createDataRequest([{humioQuery: "timechart()"}]))
      expect(res['data']).toEqual([])
    });


    it('returns something when there is a target',  async () => {
      let res = await ds.query(createDataRequest([{humioQuery: "timechart()", humioRepository: "test"}]))
      console.log(res.data)
      expect(res.data).toEqual([])
    });
})
})



/*
describe('formatting', () => {
  let ds: HumioDataSource;
  const instanceSettings = ({
    url: 'proxied',
    jsonData: { authenticateWithToken: true, baseUrl: '' } as HumioOptions,
  } as unknown) as DataSourceInstanceSettings<HumioOptions>;

  beforeEach(() => {
    ds = new HumioDataSource(instanceSettings);
    jest.clearAllMocks();
  });
  



  it('returns unaltered string when provided string', () => {
    expect(ds.formatting('someUnalteredString')).toEqual('someUnalteredString');
  });

  it('returns first entry when provided list with one element', () => {
    expect(ds.formatting(['someUnalteredString'])).toEqual('someUnalteredString');
  });

  it('returns formatted or-expression when given a list with more than one entry', () => {
    expect(ds.formatting(['s1', 's2'])).toEqual('/^s1|s2$/');
  });
});
*/