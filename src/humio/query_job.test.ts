import QueryJob from './query_job';
import { HumioQuery } from '../HumioDataSource';

import { mock } from 'jest-mock-extended';
import GrafanaAttrs from 'Interfaces/IGrafanaAttrs';
import { dateTime } from '@grafana/data';

var initMock = jest.fn().mockReturnValue(createDefaultInitResponse());
var pollMock = jest.fn().mockReturnValue(createDefaultDoneHumioResponse());
var deleteMock = jest.fn().mockReturnValue(createDefaultDeleteResponse());

jest.mock('@grafana/runtime', () => ({
  // @ts-ignore
  ...jest.requireActual('@grafana/runtime'),
  getBackendSrv: () => ({
    datasourceRequest: (options: any, headers: any, proxyUrl: any) => {
      if (options.method === 'POST') {
        return Promise.resolve(initMock(options, headers, proxyUrl));
      } else if (options.method === 'GET') {
        return Promise.resolve(pollMock(options, headers, proxyUrl));
      } else if (options.method === 'DELETE') {
        return Promise.resolve(deleteMock(options, headers, proxyUrl));
      } else {
        throw Error('No mock implementation of HTTP verb ' + options.method);
      }
    },
  }),
}));

function createErrorResponseBadBody() {
  return Promise.reject({ status: 400, statusText: 'Bad Request', data: 'Bad Request Data' });
}

function createErrorResponseQueryDead() {
  return Promise.reject({ status: 404 });
}

function createDefaultDoneHumioResponse() {
  return {
    data: {
      done: true,
      metaData: {
        extraData: {},
      },
      events: [{ _count: '0' }],
    },
  };
}

function createDefaultNotDoneHumioResponse() {
  return {
    data: {
      done: false,
      metaData: {
        extraData: { pollAfter: 0 },
      },
      events: [{ _count: '0' }],
    },
  };
}

function createDefaultInitResponse() {
  return {
    data: {
      id: 'abcde',
    },
  };
}

function createDefaultDeleteResponse() {
  return {
    data: {},
  };
}

