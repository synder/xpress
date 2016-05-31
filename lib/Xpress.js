/**
 * @desc 封装express创建服务的方法
 * @author sam
 * @version 0.8.3
 * */
const os = require('os');
const util = require('util');
const http = require('http');
const https = require('https');
const events = require('events');
const cluster = require('cluster');
const express = require('express');
const route = require('./route');
const Router = require('./Router');
const template = require('./template');
const EventEmitter = events.EventEmitter;


/**
 * @desc 创建一个http服务程序,包括https和http服务
 * @constructor HttpServer
 * @this {Xpress}
 * @param {Object} options
 * @example
 *
 *
 *'use strict';
 *
 *var HttpServer = require('epi').HttpServer;
 *
 *var util = require('util');
 *
 * var config = {
 *      host : null,
 *      key : 'string',    //https监听时需要这个key
 *      cert : 'string',   //https监听的时候需要证书
 *      version : '1.0.0'  //api默认的版本信息
 *      port : {
 *          http  : 8000, //如果想要监听http端口，直接写
 *          https : 4433  //如果不想监听https，直接置为null
 *      }
 * }
 *
 * //创建一个httpServer=====================================
 * var httpServer = new HttpServer(config);
 *
 *
 * //设置==================================================
 * httpServer.setting(function (app) {
 *    app.set('trust proxy', true);
 *    app.set('x-powered-by', false);
 * });

 * //导入中间件=============================================
 * var body = require('body-parser');
 * var cookie = require('cookie-parser');
 * var compression = require("compression");
 *
 *  //应用中间件
 * httpServer.use(function (app) {
 *    app.use(compression());
 *    app.use(cookie());
 *    app.use(body.json());
 *    app.use(body.urlencoded({
 *        extended: true
 *    }));
 * });
 *
 *
 * //导入路由==============================================
 * var testRouter = require('./router/test');
 *
 * //注册路由
 * httpServer.routing(function(app){
 *      testRouter.map(app);  //app是express的app
 * });
 *
 * //testRouter.map(httpServer); //采用新的注册方式
 *
 * //错误处理=============================================
 * httpServer.error(function (err, req, res, next) {
 *    res.status(500).json({
 *        error: err
 *    });
 * });
 * */
var Xpress = function (options) {
    "use strict";

    /* *
     * {
     *      host : null,
     *      key  : 'string',
     *      cert : 'string',
     *      version : {
     *          defaults : '1.0.0',
     *          headers : {
     *              version : 'accept-version',
     *              channel : 'client-channel'
     *          }
     *      },  //api默认的版本信息
     *      port : {
     *          http  : 8000,
     *          https : 4433
     *      }
     * }
     * */
    options = options || {};

    EventEmitter.call(this);

    this.__host = options.host || null;

    this.__key = options.key;

    this.__cert = options.cert;

    this.__port = {
        http: options.port.http,
        https: options.port.https
    };

    this.__defaultHeaders = {
        version: Xpress.defaults.versionHeader,
        channel: Xpress.defaults.channelHeader
    };

    this.httpServer = null;
    this.httpsServer = null;

    /**
     * 如果调用cluster方法启动程序，所有子进程都在这里
     * */
    this.workers = null;

    /**
     * express 创建的app，如果想调用express的相关方法，可以使用这个app
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
    versionHeader : 'X-Accept-Version',
    channelHeader: 'X-Client-Channel'
};

/**
 * @desc template engine base on art-template
 * */
Xpress.template = template.express;


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
        req.version = req.headers[versionHeader]; //api版本
        req.channel = req.headers[channelHeader]; //api通道
        next();
    });
};

/**
 * @desc wraper new method
 * */
Xpress.prototype.__method = function () {
    route.method(Xpress, this, this.application);
};


/**
 * @desc 初始化系统
 * @access private
 * */
Xpress.prototype.__init = function () {
    this.__server();
    this.__parser();
    this.__method();
};

/**
 * @desc 设置程序属性
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
 * @desc 设置模板引擎
 * */
Xpress.prototype.engine = function () {
    this.application.engine.apply(this.application, arguments);
};

/**
 * @desc 应用中间件
 * @param fn {Function} function(app){}
 * @example
 * httpServer.use(function(app){
 *      app.use(compression());
 *      app.use(timeout('10s'));
 *      app.use(cookie());
 *      app.use(body.json());
 * });
 * */
Xpress.prototype.use = function () {
    this.application.use.apply(this.application, arguments);
};


/**
 * @desc register a sub router
 * */
Xpress.prototype.sub = function (path, router) {
    if(arguments.length === 2){
        if(!(arguments[1] instanceof Router)){
            throw new Error('sub router must be a Xpress.Router instance');
        }
        this.application.use(arguments[0], arguments[1].router);
    }else if(arguments.length === 1){
        if(!(arguments[0] instanceof Router)){
            throw new Error('sub router must be a Xpress.Router instance');
        }
        this.application.use(arguments[0].router);
    }else{
        throw new Error('this function receive at most two params');
    }
};


/**
 * @desc add server error handle function
 * @param code {number} function(error, req, res, next){}
 * @param fn {Function} function(error, req, res, next){}
 * */
Xpress.prototype.error = function (code, fn) {

    if(arguments.length !== 2){
        throw new Error('this function receive two params');
    }

    if(code === 404){
        this.application.use(function(req, res, next){
            var err = new Error('resource not found');
            err.code = 404;
            fn(err, req, res, next);
        });
    }else{
        this.application.use(function(err, req, res, next){
            err.code = err.code || 500;
            fn(err, req, res, next);
        });
    }
};


/**
 * @desc 监听端口
 * @param callback {Function} 监听后返回的消息
 * @example
 * httpServer.listen(8000, function(err, message){
 *      console.log(message);
 * })
 * */
Xpress.prototype.listen = function (callback) {

    var self = this;

    if (!self.__port.http && !self.__port.https) {
        throw new Error('port.http or port.https is not set');
    }

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
};



/**
 * @desc 以集群的方式启动程序
 * @param number [Number] 要启动的监听进程数量，null || 0 启动和 cpu个数 - 1 的进程数量
 * @param callback [Number] 监听后返回的消息
 * @example
 *  //子进程启动事件
 *  httpServer.on('childStart', function(worker){
 *       //记录子进程启动
 *       logger.info(Date.now(), worker.pid);
 *  });
 *
 *
 *  //子进程退出事件
 *  httpServer.on('childStop', function(worker, code, signal){
 *      //记录子进程非正常退出
 *      if(!signal && code !== 0){
 *          logger.fatal(Date.now(), worker.pid, code, signal);
 *      }
 *  });
 *
 *  //子进程退出事件
 *  httpServer.on('childRestart', function(worker){
 *      //记录子进程重启
 *      logger.fatal(Date.now(), worker.pid);
 *  });
 *
 *
 *  //使用集群方式监听=======================================
 *  httpServer.cluster(0, function (message) {
 *      console.log(message);
 *  });
 * */
Xpress.prototype.cluster = function () {

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