System.register(['lodash', 'app/plugins/sdk'], function($__export) {
  var Lodash, ApppluginsSdk;


  function $__register__main__exports(exports) {
    for (var exportName in exports) {
	  $__export(exportName, exports[exportName]);
    }
  }

  function $__wsr__interop(m) {
	return m.__useDefault ? m.default : m;
  }

  return {
    setters: [
      function(m) {
        Lodash = $__wsr__interop(m);
      },
      function(m) {
        ApppluginsSdk = $__wsr__interop(m);
      }
    ],
    execute: function() {
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var pug_has_own_property = Object.prototype.hasOwnProperty;

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = pug_merge;
function pug_merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = pug_merge(attrs, a[i]);
    }
    return attrs;
  }

  for (var key in b) {
    if (key === 'class') {
      var valA = a[key] || [];
      a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);
    } else if (key === 'style') {
      var valA = pug_style(a[key]);
      var valB = pug_style(b[key]);
      a[key] = valA + valB;
    } else {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Process array, object, or string as a string of classes delimited by a space.
 *
 * If `val` is an array, all members of it and its subarrays are counted as
 * classes. If `escaping` is an array, then whether or not the item in `val` is
 * escaped depends on the corresponding item in `escaping`. If `escaping` is
 * not an array, no escaping is done.
 *
 * If `val` is an object, all the keys whose value is truthy are counted as
 * classes. No escaping is done.
 *
 * If `val` is a string, it is counted as a class. No escaping is done.
 *
 * @param {(Array.<string>|Object.<string, boolean>|string)} val
 * @param {?Array.<string>} escaping
 * @return {String}
 */
exports.classes = pug_classes;
function pug_classes_array(val, escaping) {
  var classString = '', className, padding = '', escapeEnabled = Array.isArray(escaping);
  for (var i = 0; i < val.length; i++) {
    className = pug_classes(val[i]);
    if (!className) continue;
    escapeEnabled && escaping[i] && (className = pug_escape(className));
    classString = classString + padding + className;
    padding = ' ';
  }
  return classString;
}
function pug_classes_object(val) {
  var classString = '', padding = '';
  for (var key in val) {
    if (key && val[key] && pug_has_own_property.call(val, key)) {
      classString = classString + padding + key;
      padding = ' ';
    }
  }
  return classString;
}
function pug_classes(val, escaping) {
  if (Array.isArray(val)) {
    return pug_classes_array(val, escaping);
  } else if (val && typeof val === 'object') {
    return pug_classes_object(val);
  } else {
    return val || '';
  }
}

/**
 * Convert object or string to a string of CSS styles delimited by a semicolon.
 *
 * @param {(Object.<string, string>|string)} val
 * @return {String}
 */

exports.style = pug_style;
function pug_style(val) {
  if (!val) return '';
  if (typeof val === 'object') {
    var out = '';
    for (var style in val) {
      /* istanbul ignore else */
      if (pug_has_own_property.call(val, style)) {
        out = out + style + ':' + val[style] + ';';
      }
    }
    return out;
  } else {
    val += '';
    if (val[val.length - 1] !== ';') 
      return val + ';';
    return val;
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = pug_attr;
function pug_attr(key, val, escaped, terse) {
  if (val === false || val == null || !val && (key === 'class' || key === 'style')) {
    return '';
  }
  if (val === true) {
    return ' ' + (terse ? key : key + '="' + key + '"');
  }
  if (typeof val.toJSON === 'function') {
    val = val.toJSON();
  }
  if (typeof val !== 'string') {
    val = JSON.stringify(val);
    if (!escaped && val.indexOf('"') !== -1) {
      return ' ' + key + '=\'' + val.replace(/'/g, '&#39;') + '\'';
    }
  }
  if (escaped) val = pug_escape(val);
  return ' ' + key + '="' + val + '"';
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} terse whether to use HTML5 terse boolean attributes
 * @return {String}
 */
exports.attrs = pug_attrs;
function pug_attrs(obj, terse){
  var attrs = '';

  for (var key in obj) {
    if (pug_has_own_property.call(obj, key)) {
      var val = obj[key];

      if ('class' === key) {
        val = pug_classes(val);
        attrs = pug_attr(key, val, false, terse) + attrs;
        continue;
      }
      if ('style' === key) {
        val = pug_style(val);
      }
      attrs += pug_attr(key, val, false, terse);
    }
  }

  return attrs;
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var pug_match_html = /["&<>]/;
exports.escape = pug_escape;
function pug_escape(_html){
  var html = '' + _html;
  var regexResult = pug_match_html.exec(html);
  if (!regexResult) return _html;

  var result = '';
  var i, lastIndex, escape;
  for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
    switch (html.charCodeAt(i)) {
      case 34: escape = '&quot;'; break;
      case 38: escape = '&amp;'; break;
      case 60: escape = '&lt;'; break;
      case 62: escape = '&gt;'; break;
      default: continue;
    }
    if (lastIndex !== i) result += html.substring(lastIndex, i);
    lastIndex = i + 1;
    result += escape;
  }
  if (lastIndex !== i) return result + html.substring(lastIndex, i);
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the pug in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @param {String} str original source
 * @api private
 */

exports.rethrow = pug_rethrow;
function pug_rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || __webpack_require__(15).readFileSync(filename, 'utf8')
  } catch (ex) {
    pug_rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Pug') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = Lodash;

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

class HumioHelper {}
/* harmony export (immutable) */ __webpack_exports__["a"] = HumioHelper;


HumioHelper.checkToDateNow = (toDateCheck) => {
  if (typeof toDateCheck == "string") {
    return toDateCheck.match(/^(now[^-]|now$)/) != null;
  } else {
    return false;
  }
};

HumioHelper.getPanelType = (queryStr) => {
  let buf = queryStr.split('|'); // getting last part in the pipe
  let lastFx = buf[buf.length-1];
  if (lastFx.trim().match(/^timechart\(.*\)$/)) {
    return 'time-chart';
  } else {
    return undefined;
  }
};

HumioHelper.parseDateFrom = (date) => {
  switch (date) {
    case 'now-2d':
      {
        return '2d';
      }
      break;
    case 'now-7d':
      {
        return '7d';
      }
      break;
    case 'now-30d':
      {
        return '30d';
      }
      break;
    case 'now-90d':
      {
        return '90d';
      }
      break;
    case 'now-6M':
      {
        return '180d';
      }
      break;
    case 'now-1y':
      {
        return '1y';
      }
      break;
    case 'now-2y':
      {
        return '2y';
      }
      break;
    case 'now-5y':
      {
        return '5y';
      }
      break;
    case 'now-1d/d':
      {
        return '1d';
      }
      break;
    case 'now-2d/d':
      {
        return '2d';
      }
      break;
    case 'now-7d/d':
      {
        return '7d';
      }
      break;
    case 'now-1w/w':
      {
        return '7d';
      }
      break;
    case 'now-1M/M':
      {
        return '1m';
      }
      break;
    case 'now-1y/y':
      {
        return '1y';
      }
      break;
    case 'now/d':
      {
        return '1d';
      }
      break;
    case 'now/w':
      {
        return '7d';
      }
      break;
    case 'now/M':
      {
        return '1m';
      }
      break;
    case 'now/y':
      {
        return '1y';
      }
      break;
    case 'now-5m':
      {
        return '5m';
      }
      break;
    case 'now-15m':
      {
        return '15m';
      }
      break;
    case 'now-30m':
      {
        return '30m';
      }
      break;
    case 'now-1h':
      {
        return '1h';
      }
      break;
    case 'now-3h':
      {
        return '3h';
      }
      break;
    case 'now-6h':
      {
        return '6h';
      }
      break;
    case 'now-12h':
      {
        return '12h';
      }
      break;
    case 'now-24h':
      {
        return '24h';
      }
      break;
    default:
      {
        return '24h';
      }
      break;
  }
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const _ = __webpack_require__(1);
class DsPanel {
    // headers = {
    //   'Content-Type': string,
    //   'Authorization': string
    // };
    constructor(queryStr, backendSrv) {
        this.queryData = {
            queryString: queryStr,
            timeZoneOffsetMinutes: -(new Date()).getTimezoneOffset(),
            showQueryEventDistribution: false,
            start: "24h",
            isLive: false
        };
        this.queryId = null;
        this.failCounter = 0;
        this.backendSrv = backendSrv;
    }
    getQueryData() {
        let resObj = {};
        Object.keys(this.queryData).forEach((key) => {
            // NOTE: filtering null parameters;
            if (this.queryData[key] !== null) {
                resObj[key] = this.queryData[key];
            }
        });
        return resObj;
    }
    updateQueryParams(newQueryParams) {
        _.assign(this.queryData, newQueryParams);
        this.cleanupQueryData();
    }
    cleanupQueryData() {
        if (this.queryData["isLive"]) {
            this.queryData["end"] = null;
        }
    }
    setQueryId(newId) {
        this.queryId = newId;
    }
    // TODO: deprecated;
    incFailCounter() {
        this.failCounter += 1;
    }
    resetFailCounter() {
        this.failCounter = 0;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DsPanel;


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnnotationsQueryCtrl", function() { return GenericAnnotationsQueryCtrl; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__datasource__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__query_ctrl__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__config_ctrl__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__query_options_ctrl__ = __webpack_require__(18);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Datasource", function() { return __WEBPACK_IMPORTED_MODULE_0__datasource__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "QueryCtrl", function() { return __WEBPACK_IMPORTED_MODULE_1__query_ctrl__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ConfigCtrl", function() { return __WEBPACK_IMPORTED_MODULE_2__config_ctrl__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "QueryOptionsCtrl", function() { return __WEBPACK_IMPORTED_MODULE_3__query_options_ctrl__["a"]; });







// class GenericConfigCtrl {}
// GenericConfigCtrl.templateUrl = 'partials/config.html';


class GenericAnnotationsQueryCtrl {}
// GenericAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html'
GenericAnnotationsQueryCtrl.template = __webpack_require__(20);



$__register__main__exports(__webpack_exports__);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__helper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__DsPanel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__DsPanel___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__DsPanel__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__DsPanelStorage__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__DsPanelStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__DsPanelStorage__);





class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv, $location, $rootScope) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url ? instanceSettings.url.replace(/\/$/, '') : '';
    this.name = instanceSettings.name;

    this.$q = $q;
    this.$location = $location;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.$rootScope = $rootScope;

    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' +
        (instanceSettings.jsonData ? (instanceSettings.jsonData.humioToken || 'developer') :
          'developer')
    };

    // NOTE: session query storage
    // this.queryParams = {};
    this.dsPanelStorage = new __WEBPACK_IMPORTED_MODULE_3__DsPanelStorage___default.a(this.backendSrv);
  }

  query(options) {

    // NOTE: if no tragests just return an empty result
    if (options.targets.length == 0) {
      return this.$q.resolve({
        data: []
      });
    }

    let panelId = options.panelId;
    let humioQueryStr = options.targets[0].humioQuery;
    let humioDataspace = options.targets[0].humioDataspace;
    // var query = options; // TODO: not needed really
    // this.timeRange = options.range;

    // NOTE: if no humio dataspace or no query - consider configuration invalid
    if (!humioDataspace || !humioQueryStr) {
      return this.$q.resolve({
        data: []
      });
    }

    // var dt = {
    //   'queryString': humioQueryStr,
    //   'timeZoneOffsetMinutes': -(new Date()).getTimezoneOffset(),
    //   'showQueryEventDistribution': false,
    //   'start': '24h'
    // }


    // // NOTE: modifying query
    // this.queryParams[panelId] = this.queryParams[panelId] ? this.queryParams[panelId] : {
    //   queryId: null,
    //   failCounter: 0,
    //   // humioQueryStr: JSON.stringify(dt),
    //   isLive: false,
    //   humioQuery: dt
    // };
    var dsPanel = this.dsPanelStorage.getOrGreatePanel(panelId, humioQueryStr);

    return this.$q((resolve, reject) => {

      let handleErr = (err) => {
        console.log('fallback ->')
        console.log(err);
        // TODO: add a counter, if several times get a error - consider query to be invalid, or distinguish between error types
        if (err.status == 401) {
          // NOTE: query not found - trying to recreate
          dsPanel.setQueryId(null);
          dsPanel.incFailCounter();
          if (dsPanel.failCounter <= 3) {
            this._composeQuery(panelId, dsPanel.getQueryData(), options, humioDataspace).then(handleRes, handleErr);
          } else {
            dsPanel.resetFailCounter()
          }
        } else {
          if (err.status = 400) {
            this.$rootScope.appEvent('alert-error', ['Query error', err.data]);
          } else {
            this.$rootScope.appEvent('alert-error', [err.status, err.data]);
          }
          resolve({
            data: []
          });
        }
      }

      let handleRes = (r) => {
        if (r.data.done) {
          console.log('query done');

          // this._updateQueryParams(panelId, {
          //   failCounter: 0,
          //   queryId: this.queryParams[panelId].isLive ? this.queryParams[panelId].queryId : null
          // });
          dsPanel.resetFailCounter();
          // TODO: move this check to DsPanel;
          dsPanel.setQueryId(dsPanel.queryData.isLive ? dsPanel.queryId : null);

          resolve(this._composeResult(options, r, () => {
            let dt = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.clone(r.data);
            let timeseriesField = '_bucket';
            let seriesField = dt.metaData.extraData.series;
            let series = {};
            let valueField = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.filter(dt.metaData.fields, (f) => {
              return f.name != timeseriesField && f.name != seriesField;
            })[0].name;

            // NOTE: aggregating result
            if (seriesField) {
              // multiple series
              for (let i = 0; i < r.data.events.length; i++) {
                let ev = r.data.events[i];
                if (!series[ev[seriesField]]) {
                  series[ev[seriesField]] = [
                    [ev[valueField], parseInt(ev._bucket)]
                  ];
                } else {
                  series[ev[seriesField]].push([ev[valueField], parseInt(ev._bucket)]);
                }
              }
              r.data = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.keys(series).map((s) => {
                return {
                  target: s,
                  datapoints: series[s]
                }
              })
            } else {
              // NOTE: single series
              if (dt.events.length == 1) {
                // NOTE: consider to be gauge
                r.data = dt.events.map((ev) => {
                  return {
                    target: valueField,
                    datapoints: [[parseFloat(ev[valueField]), valueField]]
                  }
                });
              } else {
                // NOTE: consider to be a barchart
                r.data = dt.events.map((ev) => {
                  return {
                    target: ev[valueField],
                    datapoints: [[parseFloat(ev._count), '_' + ev[valueField]]]
                  }
                });
              }
            }
            return r;
          }));
        } else {
          console.log('query running...');
          console.log('' + (r.data.metaData.workDone / r.data.metaData.totalWork * 100).toFixed(2) + '%');
          setTimeout(() => {
            this._composeQuery(panelId, dsPanel.getQueryData(), options, humioDataspace).then(handleRes, handleErr);
          }, 1000);
        }
      }

      this._composeQuery(panelId, dsPanel.getQueryData(), options, humioDataspace).then(handleRes, handleErr);
    });
  }

  _composeResult(queryOptions, r, resFx) {
    let currentTarget = queryOptions.targets[0];
    if ((currentTarget.hasOwnProperty('type') &&
        ((currentTarget.type == 'timeserie') || (currentTarget.type == 'table')) &&
        (r.data.hasOwnProperty('metaData') && r.data.metaData.hasOwnProperty('extraData') &&
          r.data.metaData.extraData.timechart == 'true'))) {
      // NOTE: timechart
      return resFx();
    } else if (!currentTarget.hasOwnProperty('type') &&
      (r.data.hasOwnProperty('metaData') && r.data.metaData.isAggregate == true)) {
      // NOTE: gauge
      return resFx();
    } else {
      // NOTE: unsuported query for this type of panel
      this.$rootScope.appEvent('alert-error', ['Unsupported visualisation', 'can\'t visulize the query result on this panel.']);
      return {
        data: []
      }
    }
  }

  _stopUpdatedQuery(panelId, queryDt, humioDataspace) {
    // TODO: move this to DsPanel completely;
    let dsPanel = this.dsPanelStorage.panels.get(panelId);
    if (dsPanel) {
      // console.log('1->');
      // console.log(JSON.stringify(dsPanel.getQueryData()));
      // console.log(JSON.stringify(queryDt));
      if (JSON.stringify(dsPanel.getQueryData()) !== JSON.stringify(queryDt)) {
        console.log("STOP!");
        if (dsPanel.queryId) {
          this._stopExecution(dsPanel.queryId, humioDataspace);
        }
        dsPanel.setQueryId(null);
        dsPanel.updateQueryParams(queryDt);
        // this._updateQueryParams(panelId, {
        //   queryId: null,
        //   humioQuery: queryDt
        // });
      };
    }
  }

  _composeQuery(panelId, queryDt, grafanaQueryOpts, humioDataspace) {
    let dsPanel = this.dsPanelStorage.panels.get(panelId);
    if (dsPanel) {
      let refresh = this.$location ? (this.$location.search().refresh || null) : null;
      let range = grafanaQueryOpts.range;

      queryDt.isLive = ((refresh != null) && (__WEBPACK_IMPORTED_MODULE_1__helper__["a" /* HumioHelper */].checkToDateNow(range.raw.to)));

      // NOTE: setting date range
      if (queryDt.isLive) {
        queryDt.start = __WEBPACK_IMPORTED_MODULE_1__helper__["a" /* HumioHelper */].parseDateFrom(range.raw.from);

        // TODO: shoudl be moved to _updateQueryParams
        this._stopUpdatedQuery(panelId, queryDt, humioDataspace);

        dsPanel.updateQueryParams(queryDt);
        return this._composeLiveQuery(panelId, queryDt, humioDataspace);
      } else {

        // TODO: shoudl be moved to _updateQueryParams
        this._stopUpdatedQuery(panelId, queryDt, humioDataspace);

        if (dsPanel.queryId != null) {
          return this._pollQuery(dsPanel.queryId, humioDataspace);
        } else {
          queryDt.start = range.from._d.getTime();
          queryDt.end = range.to._d.getTime();

          // TODO: shoudl be moved to _updateQueryParams
          this._stopUpdatedQuery(panelId, queryDt, humioDataspace);

          dsPanel.updateQueryParams(queryDt);
          return this._initQuery(dsPanel.getQueryData(), humioDataspace).then((r) => {
            dsPanel.setQueryId(r.data.id);
            dsPanel.updateQueryParams({isLive: false});
            return this._pollQuery(r.data.id, humioDataspace);
          });
        };
      };
    };
  }

  _composeLiveQuery(panelId, queryDt, humioDataspace) {
    let dsPanel = this.dsPanelStorage.panels.get(panelId);
    if (dsPanel.queryId == null) {
      return this._initQuery(dsPanel.getQueryData(), humioDataspace).then((r) => {
        dsPanel.setQueryId(r.data.id);
        dsPanel.updateQueryParams({isLive: true});
        return this._pollQuery(r.data.id, humioDataspace);
      });
    } else {
      return this._pollQuery(dsPanel.queryId, humioDataspace);
    }
  }

  _initQuery(queryDt, humioDataspace) {
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs',
      data: queryDt,
      method: 'POST',
    });
  }

  _pollQuery(queryId, humioDataspace) {
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs/' + queryId,
      method: 'GET',
    });
  }

  _stopExecution(queryId, humioDataspace) {
    console.log('stopping execution');
    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/' + humioDataspace + '/queryjobs/' + queryId,
      method: 'DELETE',
    });
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Data source is working',
          title: 'Success'
        };
      }
    });
  }

  // // TODO: handle annotationQuery
  // annotationQuery(options) {
  //   console.log('annotationQuery -> ');
  //   var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
  //   var annotationQuery = {
  //     range: options.range,
  //     annotation: {
  //       name: options.annotation.name,
  //       datasource: options.annotation.datasource,
  //       enable: options.annotation.enable,
  //       iconColor: options.annotation.iconColor,
  //       query: query
  //     },
  //     rangeRaw: options.rangeRaw
  //   };
  //
  //   return this.doRequest({
  //     url: this.url + '/annotations',
  //     method: 'POST',
  //     data: annotationQuery
  //   }).then(result => {
  //     return result.data;
  //   });
  // }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    return this.backendSrv.datasourceRequest(options);
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = GenericDatasource;



