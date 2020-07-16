import { DataSourcePlugin } from '@grafana/data';

import { HumioDataSource, HumioQuery } from './HumioDataSource';
import { ConfigEditor } from './HumioConfigEditor';
import { QueryEditor } from './HumioQueryEditor';
import { VariableQueryEditor } from './VariableQueryEditor';
import { HumioOptions } from './types';
import { HumioAnnotationQueryEditor } from './AnnotationQueryEditor';

export const plugin = new DataSourcePlugin<HumioDataSource, HumioQuery, HumioOptions>(HumioDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .setVariableQueryEditor(VariableQueryEditor)
  .setAnnotationQueryCtrl(HumioAnnotationQueryEditor);
