/**
 * Created by synder on 16/7/11.
 */

const validator = require('./validator');

var Controller = function (exports, action) {
    this.__exports = exports;
    this.__action = action;
    this.__method = null;
    this.__version = null;
    this.__path = null;
    this.__channel = null;
    this.__validate = null;
    this.__handler = null;
    this.__summary = null;
    this.__desc= null;
    this.__author = null;
    this.__deprecated = null;

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

/**
 * @desc create a new action
 * */
Controller.action = function (exports, action) {
    return new Controller(exports, action);
};


Controller.prototype.__check = function () {
    if(this.__handler){
        throw new Error('this method must be call before handle(function(res, res, next){})');
    }
};

/**
 * @desc gen controller id
 * */
Controller.prototype.__id = function () {

    var temp = this.__method.toUpperCase().slice(0,3) + '@';

    temp += this.__action.toUpperCase();

    var versionAndChannel = ':';

    if(this.__version){
        versionAndChannel = this.__version + ':';
    }

    if(this.__channel){
        versionAndChannel +=  this.__channel;
    }

    temp += '#' + versionAndChannel;

    return temp;
};

/**
 * @desc mark this api has been deprecated
 * */
Controller.prototype.deprecated = function () {
    this.__check();
    this.__deprecated = true;
    return this;
};

/**
 * @desc set a path
 * */
Controller.prototype.path = function (p) {
    this.__check();
    this.__path = p;
    return this;
};

/**
 * @desc declaration the author of the api
 * */
Controller.prototype.author = function (a) {
    this.__check();
    this.__author = a;
    return this;
};

/**
 * @desc declaration the version of the api
 * */
Controller.prototype.version = function (v) {
    this.__check();
    this.__version = v;
    return this;
};

/**
 * @desc declaration the channel of the api
 * */
Controller.prototype.channel = function (c) {
    this.__check();
    this.__channel = c;
    return this;
};

/**
 * @desc declaration the summary of the api
 * */
Controller.prototype.summary = function (summary) {
    this.__check();
    this.__summary = summary;
    return this;
};

/**
 * @desc declaration the desc of the api
 * */
Controller.prototype.desc = function (desc) {
    this.__check();
    this.__desc = desc;
    return this;
};

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
        this.__validateHeaderFunc = validator.validateFunction('header', this.__validate.header);
    }

    if(this.__validate.param){
        this.__validateParamFunc = validator.validateFunction('param', this.__validate.param);
    }

    if(this.__validate.query){
        this.__validateQueryFunc = validator.validateFunction('query', this.__validate.query);
    }

    if(this.__validate.body){
        this.__validateBodyFunc = validator.validateFunction('body', this.__validate.body);
    }

    return this;
};


/**
 * @desc declaration method
 * */
Controller.prototype.method = function (method) {
    this.__check();
    this.__method = method;
    return this;
};


/**
 * @desc register some method
 * */
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


/**
 * @desc declaration the handle of the api
 * */
Controller.prototype.handle = function (handler) {
    if(typeof handler !== 'function'){
        throw new Error('handler should be a function');
    }

    if(handler.length < 2){
        throw new Error('handler should be a function like function(req, res, next){}');
    }

    this.__handler = handler;

    this.__exports[this.__id()] = this;

    return this;
};

module.exports = Controller;