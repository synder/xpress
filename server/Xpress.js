/**
 * @desc Xpress class
 * @author synder
 * @version 2.0.11
 * */
const os = require('os');
const path = require('path');
const util = require('util');
const http = require('http');
const https = require('https');
const debug = require('debug');
const colors = require('colors');
const events = require('events');
const cluster = require('cluster');
const express = require('express');
const fs = require('../lib/fs');
const document = require('../lib/document');
const string = require('../lib/string');
const route = require('./route');
const Router = require('./Router');
const Controller = require('./Controller');
const validator = require('./validator');
const template = require('./template');

const EventEmitter = events.EventEmitter;

var DEBUG = false;

const logger = function (color, func, method, version, channel, path) {
    if(DEBUG){
        var str = colors[color](string.pad('Time:' + Date.now(), 22, ' ', 'right')) + ' '
            + colors[color](string.pad(func, 10, ' ', 'right')) + ' '
            + colors[color](string.pad(method, 6, ' ', 'right'));

        if(version){
            str += ' ' + colors[color]('version:' + string.pad(version, 5, ' ', 'right'));
        }

        if(channel){
            str += ' ' + colors[color]('channel:' + string.pad(channel, 5, ' ', 'right'));
        }

        if(path){
            str += ' ' + colors[color](path);
        }

        console.log(str);
    }
};


/**
 * @desc create a Xpress instance
 * @constructor HttpServer
 * @this {Xpress}
 * @param {Object} options
 * {
 *      host : null,
 *      key : 'string',    //https private key
 *      cert : 'string',   //https cert
 *      port : {
 *          http  : 8000, //if need listen on http , you should provide this port number
 *          https : 4433  //if need listen on https , you should provide this port number
 *      }
 * }
 * */
var Xpress = function (options) {

    options = options || {};

    EventEmitter.call(this);

    DEBUG = options.debug || false;

    var self = this;

    this.__host = options.host || null;

    this.__route = options.route;

    this.__doc = options.doc;// the doc save path

    this.__key = options.key;

    this.__cert = options.cert;

    this.__port = {
        http: options.port.http,
        https: options.port.https
    };

    this.__trace = options.trace || false;

    this.__defaultHeaders = {
        version: Xpress.defaults.versionHeader,
        channel: Xpress.defaults.channelHeader
    };

    //Have record registration error handler
    this.__errorHandler = {
        '404': function (req, res) {
            var err = new Error('resource not found:' + req.originalUrl);
            err.code = 404;
            if(self.__trace){
                logger('yellow', '404:', req.method, req.version, req.channel, req.originalUrl);
            }
            res.status(err.code).send('resource not found');
        },
        '500': function (err, req, res) {
            err.code = err.code || 500;
            if(self.__trace){
                logger('red', '500:', req.method, req.version, req.channel, req.originalUrl);
                console.error(err.stack);
            }
            res.status(err.code).send(err.message);
        }
    };

    this.httpServer = null;
    this.httpsServer = null;

    /**
     * if service started with cluster then all the worker processes will store there
     * */
    this.workers = null;

    /**
     * this property is the express application
     * */
    this.application = null;

    this.express = express;

    this.__init();

};


util.inherits(Xpress, EventEmitter);


/**
 * @desc
 * */
Xpress.defaults = {
    versionHeader: 'X-Accept-Version',
    channelHeader: 'X-Client-Channel'
};


/**
 * @desc template engine base on art-template
 * */
Xpress.engine = template.engine;


/**
 * @desc save doc to disk when need
 * */
Xpress.prototype.__document = function (type, moduleName, controllerName, actionName, obj, callback) {

    var self = this;

    if(!obj){
        return callback && callback();
    }

    var docStr = JSON.stringify(obj);

    var moduleDocSavePath = path.join(path.join(self.__doc, 'raw'), moduleName, controllerName);

    fs.mkdir(moduleDocSavePath, function (err) {
        if(err){
            return logger('red', err.message);
        }
        var filename = actionName;
        if(type == 'action'){
            filename = filename + '-[ACTION]';
        }else if(type == 'response'){
            filename = filename + '-[RESPONSE]';
        }else{
            filename = filename + '-[EXAMPLE]';
        }

        filename += '.json';

        var filepath = path.join(moduleDocSavePath, filename);

        fs.save(filepath, docStr, callback);

    });
};


