/**
 * Created by synder on 16/5/31.
 */

var path = require('path');
var url = require('url');

//----------------------------------------------------------------
exports.newDate = function (date) {
    return new Date(date);
};

//----------------------------------------------------------------
exports.parseInt = parseInt;

exports.parseFloat = parseFloat;

//----------------------------------------------------------------
exports.encodeURIComponent = encodeURIComponent;

exports.encodeURI = encodeURI;

//----------------------------------------------------------------
exports.date = function (date, dateJoin) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    if (!dateJoin) {
        return year + '年' + month + '月' + day + '日';
    } else {
        return year + dateJoin + month + dateJoin + day;
    }
};

exports.time = function (date, timeJoin) {
    date = new Date(date);
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds() + 1;

    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;

    if (!timeJoin) {
        return hour + '时' + minute + '分' + second + '秒';
    } else {
        return hour + timeJoin + minute + timeJoin + second;
    }
};

exports.dateTime = function (date, dateJoin, timeJoin) {
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
    if (!dateJoin) {
        dateTemp = year + '年' + month + '月' + day + '日';
    } else {
        dateTemp = year + dateJoin + month + dateJoin + day;
    }

    var timeTemp = '';
    if (!timeJoin) {
        timeTemp = hour + '时' + minute + '分' + second + '秒';
    } else {
        timeTemp = hour + timeJoin + minute + timeJoin + second;
    }

    return dateTemp + ' ' + timeTemp;
};

exports.string = function (content) {
    if(content == null){
        return '';
    }

    if(typeof content === 'object'){
        return JSON.stringify(content);
    }

    return content + '';
};

//----------------------------------------------------------------
exports.versionPath = function (path, version) {
    return path + '?version=' + version;
};

exports.joinPath = path.join;

exports.normalizePath = path.normalize;

//----------------------------------------------------------------
exports.urlFormat = function (pathname, query, protocol, hostname, port, hash) {
    return url.format({
        protocol: protocol,
        port: port,
        hostname: hostname,
        query: query,
        pathname: pathname,
        hash: hash
    });
};

exports.urlResolve = url.resolve;

//----------------------------------------------------------------
exports.join = function () {
    if (arguments.length === 0) {
        return '';
    }

    if (arguments.length === 1) {
        return (arguments[0] == null) ? '' : arguments[i] + '';
    }

    var joiner = arguments[arguments.length - 1];

    var temp = [];

    for (var i = 0, len = arguments.length - 1; i < len; i++) {

        arguments[i] = (arguments[i] == null) ? '' : arguments[i] + '';

        if(!arguments[i]){
            continue;
        }

        temp.push(arguments[i]);
    }

    return temp.join(joiner);
};

exports.trim = function (str) {
    str = (str == null) ? '' : str + '';
    return str.trim();
};

exports.pad = function pad(str, length, padStr, direction) {
    str = (str == null) ? '' : str + '';

    length = ~~length;

    var padLen = 0;

    if (!padStr){
        padStr = ' ';
    } else if (padStr.length > 1){
        padStr = padStr.charAt(0);
    }

    var strRepeat = function (str, times) {
        if (times < 1) return '';
        var result = '';
        while (times > 0) {
            if (times & 1) {
                result += str;
            }
            times >>= 1;
            str += str;
        }
        return result;
    };

    switch (direction) {
        case 'right':
            padLen = length - str.length;
            return str + strRepeat(padStr, padLen);
        case 'both':
            padLen = length - str.length;
            return strRepeat(padStr, Math.ceil(padLen / 2)) + str + strRepeat(padStr, Math.floor(padLen / 2));
        default:
            padLen = length - str.length;
            return strRepeat(padStr, padLen) + str;
    }
};

exports.quote = function (str, quoteChar) {
    quoteChar = quoteChar || '"';
    return [quoteChar, str, quoteChar].join('');
};

exports.clean = function (str) {
    str = (str == null) ? '' : str + '';
    return str.trim().replace(/\s\s+/g, ' ');
};

exports.lines = function (str) {
    str = (str == null) ? '' : str + '';

    if (!str) {
        return [];
    }

    return str.split(/\r\n?|\n]/);
};

