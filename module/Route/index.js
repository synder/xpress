/**
 * Created by synder on 16/4/23.
 */
const colors = require('colors');

const string = require('../../lib/string');
const Logger = require('../Logger');

var channel = require('./lib/channel');
var version = require('./lib/version');
var METHODS = require('./lib/method');

const logger = Logger.create();

/**
 * @desc show warn info
 * */
const warn = function (option) {
    if(option.v === 0){
        throw new Error('version can not set to 0');
    }

    if(option.c === 0){
        throw new Error('channel can not set to 0');
    }
};

/***
 * @desc wraper http method on Xpress instance
 */
const wraper = function (option, handler, debug) {

    if(option.v){
        var versionCheck = version.validateFunc(option.v);
    }

    if(option.c){
        var channelCheck = version.validateFunc(option.c);
    }


    return function (req, res, next) {

        if (option.v) {

            if (!versionCheck(req.version)) {
                if(debug){
                    logger('yellow', 'Skip:', req.method, option.v, option.c, req.route.path);
                }
                return next();
            }
        }

        if (option.c) {
            if (!channelCheck(req.channel)) {
                if(debug){
                    logger('yellow', 'Skip:', req.method, option.v, option.c, req.route.path);
                }
                return next();
            }
        }

        if(debug){
            logger('green', 'Match:', req.method, option.v, option.c, req.route.path);
        }

        handler(req, res, next);
    };
};


exports.method = function (Prototype, instance, router, debug) {

    METHODS.push('all');

    /**
     * add http method
     * */
    METHODS.forEach(function (method) {

        /***
         * router.get(function(req, res, next){})
         * router.get({v:1, c:1}, function(req, res, next){});
         * router.get('/', function(req, res, next){});
         * router.get(/^name$/, function(req, res, next){});
         * router.get('/', {v:1, c:1}, function(req, res, next){});
         * */
        Prototype.prototype[method] = function () {

            if (typeof arguments[0] === 'function') {
                for (var x = 0; x < arguments.length; x++) {
                    router[method](arguments[x]);
                }
                return instance;
            }

            if (typeof arguments[1] === 'function') {
                if (!arguments[0].v && !arguments[0].c) {
                    for (var z = 1; z < arguments.length; z++) {
                        router[method](arguments[0], arguments[z]);
                    }
                } else {
                    warn(arguments[0]);
                    for (var y = 1; y < arguments.length; y++) {
                        router[method](wraper(arguments[0], arguments[y], debug));
                    }
                }
                return instance;
            }

            if (typeof arguments[1] === 'object') {

                warn(arguments[1]);

                for (var i = 2; i < arguments.length; i++) {
                    if (typeof arguments[i]) {
                        router[method](arguments[0], wraper(arguments[1], arguments[i], debug));
                    }
                }

                return instance;
            }

            throw new Error('param error');
        };

    });
};