/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const DsPanel_1 = __webpack_require__(3);
class DsPanelStorage {
    constructor(backendSrv) {
        this.backendSrv = backendSrv;
        this.panels = new Map();
    }
    getOrGreatePanel(panelId, queryStr) {
        let panel = this.panels.get(panelId);
        if (!panel) {
            panel = new DsPanel_1.default(queryStr, this.backendSrv);
            this.panels.set(panelId, panel);
        }
        else {
            panel.updateQueryParams({ queryString: queryStr });
        }
        return panel;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DsPanelStorage;


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_app_plugins_sdk__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_app_plugins_sdk___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_app_plugins_sdk__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__css_query_editor_css__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__css_query_editor_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__css_query_editor_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__helper__ = __webpack_require__(2);





class GenericDatasourceQueryCtrl extends __WEBPACK_IMPORTED_MODULE_0_app_plugins_sdk__["QueryCtrl"] {

  constructor($scope, $injector, $http, $q, datasourceSrv, $location) {
    super($scope, $injector);

    this.$http = $http;
    this.$scope = $scope;
    this.$q = $q;
    this.$location = $location;

    this.target.humioQuery = this.target.humioQuery || 'timechart()';
    this.target.humioDataspace = this.target.humioDataspace || undefined;

    this.dataspaces = [];
    this._getHumioDataspaces().then((r) => {
      this.dataspaces = r;
    });
  }

  getHumioLink() {
    // NOTE: settings for timechart
    let isLive = this.$location.search().hasOwnProperty('refresh') &&
      (__WEBPACK_IMPORTED_MODULE_3__helper__["a" /* HumioHelper */].checkToDateNow(this.datasource.timeRange.raw.to));

    let start = '24h';
    let end = undefined;

    if (isLive) {
      start = __WEBPACK_IMPORTED_MODULE_3__helper__["a" /* HumioHelper */].parseDateFrom(this.datasource.timeRange.raw.from);
    } else {
      start = this.datasource.timeRange.from._d.getTime();
      end = this.datasource.timeRange.to._d.getTime();
    }

    let linkSettings = {
      'query': this.target.humioQuery,
      'live': isLive,
      'start': start,
    }

    if (end) {
      linkSettings['end'] = end;
    }

    let widgetType = __WEBPACK_IMPORTED_MODULE_3__helper__["a" /* HumioHelper */].getPanelType(this.target.humioQuery);
    if (widgetType == 'time-chart') {
      linkSettings['widgetType'] = widgetType;
      linkSettings['legend'] = 'y';
      linkSettings['lx'] = '';
      linkSettings['ly'] = '';
      linkSettings['mn'] = '';
      linkSettings['mx'] = '';
      linkSettings['op'] = '0.2';
      linkSettings['p'] = 'a';
      linkSettings['pl'] = '';
      linkSettings['plY'] = '';
      linkSettings['s'] = '';
      linkSettings['sc'] = 'lin';
      linkSettings['stp'] = 'y';
    }

    return this.datasource.url + '/' + this.target.humioDataspace +
      '/search?' + this._serializeQueryOpts(linkSettings);
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  showHumioLink() {
    if (this.datasource.timeRange) {
      return true;
    } else {
      return false;
    }
  }

  _serializeQueryOpts(obj) {
    var str = [];
    for (var p in obj)
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  }

  _getHumioDataspaces() {
    if (this.datasource.url) {

      var requestOpts = {
        method: 'GET',
        url: this.datasource.url + '/api/v1/dataspaces',
        headers: this.datasource.headers
      };

      return this.datasource.backendSrv.datasourceRequest(requestOpts).then((r) => {
        let res = r.data.map((ds) => {
          return ({
            value: ds.id,
            name: ds.id
          })
        });
        return __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.sortBy(res, ['name']);
      });
    } else {
      return this.$q.when([]);
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = GenericDatasourceQueryCtrl;


// GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
GenericDatasourceQueryCtrl.template = __webpack_require__(14);


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = ApppluginsSdk;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(10);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(12)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/postcss-loader/lib/index.js!./query-editor.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/postcss-loader/lib/index.js!./query-editor.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)(false);
// imports


// module
exports.push([module.i, ".generic-datasource-query-row .query-keyword {\n  width: 75px;\n}\n\n.query-editor-rows.gf-form-group>.gf-form-query {\n  display: none;\n}\n", ""]);

// exports


/***/ }),
/* 11 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(13);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 13 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var pug = __webpack_require__(0);

function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;pug_html = pug_html + "\u003Ca ng-href=\"{{ctrl.getHumioLink()}}\" ng-show=\"ctrl.showHumioLink()\" target=\"_blank\"\u003EOpen query in Humio\u003C\u002Fa\u003E\u003Cdiv class=\"gf-form-query\"\u003E\u003Cdiv class=\"gf-form-query-content\"\u003E\u003Cdiv class=\"gf-form-inline\"\u003E\u003Cdiv class=\"gf-form gf-form--grow\"\u003E\u003Ctextarea class=\"gf-form-input\" ng-model=\"ctrl.target.humioQuery\" on-change=\"ctrl.onChangeInternal()\" data-min-length=\"0\" data-items=\"100\" ng-model-onblur spellcheck=\"false\" rows=\"3\"\u003E\u003C\u002Ftextarea\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"gf-form\"\u003E\u003Cspan class=\"gf-form-label width-7\"\u003EDataspace\u003C\u002Fspan\u003E\u003Cspan class=\"gf-form-select-wrapper\"\u003E\u003Cselect class=\"gf-form-input gf-size-auto\" ng-model=\"ctrl.target.humioDataspace\" ng-options=\"v.value as v.name for v in ctrl.dataspaces\"\u003E\u003C\u002Fselect\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";;return pug_html;};
module.exports = template;

/***/ }),
/* 15 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class HumioConfigCtrl {

  /** @ngInject */
  constructor($scope, $injector, $q, $http) {
    this.current = this.current || {};
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.humioToken = this.current.jsonData.humioToken || "developer";
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = HumioConfigCtrl;


// HumioConfigCtrl.templateUrl = 'partials/config.html';
HumioConfigCtrl.template = __webpack_require__(17);


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var pug = __webpack_require__(0);

function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;pug_html = pug_html + "\u003Cdatasource-http-settings current=\"ctrl.current\" suggest-url=\"https:\u002F\u002Fcloud.humio.com\u002F\"\u003E\u003C\u002Fdatasource-http-settings\u003E\u003Ch5\u003EHumio access token\u003C\u002Fh5\u003E\u003Cdiv class=\"gf-form\"\u003E\u003Cinput class=\"gf-form-input\" type=\"text\" ng-model=\"ctrl.current.jsonData.humioToken\" placeholder=\"\"\u003E\u003C\u002Fdiv\u003E";;return pug_html;};
module.exports = template;

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class GenericQueryOptionsCtrl {}
/* harmony export (immutable) */ __webpack_exports__["a"] = GenericQueryOptionsCtrl;

// GenericQueryOptionsCtrl.templateUrl = 'partials/query.options.html';
GenericQueryOptionsCtrl.template = __webpack_require__(19);


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var pug = __webpack_require__(0);

function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;pug_html = pug_html + "\u003Csection class=\"grafana-metric-options\"\u003E\u003C\u002Fsection\u003E";;return pug_html;};
module.exports = template;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var pug = __webpack_require__(0);

function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;pug_html = pug_html + "\u003Ch5 class=\"section-heading\"\u003EQuery\u003C\u002Fh5\u003E\u003Cdiv class=\"gf-form-group\"\u003E\u003Cdiv class=\"gf-form\"\u003E\u003Cinput class=\"gf-form-input\" type=\"text\" ng-model=\"ctrl.annotation.query\" placeholder=\"\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";;return pug_html;};
module.exports = template;

/***/ })
/******/ ]);
    }
  }
});
