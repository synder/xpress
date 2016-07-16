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

//import lib util
const fs = require('../lib/fs');

//import module
const Route = require('./Route');
const Logger = require('./Logger');
const Document = require('./Document');
const Controller = require('./Controller');
const Template = require('./Template');
const ErrorHandler = require('./ErrorHandler');

//define const param
const EventEmitter = events.EventEmitter;
const ExpressRouter = express.Router;

//create a debug logger
var logger = Logger.create();

//===================================================
/**
 * @desc express sub Router
 * */
var Router = function (config) {
    this.__debug = config ? config.debug : false;
    this.__router = new ExpressRouter(config);
    this.__init();
};

Router.prototype.__init = function () {
    Route.method(Router, this, this.router, this.__debug);
};

Router.prototype.router = function () {
    return this.__router;
};
//===================================================

//===================================================
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

    //debug and doc
    this.__debug = options.debug;       // if need debug info

    //auto route and auto document
    this.__controller = options.controller; // the ctrl rootpath

    if(options.production == false){
        this.__document = options.document;     // the doc save path
    }

    //server start info
    this.__host = options.host;
    this.__port = {
        http: options.port.http,
        https: options.port.https
    };
    this.__key = options.key;
    this.__cert = options.cert;


    //version and channel config
    this.__version = {
        header: options.version ? options.version.header.toLocaleLowerCase() : 'X-Accept-Version', //enable version in header
        query: options.version ? options.version.query : null,   //enable version in query
        body: options.version ? options.version.body : null      //enable version in body
    };

    this.__channel = {
        header: options.channel ? options.channel.header.toLocaleLowerCase() : null, //enable channel in header
        query: options.channel ? options.channel.query : null,   //enable channel in query
        body: options.channel ? options.channel.body : null      //enable channel in body
    };

    //default error handler
    this.__errors = {
        '404': ErrorHandler.create(404),
        '500': ErrorHandler.create(500)
    };

    //cache all action
    this.__actions = {};

    //public property
    this.httpServer = null;  //https serever instance
    this.httpsServer = null; //http server instance
    this.workers = null;     //all cluster workers
    this.application = null; //express application
    this.express = express;  //express

    //init this
    this.__init();
};

util.inherits(Xpress, EventEmitter);

//---------------------------------------------------

//export veiw engine
Xpress.engine = Template.engine;
//---------------------------------------------------

//---------------------------------------------------
/**
 * @desc init
 * @access private
 * */
Xpress.prototype.__init = function () {
    this.__check();
    this.__create();
    this.__parser();
    this.__method();
};

/**
 * @desc check param
 * */
Xpress.prototype.__check = function () {
    if (!this.__port.http && !this.__port.https) {
        throw new Error('port.http or port.https is not set');
    }

    if(this.__port.https){
        if(!this.__key){
            throw new Error('key is miss while listen on https');
        }

        if(!this.__cert){
            throw new Error('cert is miss while listen on https');
        }
    }

    if(this.__controller){
        if(!path.isAbsolute(this.__controller)){
            throw new Error('controller path must be a Absolute path');
        }
    }
};

/**
 * @desc create server
 * */
