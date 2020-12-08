import HumioHelper from './humio_helper';
import { mock } from 'jest-mock-extended';
import { dateTime } from '@grafana/data';

describe('Time Range Translation', () => {
  it.each`
    inpt         | expected
    ${'now-2d'}  | ${'2d'}
    ${'now-3d'}  | ${'3d'}
    ${'now-7d'}  | ${'7d'}
    ${'now-30d'} | ${'30d'}
    ${'now-90d'} | ${'90d'}
    ${'now-6M'}  | ${'6mon'}
    ${'now-1y'}  | ${'1y'}
    ${'now-2y'}  | ${'2y'}
    ${'now-5y'}  | ${'5y'}
    ${'now-5m'}  | ${'5m'}
    ${'now-15m'} | ${'15m'}
    ${'now-30m'} | ${'30m'}
    ${'now-1h'}  | ${'1h'}
    ${'now-3h'}  | ${'3h'}
    ${'now-6h'}  | ${'6h'}
    ${'now-12h'} | ${'12h'}
    ${'now-24h'} | ${'24h'}
  `('can translate from grafana range $inpt to humio range $expected', ({ inpt, expected }) => {
    expect(HumioHelper.parseLiveFrom(inpt)).toBe(expected);
  });

  it.each`
    inpt
    ${'now-1d/d'}
    ${'now-2d/d'}
    ${'now-7d/d'}
    ${'now-1w/w'}
    ${'now-1M/M'}
    ${'now-1y/y'}
    ${'now/d'}
    ${'now/w'}
    ${'now/y'}
  `('throw error when attempting to set From to a relative', ({ inpt }) => {
    expect(() => HumioHelper.parseLiveFrom(inpt)).toThrow(`Humio does not support live queries to start at ${inpt}.`);
  });
});

describe('Query should run with a live queryJob', () => {
  it('Is live, if time range can run as live job in Humio and refresh has been activated', () => {
    let mockLocation = mock<Location>();
    mockLocation.search = '?orgId=1&refresh=5m';
    const raw = { from: 'now-1h', to: 'now' };
    const range = { from: dateTime(), to: dateTime(), raw: raw };

    expect(HumioHelper.queryIsLive(mockLocation, range)).toBe(true);
  });

  it('Not live, if no raw range is present', () => {
    // This is the case if Grafana is given an absolute range from timestamp to timestamp
    let mockLocation = mock<Location>();
    mockLocation.search = '?orgId=1&refresh=5m';
    const range = { from: dateTime(), to: dateTime() };

    expect(HumioHelper.queryIsLive(mockLocation, range)).toBe(false);
  });

  it('Not live, if refresh has not been activated', () => {
    let mockLocation = mock<Location>();
    mockLocation.search = '?orgId=1';
    const raw = { from: 'now-1h', to: 'now' };
    const range = { from: dateTime(), to: dateTime(), raw: raw };

    expect(HumioHelper.queryIsLive(mockLocation, range)).toBe(false);
  });

  it('Not live is time range not supported by Humio', () => {
    // This day up until now
    const raw = { from: 'now/d', to: 'now' };
    const range = { from: dateTime(), to: dateTime(), raw: raw };

    let mockLocation = mock<Location>();
    mockLocation.search = '?orgId=1&refresh=5m';

    expect(HumioHelper.queryIsLive(mockLocation, range)).toBe(false);
  });

  it("Not live is time range does not end in 'now'", () => {
    // This day up until midnight
    const raw = { from: 'now/d', to: 'now/d' };
    const range = { from: dateTime(), to: dateTime(), raw: raw };

    let mockLocation = mock<Location>();
    mockLocation.search = '?orgId=1&refresh=5m';

    expect(HumioHelper.queryIsLive(mockLocation, range)).toBe(false);
  });
});
