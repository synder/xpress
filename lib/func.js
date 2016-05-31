/**
 * Created by synder on 16/5/31.
 */

var path = require('path');
var url = require('url');

exports.encodeURIComponent = encodeURIComponent;

exports.encodeURI = encodeURI;

exports.parseInt = parseInt;

exports.parseFloat = parseFloat;

exports.dateFormat = function (date, dateJoin) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    if(!dateJoin){
        return year + '年' + month + '月' + day + '日';
    }else{
        return year + dateJoin + month + dateJoin + day;
    }
};

exports.dateTimeFormat = function (date, dateJoin, timeJoin) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds() + 1;

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;

    var dateTemp = '';
    if(!dateJoin){
        dateTemp = year + '年' + month + '月' + day + '日';
    }else{
        dateTemp = year + dateJoin + month + dateJoin + day;
    }

    var timeTemp = '';
    if(!timeJoin){
        timeTemp = hour + '时' + minute + '分' + second + '秒';
    }else{
        timeTemp = hour + timeJoin + minute + timeJoin + second;
    }

    return dateTemp + ' ' + timeTemp;
};

exports.timeFormat = function (date, timeJoin) {
    date = new Date(date);
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds() + 1;

    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;

    if(!timeJoin){
        return hour + '时' + minute + '分' + second + '秒';
    }else{
        return hour + timeJoin + minute + timeJoin + second;
    }
};

exports.versionPath = function (path, version) {
    return path + '?version=' + version;
};

exports.isNull = function (val) {
    return val === null;
};

exports.isUndefined = function (val) {
    return val === undefined;
};

exports.isNullOrUndefined = function (val) {
    return val === undefined || val === null;
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

exports.isBool = function(val) {
    return typeof val === 'boolean';
};

exports.isInt = function(val) {
    return typeof val === 'number' && ((val | 0) === v);
};

exports.isFloat = function(val){
    return typeof val === 'number' && !((val | 0) === v);
};

exports.isObject = function(obj){
    return obj !== null && typeof obj === 'object';
};

exports.isDictionary = function(obj){
    return obj !== null && !Array.isArray(obj) && typeof obj === 'object';
};

exports.pathJoin = path.join;

exports.urlFormat = url.format;