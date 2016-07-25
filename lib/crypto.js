/**
 * Created by synder on 16/7/16.
 */


var crypto = require('crypto');

//hash-----------------------------------------------------------
exports.md5Hash = function (content, format) {
    format = format || 'hex';
    return crypto.createHash('md5').update(content).digest(format);
};

exports.sha256Hash = function (content, format) {
    format = format || 'hex';
    return crypto.createHash('sha256').update(content).digest(format);
};

//base64---------------------------------------------------------
exports.base64Encoding = function (str) {
    var temp = new Buffer(str);
    return temp.toString('base64');
};

exports.base64Decoding = function (str) {
    var temp = new Buffer(str, 'base64');
    return temp.toString();
};

//hmac-----------------------------------------------------------
exports.sha256Hmac = function (secret, format, content) {
    const hmac = crypto.createHmac('sha256', secret);

    if(arguments.length === 3){
        hmac.update(content);
        return hmac.digest(format)
    }else{
        return hmac;
    }
};

exports.md5Hmac = function (secret, format, content) {
    const hmac = crypto.createHmac('md5', secret);

    if(arguments.length === 3){
        hmac.update(content);
        return hmac.digest(format)
    }else{
        return hmac;
    }
};
