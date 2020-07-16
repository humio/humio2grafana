import _ from 'lodash';
import IGrafanaAttrs from '../Interfaces/IGrafanaAttrs';
import QueryJob from './query_job';
import { HumioQuery } from 'HumioDataSource';

/**
 * Keeps account of the different queryjobs running to populate a Grafana panel,
 * and converts their output to Grafana readable data formats.
 */
class QueryJobManager {
  static managers: Map<string, QueryJobManager> = new Map<string, QueryJobManager>();
  queries: Map<number, QueryJob>;

  constructor() {
    this.queries = new Map<number, QueryJob>();
  }

  static getOrCreateQueryJobManager(managerId: string): QueryJobManager {
    // See if the manager already exists.
    let manager = this.managers.get(managerId);
    if (!manager) {
      manager = new this();
      this.managers.set(managerId, manager);
    }

    return manager;
  }

  async update(location: Location, grafanaAttrs: IGrafanaAttrs, targets: HumioQuery[]): Promise<any> {
    return await this._executeAllQueries(location, grafanaAttrs, targets);
  }

  private async _executeAllQueries(location: Location, grafanaAttrs: IGrafanaAttrs, targets: HumioQuery[]) {
    let allQueryPromise = targets.map((target: HumioQuery, index: number) => {
      let query = this._getOrCreateQueryJob(index, target.humioQuery);
      let res = query.executeQuery(location, grafanaAttrs, target);
      return res;
    });

    return Promise.all(allQueryPromise);
  }

  private _getOrCreateQueryJob(index: number, humioQuery: string) {
    let query = this.queries.get(index);

    if (!query) {
      query = new QueryJob(humioQuery);
      this.queries.set(index, query);
    }

    return query;
  }
}

export default QueryJobManager;
