/**
 * Created by synder on 16/5/31.
 */


const parser = require('../lib/parser');
const string = require('../lib/string');
const type = require('../lib/type');
const url = require('../lib/url');

const artTemplateNative = require('art-template/node/template-native.js');

artTemplateNative.helper('Array', Array);
artTemplateNative.helper('Boolean', Boolean);
artTemplateNative.helper('Date', Date);
artTemplateNative.helper('Math', Math);
artTemplateNative.helper('Number', Number);
artTemplateNative.helper('String', String);
artTemplateNative.helper('RegExp', RegExp);

artTemplateNative.helper('$parseInt', parser.parseInt);
artTemplateNative.helper('$parseFloat', parser.parseFloat);
artTemplateNative.helper('$parseNumber', parser.parseNumber);
artTemplateNative.helper('$parseTime', parser.parseTime);
artTemplateNative.helper('$parseDate', parser.parseDate);
artTemplateNative.helper('$parseDateTime', parser.parseDateTime);
artTemplateNative.helper('$parseBool', parser.parseBool);
artTemplateNative.helper('$parseUrl', parser.parseUrl);
artTemplateNative.helper('$parseJson', parser.parseJson);

artTemplateNative.helper('$urlPathJoin', url.urlPathJoin);
artTemplateNative.helper('$urlPathVersion', url.urlPathVersion);
artTemplateNative.helper('$urlFormat', url.urlFormat);

artTemplateNative.helper('$encodeURIComponent', encodeURIComponent);
artTemplateNative.helper('$decodeURIComponent', decodeURIComponent);
artTemplateNative.helper('$encodeURI', encodeURI);
artTemplateNative.helper('$decodeURI', decodeURI);

artTemplateNative.helper('$date', string.date);
artTemplateNative.helper('$time', string.time);
artTemplateNative.helper('$dateTime', string.dateTime);

artTemplateNative.helper('$format', string.format);
artTemplateNative.helper('$join', string.join);
artTemplateNative.helper('$trim', string.trim);
artTemplateNative.helper('$pad', string.pad);
artTemplateNative.helper('$unit', string.unit);
artTemplateNative.helper('$mask', string.mask);
artTemplateNative.helper('$quote', string.quote);
artTemplateNative.helper('$clean', string.clean);
artTemplateNative.helper('$lines', string.lines);
artTemplateNative.helper('$splicing', string.splicing);
artTemplateNative.helper('$signed', string.signed);
artTemplateNative.helper('$toString', string.stringify);
artTemplateNative.helper('$truncate', string.truncate);
artTemplateNative.helper('$capitalize', string.capitalize);
artTemplateNative.helper('$upperCase', string.upperCase);
artTemplateNative.helper('$lowerCase', string.lowerCase);

artTemplateNative.helper('$currency', string.currency);
artTemplateNative.helper('$chineseCurrency', string.chineseCurrency);
artTemplateNative.helper('$thousands', string.thousands);
artTemplateNative.helper('$bankCard', string.bankCard);
artTemplateNative.helper('$percentage', string.percentage);
artTemplateNative.helper('$number', string.number);

artTemplateNative.helper('$isNull', type.isNull);
artTemplateNative.helper('$isUndefined', type.isUndefined);
artTemplateNative.helper('$isNullOrUndefined', type.isNullOrUndefined);
artTemplateNative.helper('$isDate', type.isDate);
artTemplateNative.helper('$isArray', type.isArray);
artTemplateNative.helper('$isString', type.isString);
artTemplateNative.helper('$isNumber', type.isNumber);
artTemplateNative.helper('$isNaN', type.isNaN);
artTemplateNative.helper('$isBool', type.isBool);
artTemplateNative.helper('$isInt', type.isInt);
artTemplateNative.helper('$isFloat', type.isFloat);
artTemplateNative.helper('$isObject', type.isObject);
artTemplateNative.helper('$isDictionary', type.isDictionary);

exports.engine = artTemplateNative;