/**
 * Created by synder on 16/6/20.
 */

const http = require('http');
const https = require('https');
const querystring = require('querystring');

var contentType = function (res) {
    var content = res.headers['content-type'];
    var temp = content ? content.split(';') : [];
    var type = temp.length > 0 ? temp[0] : '';
    var encode = temp.length > 1 ? temp[1].split('=')[1] : 'utf-8';
    return type ? type.split(';')[0] : '';
};

var hasBody = function (req) {
    return 'content-length' in req.headers || 'transfer-encoding' in req.headers;
};

var parseBody = function (res, callback) {
    if(hasBody(res)){
        var temp = [];
        res.on('data', function (chunk) {
            temp.push(chunk);
        });
        res.on('end', function () {
            callback(null, Buffer.concat(temp));
        });
        res.on('error', function (err) {
            callback(err);
        });
    }else{
        callback(null, null);
    }
};

var parseJson = function (res, next) {

    try {
        req.body = JSON.parse(req.raw.toString());
    }catch (ex){
        res.writeHead(400);
        return res.end('Invalid JSON');
    }

    next(req, res);
};

var parseUrlencodedForm = function (req, res, next) {

    req.body = querystring.parse(req.raw.toString());

    next(req, res);
};

var parseMultipartForm = function (req, res, next) {

};

var Client = function (opt) {
    this.protocol = opt.prototype;
    this.host = opt.host;
    this.port = opt.port;
    this.path = opt.path;
    this.headers = opt.headers || {};
    this.auth = opt.auth;
    this.agent = opt.agent;
};

/**
 * @desc 签名
 * */
Client.signature = function (opt) {

};

Client.prototype.request = function (method, data, callback) {
    const self = this;

    method = method.toUpperCase();

    var options = {
        hostname: self.host,
        port: self.port,
        path: self.path,
        headers : self.headers,
        method: method
    };

    if(self.auth){
        options.auth = self.auth;
    }

    if(self.agent){
        options.agent = self.agent;
    }

    var postData = querystring.stringify(data);

    // options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    // options.headers['Content-Length'] = Buffer.byteLength(postData);

    var req = http.request(options, function(res) {

        console.log(res.headers);

        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            console.log(chunk);
        });
        
        res.on('end', function () {
            console.log('end');
        });
    });

    req.on('error', function(e) {
        console.error(e);
    });

    //req.write(postData);
    req.end();
};


Client.prototype.head = function () {
    
};

Client.prototype.get = function () {

};

Client.prototype.post = function () {

};

Client.prototype.put = function () {

};

Client.prototype.delete = function () {

};

Client.prototype.patch = function () {

};

var client = new Client({
    protocol: 'http',
    host: 'ip.taobao.com',
    port: 80,
    path: '/service/getIpInfo.php?ip=121.35.211.41'
});

client.request('get', null, function () {
    
});