Xpress.prototype.__genRouteHandler = function (action) {

    var self = this;

    if(!(action instanceof Controller)){
        throw new Error('');
    }

    return function (req, res, next) {

        var verifyHeaderMsg = action.__validateHeaderFunc(req.headers);

        if(verifyHeaderMsg){
            if(req.xhr){
                return res.status(400).json(verifyHeaderMsg);
            }else{
                return res.status(400).send(verifyHeaderMsg);
            }
        }

        var verifyParamMsg = action.__validateParamFunc(req.params);

        if(verifyParamMsg){
            if(req.xhr){
                return res.status(400).json(verifyParamMsg);
            }else{
                return res.status(400).send(verifyParamMsg);
            }

        }

        var verifyQueryMsg = action.__validateQueryFunc(req.query);

        if(verifyQueryMsg){
            if(req.xhr){
                return res.status(400).json(verifyQueryMsg);
            }else{
                return res.status(400).send(verifyQueryMsg);
            }

        }

        var verifyBodyMsg = action.__validateBodyFunc(req.body);

        if(verifyBodyMsg){
            if(req.xhr){
                res.status(400).json(verifyBodyMsg);
            }else{
                res.status(400).send(verifyBodyMsg);
            }
            return;
        }

        if(self.__doc){

            var send = res.send;

            res.send = function(){

                var responseBody = null;

                if(arguments.length > 0){
                    try{
                        responseBody = JSON.parse(arguments[0]);
                    }catch (ex){
                        responseBody = arguments[0];
                    }
                }

                var request = {
                    headers: req.headers
                };

                if(req.query){
                    request.query = req.query;
                }

                if(req.param){
                    request.param = req.params;
                }

                if(req.body){
                    request.body = req.body;
                }

                var response = responseBody;

                var example = {
                    request: request,
                    response :response
                };

                document.responseDocument(action, self.__doc, response);
                document.exampleDocument(action, self.__doc, example);

                return send.apply(res, arguments);
            };
        }

        action.__handler(req, res, next);
    };
};

/**
 * @desc auto route
 * */
Xpress.prototype.__routing = function (callback) {
    var self = this;

    if(!(self.__route && self.__route.auto)){
        return callback();
    }

    var controllersPath = self.__route.controller;

    if(!controllersPath){
        throw new Error('auto route need controller path');
    }

    fs.walk(controllersPath, function (pth, file, next) {

        var filepath = path.join(pth, file);
        var pathname = path.relative(self.__route.controller, pth).split(path.sep).join('/');
        var filename = path.basename(filepath, path.extname(filepath));

        var module = require(filepath);

        for(var key in module){

            var action = module[key];

            if(!(action instanceof  Controller)){
                logger('yellow', filepath + '->' + key + ' is not a auto register route');
                continue;
            }

            if(typeof action.__handler !== 'function'){
                throw new Error('controller handler is not function');
            }

            if(!action.__method){
                throw new Error('controller has no method');
            }

            if(!action.__action){
                throw new Error('controller has no action name');
            }

            var autoPath = path.join('/', pathname, filename, action.__action);

            action.__module = pathname;
            action.__controller = filename;
            action.__path = action.__path || autoPath;

            if(self.__doc){
                var docPath = self.__doc;
                document.actionDocument(action, docPath);
            }

            if(action.__deprecated){
                continue;
            }

            logger('green', 'Register:', action.__method, action.__version, action.__channel, action.__path);

            var versionAndChannel = {v: action.__version, c: action.__channel};

            var handler = self.__genRouteHandler(action);

            self[action.__method](action.__path, versionAndChannel, handler);
        }

        next();

    }, callback);
};


/**
 * @desc create server
 * */
Xpress.prototype.__server = function () {

    var self = this;

    self.application = express();

    if (self.__port.https) {
        if (!self.__key || !self.__cert) {
            throw new Error('listen https need key and cert');
        }
        self.httpsServer = https.createServer({
            key: self.__key,
            cert: self.__cert
        }, self.application);
    }

    if (self.__port.http) {
        self.httpServer = http.createServer(self.application);
    }
};


/**
 * @desc add version parser
 * */
Xpress.prototype.__parser = function () {
    var self = this;
    var versionHeader = self.__defaultHeaders.version.toLowerCase();
    var channelHeader = self.__defaultHeaders.channel.toLowerCase();
    self.application.use(function (req, res, next) {
        req.version = req.headers[versionHeader]; //get api version
        req.channel = req.headers[channelHeader]; //get api channel
        next();
    });

    if(self.__trace){
        self.application.use(function (req, res, next) {
            logger('green', 'Request:', req.method, req.version, req.channel, req.originalUrl);
            next();
        });
    }
};


/**
 * @desc wraper http method
 * */
Xpress.prototype.__method = function () {
    route.method(Xpress, this, this.application, this.__trace);
};


/**
 * @desc init
 * @access private
 * */
Xpress.prototype.__init = function () {
    this.__server();
    this.__parser();
    this.__method();
};


/**
 * @desc set property on express
 * @example
 * httpServer.setting(function (app) {
 *   app.set('trust proxy', true);
 *   app.set('x-powered-by', false);
 * });
 * */
Xpress.prototype.conf = function () {
    this.application.set.apply(this.application, arguments);
};


/**
 * @desc set template engine on express
 * */
Xpress.prototype.engine = function () {
    this.application.engine.apply(this.application, arguments);
};


/**
 * @desc register middleware on express
 * @param [fn] {Function} function(req, res, next){}
 * @example
 * httpServer.use(function(app){
 *      app.use(compression());
 *      app.use(timeout('10s'));
 *      app.use(cookie());
 *      app.use(body.json());
 * });
 * */
Xpress.prototype.use = function (fn) {
    this.application.use.apply(this.application, arguments);
};


