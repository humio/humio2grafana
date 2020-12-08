import QueryJobManager from './query_job_manager';

describe('Query Job Manager', () => {
  it('returns a new QueryJobManager if one does not exist', () => {
    QueryJobManager.getOrCreateQueryJobManager('1');
    let expected = new Map();
    expected.set('1', new QueryJobManager());

    expect(QueryJobManager.managers).toStrictEqual(expected);
  });

  it('returns an existing QueryJobManager if one already exists', () => {
    let newManager = QueryJobManager.getOrCreateQueryJobManager('1');
    let retreivedManager = QueryJobManager.getOrCreateQueryJobManager('1');

    expect(newManager).toBe(retreivedManager);
  });
});
