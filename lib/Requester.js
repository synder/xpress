/**
 * Created by synder on 15/9/19.
 *
 * @desc api请求方法封装
 */

const url = require('url');
const request = require('request');
const crypto = require('crypto');
const Xpress = require('./Xpress');

/**
 * @params config
 * {
 *  config.protocol;  //api使用协议
 *  config.host;      //api主机地址
 *  config.port;      //api主机端口
 *  config.appKey;    //appKey    如果需要app验证需要添加这个参数
 *  config.appSecret; //appSecret 如果需要app验证需要添加这个参数, 表示app秘钥
 *  config.timeout;   //api请求默认超时时间
 * */
const Requester = function(config){

    if(!config.protocol){
        throw new Error('config.protocol should be http or https');
    }

    if(!config.host){
        throw new Error('config.host should not be null or undefined');
    }

    if(!config.port){
        throw new Error('config.port should not be null or undefined');
    }

    if(!config.appKey){
        throw new Error('config.key should not be null or undefined');
    }

    if(!config.appSecret){
        throw new Error('config.secret should not be null or undefined');
    }

    this.__protocol = config.protocol;
    this.__host = config.host;
    this.__port = config.port;
    this.__appKey = config.appKey;
    this.__appSecret = config.appSecret;
    this.__timeout = config.timeout || 200;

    this.__authAppKeyHeader = Requester.defaults.AuthAppKeyHeader;
    this.__authSignatureHeader = Requester.defaults.AuthSignatureHeader;
    this.__authTimestampHeader = Requester.defaults.AuthTimestampHeader;
};

Requester.defaults = {
    AuthAppKeyHeader : 'X-Auth-AppKey',
    AuthSignatureHeader : 'X-Auth-Signature',
    AuthTimestampHeader : 'X-Auth-Timestamp'
};


////////////////////////////////////////////////////////
/**
 * @desc requester sign
 * */
Requester.sign = function (key, secret, timestamp){

    if(!key){
        throw new Error('appKey should not be null or undefined');
    }

    if(!secret){
        throw new Error('appSecret should not be null or undefined');
    }

    if(!timestamp){
        throw new Error('timestamp should not be null or undefined');
    }

    var temp = [key, secret, timestamp].sort();

    return crypto.createHash('sha1').update(temp.join('')).digest('hex');
};

/**
 * @desc 验证签名
 * */
Requester.auth = function (key, secret, timestamp, signature){
    return Requester.sign(key, secret, timestamp) === signature;
};

/**
 * @desc get  header
 * */
Requester.getAuthAppKey = function (req) {
    return req.get(Requester.defaults.AuthAppKeyHeader);
};

Requester.getAuthTimestamp = function (req) {
    return req.get(Requester.defaults.AuthTimestampHeader);
};

Requester.getAuthSignature = function (req) {
    return req.get(Requester.defaults.AuthSignatureHeader);
};

////////////////////////////////////////////////////////

/**
 * @desc format request url
 * */
Requester.prototype.__url = function(options){
    return url.format({
        protocol : this.__protocol,
        hostname : this.__host,
        port : this.__port,
        pathname : options.path,
        query : options.query
    });
};


/**
 * @desc 初始化请求参数
 * */
Requester.prototype.__init = function(method, options){

    var self = this;

    if(!options.version){
        console.warn('options.version is not assign');
    }

    if(!options.channel){
        console.warn('options.channel is not assign');
    }

    if(!options.path){
        throw new Error('option.path is not assign');
    }

    if(options.query && (typeof options.query !== 'object')){
        throw new Error('option.query must be an Object instance');
    }

    var requestUrl = self.__url(options);

    method = method.toUpperCase();

    var requestOptions = {
        method : method.toUpperCase(),
        url : requestUrl,
        timeout : options.timeout || self.__timeout,
        headers : options.header || {}
    };

    var timestamp = Date.now();
    var signature = Requester.sign(self.__appKey, self.__appSecret, timestamp);
    requestOptions.headers[self.__authAppKeyHeader] = self.__appKey;
    requestOptions.headers[self.__authSignatureHeader] = signature;
    requestOptions.headers[self.__authTimestampHeader] = timestamp;

    if(options.version){
        requestOptions.headers[Xpress.defaults.versionHeader] = options.version;
    }

    if(options.channel){
        requestOptions.headers[Xpress.defaults.channelHeader] = options.channel;
    }

    if(options.upload){
        if(typeof options.query !== 'object'){
            throw new Error('option.query must be an Object instance');
        }
        requestOptions.formData = options.upload;
    }

    if(options.body){
        if(typeof options.body === 'object'){
            requestOptions.json = true;
        }
        requestOptions.body = options.body;
    }

    return requestOptions;
};

