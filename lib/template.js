/**
 * Created by synder on 16/5/31.
 */


const func = require('./func');
const artTemplateNative = require('art-template/node/template-native.js');

artTemplateNative.helper('Array', func.Array);
artTemplateNative.helper('Boolean', func.Boolean);
artTemplateNative.helper('Date', func.Date);
artTemplateNative.helper('Math', func.Math);
artTemplateNative.helper('Number', func.Number);
artTemplateNative.helper('String', func.String);
artTemplateNative.helper('RegExp', func.RegExp);

artTemplateNative.helper('@parseInt', func.parseInt);
artTemplateNative.helper('@parseFloat', func.parseFloat);

artTemplateNative.helper('@encodeURIComponent', func.encodeURIComponent);
artTemplateNative.helper('@decodeURIComponent', func.decodeURIComponent);
artTemplateNative.helper('@encodeURI', func.encodeURI);
artTemplateNative.helper('@decodeURI', func.decodeURI);

artTemplateNative.helper('@date', func.date);
artTemplateNative.helper('@time', func.time);
artTemplateNative.helper('@dateTime', func.dateTime);

artTemplateNative.helper('@joinPath', func.joinPath);
artTemplateNative.helper('@versionPath', func.versionPath);
artTemplateNative.helper('@normalizePath', func.normalizePath);

artTemplateNative.helper('@urlFormat', func.urlFormat);
artTemplateNative.helper('@urlResolve', func.urlResolve);

artTemplateNative.helper('@join', func.join);
artTemplateNative.helper('@trim', func.trim);
artTemplateNative.helper('@pad', func.pad);
artTemplateNative.helper('@unit', func.unit);
artTemplateNative.helper('@mask', func.mask);
artTemplateNative.helper('@quote', func.quote);
artTemplateNative.helper('@clean', func.clean);
artTemplateNative.helper('@lines', func.lines);
artTemplateNative.helper('@string', func.string);
artTemplateNative.helper('@truncate', func.truncate);
artTemplateNative.helper('@capitalize', func.capitalize);
artTemplateNative.helper('@upperCase', func.upperCase);
artTemplateNative.helper('@lowerCase', func.lowerCase);

artTemplateNative.helper('@currency', func.currency);
artTemplateNative.helper('@chineseCurrency', func.chineseCurrency);
artTemplateNative.helper('@thousands', func.thousands);
artTemplateNative.helper('@bankCard', func.bankCard);
artTemplateNative.helper('@percentage', func.percentage);
artTemplateNative.helper('@number', func.number);

artTemplateNative.helper('@isNull', func.isNull);
artTemplateNative.helper('@isUndefined', func.isUndefined);
artTemplateNative.helper('@isNullOrUndefined', func.isNullOrUndefined);
artTemplateNative.helper('@isDate', func.isDate);
artTemplateNative.helper('@isArray', func.isArray);
artTemplateNative.helper('@isString', func.isString);
artTemplateNative.helper('@isNumber', func.isNumber);
artTemplateNative.helper('@isNaN', func.isNaN);
artTemplateNative.helper('@isBool', func.isBool);
artTemplateNative.helper('@isInt', func.isInt);
artTemplateNative.helper('@isFloat', func.isFloat);
artTemplateNative.helper('@isObject', func.isObject);
artTemplateNative.helper('@isDictionary', func.isDictionary);

exports.engine = artTemplateNative;