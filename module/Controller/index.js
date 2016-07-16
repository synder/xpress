/**
 * Created by synder on 16/7/11.
 */

const crypto = require('../../lib/crypto');

const validator = require('./lib/validator');



var Controller = function (exports, action) {
    this.__exports = exports;
    this.__action = action;
    this.__method = null;
    this.__version = null;
    this.__path = null;
    this.__channel = null;
    this.__validate = null;
    this.__summary = null;
    this.__desc= null;
    this.__author = null;
    this.__deprecated = null;

    this.__before = null;
    this.__handler = null;

    this.__module = null;
    this.__controller = null;

    this.__validateHeaderFunc = function (header) {
        return null;
    };
    
    this.__validateParamFunc = function (param) {
        return null;
    };

    this.__validateQueryFunc = function (query) {
        return null;
    };

    this.__validateBodyFunc = function (body) {
        return null;
    };
};

//-------------------------------------------------------
/**
 * @desc create a new action
 * */
Controller.action = function (exports, action) {
    return new Controller(exports, action);
};
//-------------------------------------------------------



//-------------------------------------------------------
Controller.prototype.__check = function () {
    if(this.__handler){
        throw new Error('this method must be call before handle(function(res, res, next){})');
    }
};

Controller.prototype.__id = function () {
    var temp = this.__method + this.__action + this.__version + this.__channel;
    return crypto.md5Hash(temp);
};
//-------------------------------------------------------



//-------------------------------------------------------
/**
 * @desc mark this api has been deprecated
 * */
Controller.prototype.deprecated = function () {
    this.__check();
    this.__deprecated = true;
    return this;
};
//-------------------------------------------------------



//-------------------------------------------------------
Controller.prototype.path = function (p) {
    this.__check();
    this.__path = p;
    return this;
};

Controller.prototype.version = function (v) {
    this.__check();
    this.__version = v;
    return this;
};

Controller.prototype.channel = function (c) {
    this.__check();
    this.__channel = c;
    return this;
};
//-------------------------------------------------------



//-------------------------------------------------------
Controller.prototype.summary = function (summary) {
    this.__check();
    this.__summary = summary;
    return this;
};

Controller.prototype.desc = function (desc) {
    this.__check();
    this.__desc = desc;
    return this;
};

Controller.prototype.author = function (a) {
    this.__check();
    this.__author = a;
    return this;
};
//-------------------------------------------------------



//-------------------------------------------------------
/**
 * @desc declaration the validate of the api
 * */
Controller.prototype.validate = function (validate) {
    this.__check();

    if(typeof validate !== 'object'){
        throw new Error('validate should be a function');
    }
    this.__validate = validate;

    if(this.__validate.header){
        this.__validateHeaderFunc = validator.genValidateFunction('header', this.__validate.header);
    }

    if(this.__validate.param){
        this.__validateParamFunc = validator.genValidateFunction('param', this.__validate.param);
    }

    if(this.__validate.query){
        this.__validateQueryFunc = validator.genValidateFunction('query', this.__validate.query);
    }

    if(this.__validate.body){
        this.__validateBodyFunc = validator.genValidateFunction('body', this.__validate.body);
    }

    return this;
};
//-------------------------------------------------------



//-------------------------------------------------------
/**
 * @desc register some method
 * */
Controller.prototype.method = function (method) {
    this.__check();
    this.__method = method;
    return this;
};

Controller.prototype.all = function () {
    return this.method('all');
};

Controller.prototype.get = function () {
    return this.method('get');
};

Controller.prototype.post = function () {
    return this.method('post');
};

Controller.prototype.delete = function () {
    return this.method('delete');
};

Controller.prototype.put = function () {
    return this.method('put');
};

Controller.prototype.head = function () {
    return this.method('head');
};
//-------------------------------------------------------



//-------------------------------------------------------
Controller.prototype.before = function (handler) {
    if(typeof handler !== 'function'){
        throw new Error('before handler must be a function like function(req, res, next){}');
    }
    this.__before = handler;
};

Controller.prototype.handle = function (handler) {

    if(arguments.length === 0){
        return this.__handler;
    }

    if(typeof handler !== 'function'){
        throw new Error('handler should be a function');
    }

    if(handler.length < 2){
        throw new Error('handler should be a function like function(req, res, next){}');
    }

    var self = this;

    var exportsName = self.__id() + '-' + crypto.md5Hash('' + Date.now() + Math.random());

    this.__exports[exportsName] = self;

    this.__handler = function (req, res, next) {
        if(self.__before){
            self.__before(req, res, function (err) {

                if(err){
                    return next(err);
                }

                var a = self.__validateHeaderFunc(req.headers);

                if(a){
                    var errorA = new Error(a);
                    errorA.code = 400;
                    return next(errorA);
                }

                var b = self.__validateParamFunc(req.params);

                if(b){
                    var errorB = new Error(b);
                    errorA.code = 400;
                    return next(errorB);
                }

                var c = self.__validateQueryFunc(req.query);

                if(c){
                    var errorC = new Error(c);
                    errorA.code = 400;
                    return next(errorC);
                }

                var d = self.__validateBodyFunc(req.body);

                if(d){
                    var errorD = new Error(d);
                    errorA.code = 400;
                    return next(errorD);
                }

                handler(req, res, next);
            });
        }else{

            var a = self.__validateHeaderFunc(req.headers);

            if(a){
                var errorA = new Error(a);
                return next(errorA);
            }

            var b = self.__validateParamFunc(req.params);

            if(b){
                var errorB = new Error(b);
                return next(errorB);
            }

            var c = self.__validateQueryFunc(req.query);

            if(c){
                var errorC = new Error(c);
                return next(errorC);
            }

            var d = self.__validateBodyFunc(req.body);

            if(d){
                var errorD = new Error(d);
                return next(errorD);
            }

            handler(req, res, next);
        }
    };
};
//-------------------------------------------------------

module.exports = Controller;