exports.truncate = function (str, length, ellipsis) {
    str = (str == null) ? '' : str + '';
    ellipsis = (ellipsis == null) ? '' : ellipsis + '';

    var res = str.slice(0, length - ellipsis.length);
    if (ellipsis) {
        res += ellipsis;
    }
    return res;
};

exports.capitalize = function (str, lowercaseRest) {
    str = (str == null) ? '' : str + '';
    var remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();
    return str.charAt(0).toUpperCase() + remainingChars;
};

exports.upperCase = function (str) {
    str = (str == null) ? '' : str + '';
    return str.toUpperCase();
};

exports.lowerCase = function (str) {
    str = (str == null) ? '' : str + '';
    return str.toLowerCase();
};

//----------------------------------------------------------------
exports.currency = function (money, unit, n) {
    n = n || 2;
    unit = unit || '';
    money = parseFloat(money) || 0;
    money = money.toFixed(n);
    money = money + '';

    var temp = money.split('.');
    var decimal = temp.length > 1 ? temp[1] : '';
    var integer = temp[0];
    var result = '';

    while (integer.length > 3) {
        result = ',' + integer.slice(-3) + result;
        integer = integer.slice(0, integer.length - 3);
    }
    if (integer) {
        result = integer + result;
    }

    if (decimal) {
        result = result + '.' + decimal;
    }

    return unit + result;
};

exports.chineseCurrency = function (money) {

    var number = String(money);

    number = number.split('.')[0];

    const NUM = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "扒", "玖", "拾"],
        BASE_UNIT = ["", "拾", "佰", "仟"],
        ADVANCE_UNIT = ["", "萬", "亿", "兆"];

    var last = number.length % 4;

    var temp = [];

    for(var i = 0; i < number.length; i++){

        var index = 0;

        if(last > 0){
            index = Math.floor((i + (4 - last)) / 4);
        }else{
            index = Math.floor(i / 4);
        }

        if(!temp[index]){
            temp[index] = [];
        }

        temp[index].push(NUM[number[i]]);
    }

    var result = '';

    for(var j = 0; j < temp.length; j++){
        for(var k = 0, len = temp[j].length; k < len; k++){
            temp[j][k] = temp[j][k] == NUM[0] ? temp[j][k] : temp[j][k] + BASE_UNIT[len - k - 1];
            if(k == 3 && temp[j][k] == NUM[0]){
                temp[j][k] = '';
            }
        }

        result += temp[j].join('') + ADVANCE_UNIT[temp.length - j - 1];
    }

    return result;
};

exports.thousands = function (money, n) {
    n = n || 2;
    money = parseFloat(money) || 0;
    money = money.toFixed(n);
    money = money + '';

    var temp = money.split('.');
    var decimal = temp.length > 1 ? temp[1] : '';
    var integer = temp[0];
    var result = '';

    while (integer.length > 3) {
        result = ',' + integer.slice(-3) + result;
        integer = integer.slice(0, integer.length - 3);
    }
    if (integer) {
        result = integer + result;
    }

    if (decimal) {
        result = result + '.' + decimal;
    }

    return result;
};

exports.bankCard = function (card) {

    card = card + '';

    var result = '';

    while (card.length > 4) {
        result = result + card.slice(0, 4) + ' ';
        card = card.substr(4);
    }

    if (card) {
        result += card;
    }

    return result;
};

exports.percentage = function (number, n) {

    if (typeof number !== 'number') {
        number = parseFloat(number) || 0;
    }

    number = number * 100;

    if (n) {
        number = number.toFixed(n);
    }

    return number + '%';
};

exports.number = function (number, fraction) {

    if(fraction == null){
        return number;
    }

    fraction = parseInt(fraction) || 0;

    if (typeof number !== 'number') {
        number = parseFloat(number) || 0;
    }

    return number.toFixed(fraction);
};

//----------------------------------------------------------------
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

exports.isBool = function (val) {
    return typeof val === 'boolean';
};

exports.isInt = function (val) {
    return typeof val === 'number' && ((val | 0) === v);
};

exports.isFloat = function (val) {
    return typeof val === 'number' && !((val | 0) === v);
};

exports.isObject = function (obj) {
    return obj !== null && typeof obj === 'object';
};

exports.isDictionary = function (obj) {
    return obj !== null && !Array.isArray(obj) && typeof obj === 'object';
};