Xpress.prototype.__create = function () {

    var self = this;

    self.application = express();

    if (self.__port.https) {
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

    var versionHeader = this.__version.header;
    var versionQuery = this.__version.query;
    var versionBody = this.__version.body;

    var channelHeader = this.__channel.header;
    var channelQuery = this.__channel.query;
    var channelBody = this.__channel.body;
    
    var useChannelControl = !!channelHeader && !!channelQuery && !!channelBody;

    this.application.use(function (req, res, next) {

        if(versionHeader){
            req.version = req.headers[versionHeader];
        }

        if(req.version == null){

            if(versionQuery){
                req.version = req.query[versionQuery];
            }

            if(req.version == null){
                if(versionBody){
                    req.version = req.query[versionBody];
                }
            }
        }



        if(useChannelControl){
            if(channelHeader){
                req.channel = req.headers[channelHeader];
            }

            if(req.version == null){
                if(channelQuery){
                    req.channel = req.query[channelQuery];
                }

                if(req.version == null){
                    if(channelBody){
                        req.channel = req.query[channelBody];
                    }
                }
            }
        }

        next();
    });

    if(this.__debug){
        this.application.use(function (req, res, next) {
            logger('green', 'Request:', req.method, req.version, req.channel, req.originalUrl);
            next();
        });
    }
};


/**
 * @desc wraper http method
 * */
Xpress.prototype.__method = function () {
    Route.method(Xpress, this, this.application, this.__debug);
};
//---------------------------------------------------



//---------------------------------------------------
/**
 * @desc auto route handler
 * */
Xpress.prototype.__handler = function (action) {

    var self = this;

    if(!(action instanceof Controller)){
        throw new Error('');
    }

    if(!self.__document){
        return action.__handler;
    }

    return function (req, res, next) {

        var send = res.send;

        res.send = function(){
            if(res.statusCode > 199 && res.statusCode < 300){
                var response = null;

                if(arguments.length > 0){
                    try{
                        response = JSON.parse(arguments[0]);
                    }catch (ex){
                        response = arguments[0];
                    }
                }

                Document.__storeRawDocument(self.__document, action, response);
                Document.__storeRawDocument(self.__document, action, response, req);

                return send.apply(res, arguments);
            }else{
                return send.apply(res, arguments);
            }
        };

        action.__handler(req, res, next);
    };
};

/**
 * @desc auto route
 * */
Xpress.prototype.__routing = function (callback) {

    var self = this;

    if(!self.__controller){
        return callback();
    }

    var ctrlPath = self.__controller;

    fs.walk(ctrlPath, function (dir, name, next) {
        
        var modulePath = path.join(dir, name);

        var module = require(modulePath);
        var action;

        for(var key in module){

            if(!module.hasOwnProperty(key)){
                continue;
            }

            action = module[key];

            if(!(action instanceof  Controller)){
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

            var urlsep = '/';
            var pathsep = path.sep;
            var ctrlName = path.basename(name, path.extname(name));
            var moduleName = path.relative(ctrlPath, dir).split(pathsep).join(urlsep);
            var actionName = action.__action;

            action.__module = moduleName;
            action.__controller = ctrlName;

            if(!action.__path){
                action.__path = path.join('/', moduleName, ctrlName, actionName);
            }

            if(self.__document){
                Document.__storeRawDocument(self.__document, action);
            }

            if(action.__deprecated){
                delete module[key];
                continue;
            }

            if(!self.__actions[action.__id()]){
                self.__actions[action.__id()] = action;
            }else{
                var cactoin = self.__actions[action.__id()];
                return logger('red', 'Conflict: ' + cactoin.__action, cactoin.__method, cactoin.__version, cactoin.__channel, cactoin.__path);
            }

            if(self.__debug){
                logger('green', 'Register:', action.__method, action.__version, action.__channel, action.__path);
            }

            var versionAndChannel = {v: action.__version, c: action.__channel};

            var handler = self.__handler(action);

            self[action.__method](action.__path, versionAndChannel, handler);
        }

        next();

    }, callback);
};
//---------------------------------------------------


//---------------------------------------------------
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
//---------------------------------------------------


//---------------------------------------------------
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
        this.__errors[404] = function (req, res, next) {
            var err = new Error('resource not found ' + req.originalUrl);
            err.code = 404;
            if(self.__debug){
                console.error(err.stack);
            }
            fn(err, req, res, next);
        };
    } else {
        this.__errors[500] = function (err, req, res, next) {
            err.code = err.code || 500;
            if(self.__debug){
                console.error(err.stack);
            }
            fn(err, req, res, next);
        };
    }
};
//---------------------------------------------------



//---------------------------------------------------
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

        delete self.__actions;

        self.application.use(self.__errors[404]);
        self.application.use(self.__errors[500]);

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
//---------------------------------------------------
//===================================================


exports.Xpress = Xpress;
exports.Router = Router;
exports.Controller = Controller;
exports.Document = Document;