describe('QueryJob', () => {
  let qj: QueryJob;
  let mockAttrs: GrafanaAttrs;
  let query: HumioQuery;

  beforeEach(() => {
    qj = new QueryJob('count()');
    mockAttrs = mock<GrafanaAttrs>();

    const raw = { from: 'now-1h', to: 'now' };
    const range = { from: dateTime(), to: dateTime(), raw: raw };

    mockAttrs.grafanaQueryOpts.range = range;
    mockAttrs.headers = { 'Content-Type': 'application/json' };
    mockAttrs.proxy_url = 'proxied';

    query = {
      refId: '1',
      humioQuery: '',
      humioRepository: 'test',
      annotationText: undefined,
      annotationQuery: undefined,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('General Polling Behavior', () => {
    it('returns empty array when no targets', async () => {
      query = {
        refId: '1',
        humioQuery: 'count()',
        humioRepository: undefined,
        annotationText: undefined,
        annotationQuery: undefined,
      };

      let res = await qj.executeQuery(false, mockAttrs, query);
      // TODO: Alexander, this data structure does look a bit strange
      expect(res).toEqual({
        data: { done: true, events: [] },
        error: {
          data: { error: 'Please select a repository.', message: 'No Repository Selected' },
          message: 'No Repository Selected',
        },
      });
    });

    it('returns data on first poll', async () => {
      let res = await qj.executeQuery(false, mockAttrs, query);
      expect(res).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(initMock).toBeCalledTimes(1);
      expect(pollMock).toBeCalledTimes(1);
    });

    it('returns data on second poll if first is not done yet', async () => {
      pollMock = jest
        .fn()
        .mockReturnValueOnce(createDefaultNotDoneHumioResponse())
        .mockReturnValue(createDefaultDoneHumioResponse());
      let res = await qj.executeQuery(false, mockAttrs, query);
      expect(res).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(initMock).toBeCalledTimes(1);
      expect(pollMock).toBeCalledTimes(2);
    });
  });

  describe('Live Query Behavior', () => {
    it(' A live query job will retain a queryId and reuse it on subsequent executions', async () => {
      let res = await qj.executeQuery(true, mockAttrs, query);
      expect(res).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(qj.queryId).toBeDefined();

      let res2 = await qj.executeQuery(true, mockAttrs, query);
      expect(res2).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(qj.queryId).toBeDefined();

      expect(initMock).toBeCalledTimes(1);
      expect(pollMock).toBeCalledTimes(2);
    });

    it('A live query job will have to create a new job on Humio, if query changes', async () => {
      let res = await qj.executeQuery(true, mockAttrs, query);
      expect(res).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(qj.queryId).toBeDefined();

      let queryNew = {
        refId: query.refId,
        humioQuery: '* | count()',
        humioRepository: query.humioRepository,
        annotationText: query.annotationText,
        annotationQuery: query.annotationQuery,
      };

      let res2 = await qj.executeQuery(true, mockAttrs, queryNew);
      expect(res2).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(qj.queryId).toBeDefined();

      expect(initMock).toBeCalledTimes(2);
      expect(pollMock).toBeCalledTimes(2);
      expect(deleteMock).toBeCalledTimes(1);
    });

    it('A live query job will have to create a new job on Humio, if repo selection changes', async () => {
      let res = await qj.executeQuery(true, mockAttrs, query);
      expect(res).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(qj.queryId).toBeDefined();

      let queryNew = {
        refId: query.refId,
        humioQuery: query.humioQuery,
        humioRepository: 'anotherRepo',
        annotationText: query.annotationText,
        annotationQuery: query.annotationQuery,
      };

      let res2 = await qj.executeQuery(true, mockAttrs, queryNew);
      expect(res2).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(qj.queryId).toBeDefined();

      // TODO: Alexander, I'd actually expect a new queryJob if the repo changes.
      expect(initMock).toBeCalledTimes(2);
      expect(pollMock).toBeCalledTimes(2);
      expect(deleteMock).toBeCalledTimes(1);
    });
  });

  describe('Static Query Behavior', () => {
    it('A static query job will not retain a queryId and create a new job at each execution', async () => {
      let res = await qj.executeQuery(false, mockAttrs, query);
      expect(res).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(qj.queryId).toBeUndefined();

      let res2 = await qj.executeQuery(true, mockAttrs, query);
      expect(res2).toEqual({ data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } } });
      expect(qj.queryId).toBeDefined();

      expect(initMock).toBeCalledTimes(2);
      expect(pollMock).toBeCalledTimes(2);
    });
  });

  describe('Error handling behavior', () => {
    it('Returns error immediatly if poll response is an error that is not a 404', async () => {
      pollMock = jest
        .fn()
        .mockReturnValueOnce(createErrorResponseBadBody())
        .mockReturnValue(createDefaultDoneHumioResponse());
      let res = qj.executeQuery(false, mockAttrs, query);
      await expect(res).resolves.toEqual({
        data: { done: true, events: [] },
        error: {
          data: { error: 'Bad Request Data', message: 'Query Error' },
          status: 400,
          message: 'Query Error',
          statusText: 'Bad Request',
        },
      });
      expect(initMock).toBeCalledTimes(1);
      expect(pollMock).toBeCalledTimes(1);
      expect(qj.queryId).toBeUndefined();
      expect(qj.failCounter).toBe(0);
    });

    it('Retries if poll yields a 404 error once', async () => {
      pollMock = jest
        .fn()
        .mockReturnValueOnce(createErrorResponseQueryDead())
        .mockReturnValue(createDefaultDoneHumioResponse());
      let res = qj.executeQuery(false, mockAttrs, query);
      await expect(res).resolves.toEqual({
        data: { done: true, events: [{ _count: '0' }], metaData: { extraData: {} } },
      });
      expect(initMock).toBeCalledTimes(2); // Calls init again to recreate QueryJob
      expect(pollMock).toBeCalledTimes(2);
      expect(qj.queryId).toBeUndefined();
      expect(qj.failCounter).toBe(0);
    });
    it('Gives up after 3 retries if 404 errors keep being returned With a Static Query', async () => {
      pollMock = jest
        .fn()
        .mockReturnValueOnce(createErrorResponseQueryDead())
        .mockReturnValueOnce(createErrorResponseQueryDead())
        .mockReturnValueOnce(createErrorResponseQueryDead())
        .mockReturnValue(createDefaultDoneHumioResponse());
      let res = qj.executeQuery(false, mockAttrs, query);
      await expect(res).resolves.toEqual({
        data: { done: true, events: [] },
        error: {
          data: { error: 'Tried to query 3 times in a row.', message: 'Failed to create query' },
          message: 'Failed to create query',
        },
      });
      expect(initMock).toBeCalledTimes(3);
      expect(pollMock).toBeCalledTimes(3);
      expect(qj.queryId).toBeUndefined();
      expect(qj.failCounter).toBe(0);
    });

    it('Gives up after 3 retries if 404 errors keep being returned With a Live Query that has already been polled', async () => {
      pollMock = jest
        .fn()
        .mockReturnValueOnce(createDefaultDoneHumioResponse())
        .mockReturnValue(createErrorResponseQueryDead());

      qj.executeQuery(true, mockAttrs, query); // Initial poll, should succeed.

      let res = qj.executeQuery(true, mockAttrs, query);
      await expect(res).resolves.toEqual({
        data: { done: true, events: [] },
        error: {
          data: { error: 'Tried to query 3 times in a row.', message: 'Failed to create query' },
          message: 'Failed to create query',
        },
      });
      expect(initMock).toBeCalledTimes(4);
      expect(pollMock).toBeCalledTimes(4);
      expect(qj.queryId).toBeUndefined();
      expect(qj.failCounter).toBe(0);
    });
  });
});
