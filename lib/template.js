/**
 * Created by synder on 16/5/31.
 */


const func = require('./func');
const artTemplateNative = require('art-template/node/template-native.js');

artTemplateNative.helper('encodeURIComponent', func.encodeURIComponent);
artTemplateNative.helper('encodeURI', func.encodeURI);
artTemplateNative.helper('parseInt', func.parseInt);
artTemplateNative.helper('parseFloat', func.parseFloat);
artTemplateNative.helper('dateFormat', func.dateFormat);
artTemplateNative.helper('dateTimeFormat', func.dateTimeFormat);
artTemplateNative.helper('timeFormat', func.timeFormat);
artTemplateNative.helper('pathJoin', func.pathJoin);
artTemplateNative.helper('urlFormat', func.urlFormat);
artTemplateNative.helper('versionPath', func.versionPath);
artTemplateNative.helper('isNull', func.isNull);
artTemplateNative.helper('isUndefined', func.isUndefined);
artTemplateNative.helper('isNullOrUndefined', func.isNullOrUndefined);
artTemplateNative.helper('isDate', func.isDate);
artTemplateNative.helper('isArray', func.isArray);
artTemplateNative.helper('isString', func.isString);
artTemplateNative.helper('isNumber', func.isNumber);
artTemplateNative.helper('isBool', func.isBool);
artTemplateNative.helper('isInt', func.isInt);
artTemplateNative.helper('isFloat', func.isFloat);
artTemplateNative.helper('isObject', func.isObject);
artTemplateNative.helper('isDictionary', func.isDictionary);

exports.express = artTemplateNative.__express;