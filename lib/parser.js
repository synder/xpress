/**
 * Created by synder on 16/6/20.
 */

var url = require('url');

exports.parseTime = function (date) {

    if(!date){
        return null;
    }

    if(date.constructor !== Date){
        throw new Error('param must a Date instance');
    }

    return {
        hour : date.getHours(),
        minute: date.getMinutes(),
        second : date.getSeconds() + 1
    };
};

exports.parseDate = function (date) {

    if(!date){
        return null;
    }

    if(date.constructor !== Date){
        throw new Error('param must a Date instance');
    }

    return {
        year : date.getFullYear(),
        month: date.getMonth() + 1,
        day : date.getDate()
    };
};

exports.parseDateTime = function (date) {

    if(!date){
        return null;
    }

    if(date.constructor !== Date){
        throw new Error('param must a Date instance');
    }

    return {
        year : date.getFullYear(),
        month: date.getMonth() + 1,
        day : date.getDate(),
        hour : date.getHours(),
        minute: date.getMinutes(),
        second : date.getSeconds() + 1
    };
};

exports.parseInt = function (num, ary, dft) {
    if(arguments.length == 1){
        return parseInt(num) || null;
    }else if(arguments.length == 2){
        return parseInt(num, ary) || null;
    }else if(arguments.length == 3){
        return parseInt(num, ary) || dft;
    }else{
        return null;
    }
};

exports.parseFloat = function (num, dft) {
    if(arguments.length == 1){
        return parseFloat(num) || null;
    }else if(arguments.length == 2){
        return parseFloat(num) || null;
    }else{
        return null;
    }
};

exports.parseNumber = function (num, dft) {
    if(dft == 0){
        return parseFloat(num) || dft;
    }else{
        return parseFloat(num) || dft || null;
    }
};

exports.parseBool = function (obj) {
    return !!obj;
};

exports.parseUrl = url.parse;

exports.parseJson = function (str, dft) {
    var res = dft || null;

    try{
        res = JSON.parse(str);
    }catch (ex){
        console.warn(ex.stack);
    }

    return res;
};