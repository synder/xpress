/**
 * Created by synder on 16/6/20.
 */

var url = require('url');

exports.parseTime = function (date) {
    date = new Date(date);

    return {
        hour : date.getHours(),
        minute: date.getMinutes(),
        second : date.getSeconds() + 1
    };
};

exports.parseDate = function (date) {
    date = new Date(date);

    return {
        year : date.getFullYear(),
        month: date.getMonth() + 1,
        day : date.getDate()
    };
};

exports.parseDateTime = function (date) {
    date = new Date(date);
    return {
        year : date.getFullYear(),
        month: date.getMonth() + 1,
        day : date.getDate(),
        hour : date.getHours(),
        minute: date.getMinutes(),
        second : date.getSeconds() + 1
    };
};

exports.parseInt = function (num, defaults) {
    if(defaults == 0){
        return parseInt(num) || defaults;
    }else{
        return parseInt(num) || defaults || null;
    }

};

exports.parseFloat = function (num, defaults) {
    if(defaults == 0){
        return parseFloat(num) || defaults;
    }else{
        return parseFloat(num) || defaults || null;
    }
};

exports.parseNumber = function (num, defaults) {
    if(defaults == 0){
        return parseFloat(num) || defaults;
    }else{
        return parseFloat(num) || defaults || null;
    }
};

exports.parseBool = function (obj) {
    return !!obj;
};

exports.parseUrl = url.parse;

exports.parseJson = function (str) {
    return JSON.parse(str);
};