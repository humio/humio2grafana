import { HumioDataSource } from './HumioDataSource';
import { HumioOptions } from './types';
import { DataSourceInstanceSettings } from '@grafana/data';

describe('formatting', () => {
  let ds: HumioDataSource;
  const instanceSettings = ({
    url: 'proxied',
    jsonData: { authenticateWithToken: true, baseUrl: '' } as HumioOptions,
  } as unknown) as DataSourceInstanceSettings<HumioOptions>;

  beforeEach(() => {
    ds = new HumioDataSource(instanceSettings);
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