/**
 * @desc 请求数据
 * */
Requester.prototype.__request = function (method, options, callback) {

    var temp = this.__init(method, options);

    if(!callback){
        return request(temp);
    }

    request(temp, function (err, response, body) {

        if(err){
            return callback(err);
        }

        if (typeof body == 'object') {
            return callback(null, body, response.headers);
        }

        if(response.statusCode >= 300){
            return callback(err, response, body);
        }

        var contentType = response.headers['content-type'];

        if(contentType.indexOf('application/json') >= 0){
            try{
                callback(null, JSON.parse(body), response.headers);
            }catch (ex){
                callback(ex, body, response.headers);
            }
        }else{
            callback(null, body, response.headers);
        }
    });
};


/**
 * @params options
 * options.header   //自定义的header参数 {'Content-Type':'Application/Json'}
 * options.channel  //Api请求频道 'DESKTOP' | 'IOS' | 'ANDROID'
 * options.version  //Api请求版本 10
 * options.query    //url的查询参数
 * options.auth     //基础验证
 * */
Requester.prototype.header = function(options, callback) {
    return this.__request('header', options, callback);
};


/**
 * @params options
 * options.header   //自定义的header参数 {'Content-Type':'Application/Json'}
 * options.channel  //Api请求频道 'DESKTOP' | 'IOS' | 'ANDROID'
 * options.version  //Api请求版本 10
 * options.query    //url的查询参数
 * options.auth     //基础验证
 * */
Requester.prototype.get = function(options, callback){
    return this.__request('get', options, callback);
};

/**
 * @params options
 * options.header   //自定义的header参数 {'Content-Type':'Application/Json'}
 * options.channel  //Api请求频道 'DESKTOP' | 'IOS' | 'ANDROID'
 * options.version  //Api请求版本 10
 * options.query    //url的查询参数
 * options.auth     //基础验证
 * */
Requester.prototype.delete = function(options, callback){
    return this.__request('delete', options, callback);
};


/**
 * @params options
 * options.header   //自定义的header参数 {'Content-Type':'Application/Json'}
 * options.channel  //Api请求频道 'DESKTOP' | 'IOS' | 'ANDROID'
 * options.version  //Api请求版本 10
 * options.query    //url的查询参数
 * options.body     //Body中以Json方式发送的参数 { name : 'sam', age : 20}
 * options.upload   //以Form-Data方式上传数据 { avatar : new Buffer(), card : fs.createReadStream()}
 * options.auth     //基础验证
 * */
Requester.prototype.post = function(options, callback){
    return this.__request('post', options, callback);
};


/**
 * @params options
 * options.header   //自定义的header参数 {'Content-Type':'Application/Json'}
 * options.channel  //Api请求频道 'DESKTOP' | 'IOS' | 'ANDROID'
 * options.version  //Api请求版本 10
 * options.query    //url的查询参数
 * options.body     //Body中以Json方式发送的参数 { name : 'sam', age : 20}
 * options.upload   //以Form-Data方式上传数据 { avatar : new Buffer(), card : fs.createReadStream()}
 * options.auth     //基础验证
 * */
Requester.prototype.put = function(options, callback){
    return this.__request('put', options, callback);
};

/**
 * @params options
 * options.header   //自定义的header参数 {'Content-Type':'Application/Json'}
 * options.channel  //Api请求频道 'DESKTOP' | 'IOS' | 'ANDROID'
 * options.version  //Api请求版本 10
 * options.query    //url的查询参数
 * options.body     //Body中以Json方式发送的参数 { name : 'sam', age : 20}
 * options.upload   //以Form-Data方式上传数据 { avatar : new Buffer(), card : fs.createReadStream()}
 * options.auth     //基础验证
 * */
Requester.prototype.patch = function(options, callback){
    return this.__request('patch', options, callback);
};


module.exports = Requester;