/**
 * @desc register a sub router
 * */
Xpress.prototype.sub = function (path, router) {
    if (arguments.length === 2) {
        if (!(arguments[1] instanceof Router)) {
            throw new Error('sub router must be a Xpress.Router instance');
        }
        this.application.use(arguments[0], arguments[1].router);
    } else if (arguments.length === 1) {
        if (!(arguments[0] instanceof Router)) {
            throw new Error('sub router must be a Xpress.Router instance');
        }
        this.application.use(arguments[0].router);
    } else {
        throw new Error('this function receive at most two params');
    }
};


/**
 * @desc add server error handle function
 * @param code {number} function(error, req, res, next){}
 * @param fn {Function} function(error, req, res, next){}
 * */
Xpress.prototype.error = function (code, fn) {

    if (arguments.length !== 2) {
        throw new Error('this function receive two params');
    }

    var self = this;

    if (code === 404) {
        this.__errorHandler[404] = function (req, res, next) {
            var err = new Error('resource not found:' + req.originalUrl);
            err.code = 404;
            if(self.__trace){
                logger('yellow', 'No Route:', req.method, req.version, req.channel, req.originalUrl);
             }
            fn(err, req, res, next);
        };
    } else {
        this.__errorHandler[500] = function (err, req, res, next) {
            err.code = err.code || 500;
            if(self.__trace){
                logger('red', '500:', req.method, req.version, req.channel, req.originalUrl);
                console.error(err.stack);
            }
            fn(err, req, res, next);
        };
    }
};


/**
 * @desc list on host and port
 * @param callback {Function} some message will send out
 * @example
 * httpServer.listen(8000, function(err, message){
 *      console.log(message);
 * })
 * */
Xpress.prototype.listen = function (callback) {

    var self = this;

    self.__routing(function () {
        if (!self.__port.http && !self.__port.https) {
            throw new Error('port.http or port.https is not set');
        }

        //register a default error handler
        self.application.use(self.__errorHandler[404]);
        self.application.use(self.__errorHandler[500]);

        var listenMessage = '';
        var flag = 0;
        var count = 0;

        if (self.__port.http) {
            count++;
        }

        if (self.__port.https) {
            count++;
        }

        if (self.__port.http) {

            self.httpServer.listen(self.__port.http, self.__host, function (err) {

                flag++;

                if (err) {
                    listenMessage += err.message;
                }

                var host = self.__host || '127.0.0.1';

                listenMessage += 'server listen on : http://' +
                    host +
                    ':' +
                    self.__port.http +
                    ', pid : ' +
                    process.pid;

                if (flag >= count) {
                    self.emit('listen', self.__port.http);
                    callback && callback(listenMessage);
                }
            });

        }

        if (self.__port.https) {

            self.httpsServer.listen(self.__port.https, self.__host, function (err) {

                flag++;

                if (err) {
                    listenMessage += err.message;
                }

                var host = self.__host || '127.0.0.1';

                listenMessage += '\nserver listen on : https://' +
                    host +
                    ':' +
                    self.__port.https +
                    ', pid : ' +
                    process.pid;

                if (flag >= count) {
                    self.emit('listen', self.__port.https);
                    callback && callback(listenMessage);
                }

            });

        }
    });

};


/**
 * @desc start service with cluster
 * @param num [Number] worker process count，null || 0, if < 0 then processCount == cpuCount - 1
 * @param cb [Number] some message will send out
 * @example
 *  //child process start event
 *  httpServer.on('childStart', function(worker){
 *       console.info(Date.now(), worker.pid);
 *  });
 *
 *
 *  //child process exit event
 *  httpServer.on('childStop', function(worker, code, signal){
 *      if(!signal && code !== 0){
 *          logger.fatal(Date.now(), worker.pid, code, signal);
 *      }
 *  });
 *
 *  //child process restart event
 *  httpServer.on('childRestart', function(worker){
 *      logger.fatal(Date.now(), worker.pid);
 *  });
 *
 *
 *  //a example start service with cluster
 *  httpServer.cluster(0, function (message) {
 *      console.log(message);
 *  });
 * */
Xpress.prototype.cluster = function (num, cb) {

    var self = this;
    var number = null;
    var callback = null;

    if (typeof arguments[0] === 'function') {
        number = os.cpus().length - 1;
        callback = arguments[0];
    } else {
        number = arguments[0] || os.cpus().length - 1;
    }

    self.workers = {};

    if (cluster.isMaster) {

        for (var i = 0; i < number; i++) {

            var workerProcess = cluster.fork();

            self.workers[workerProcess.process.pid] = workerProcess;

            self.emit('childStart', workerProcess);

        }

        cluster.on('exit', function (worker, code, signal) {

            self.emit('childStop', worker, code, signal);

            delete self.workers[worker.process.pid];

            setTimeout(function () {

                var workProcess = cluster.fork();

                self.workers[workProcess.process.pid] = workProcess;

                self.emit('childRestart', workProcess);

            }, 1000);

        });

    } else {
        self.listen(callback);
    }

};


module.exports = Xpress;