/**
 * Created by synder on 16/6/20.
 */

exports.isNull = function (val) {
    return val === null;
};

exports.isUndefined = function (val) {
    return val === undefined;
};

exports.isNullOrUndefined = function (val) {
    return val == null;
};

exports.isDate = function (val) {
    return val.constructor === Date;
};

exports.isArray = function isArray(val) {
    return Array.isArray(val);
};

exports.isString = function isString(val) {
    return typeof val === 'string';
};

exports.isNumber = function isNumber(val) {
    return typeof val === 'number';
};

exports.isFunction = function(v){
    return typeof v === 'function';
};

exports.isNaN = function isNaN(val) {
    return isNaN(val);
};

exports.isRegExp = function(v){
    return v.constructor === RegExp;
};

exports.isBool = function (val) {
    return typeof val === 'boolean';
};

exports.isInt = function (val) {
    return typeof val === 'number' && ((val | 0) === val);
};

exports.isFloat = function (val) {
    return typeof val === 'number' && !((val | 0) === val);
};

exports.isObject = function (obj) {
    return obj !== null && typeof obj === 'object';
};

exports.isDictionary = function (obj) {
    return obj !== null && !Array.isArray(obj) && typeof obj === 'object';
};

exports.isBuffer = function (obj) {
    return Buffer.isBuffer(obj);
};