import { GenericDatasource } from "./datasource";

import GenericDatasourceQueryCtrl from "./query_ctrl";

import HumioConfigCtrl from "./config_ctrl";

import GenericQueryOptionsCtrl from "./query_options_ctrl";


class GenericAnnotationsQueryCtrl {}
GenericAnnotationsQueryCtrl["templateUrl"] = "partials/annotations.editor.html";

export {
  GenericDatasource as Datasource,
  GenericDatasourceQueryCtrl as QueryCtrl,
  HumioConfigCtrl as ConfigCtrl,
  GenericQueryOptionsCtrl as QueryOptionsCtrl,
  GenericAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};
