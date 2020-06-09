import { DataSourcePlugin } from '@grafana/data';

import { HumioDataSource, CSVQuery } from './CSVDataSource';
import { ConfigEditor } from './CSVConfigEditor';
import { QueryEditor } from './CSVQueryEditor';
import { HumioOptions } from './types';

export const plugin = new DataSourcePlugin<HumioDataSource, CSVQuery, HumioOptions>(HumioDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
