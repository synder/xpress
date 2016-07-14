/**
 * Created by synder on 16/7/11.
 */

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
};

Controller.action = function (exports, action) {
    return new Controller(exports, action);
};

//
Controller.prototype.deprecated = function () {
    this.__deprecated = true;
    return this;
};

Controller.prototype.path = function (p) {
    this.__path = p;
    return this;
};

Controller.prototype.author = function (a) {
    this.__author = a;
    return this;
};

Controller.prototype.version = function (v) {
    this.__version = v;
    return this;
};

Controller.prototype.channel = function (c) {
    this.__channel = c;
    return this;
};

Controller.prototype.summary = function (summary) {
    this.__summary = summary;
    return this;
};

Controller.prototype.desc = function (desc) {
    this.__desc = desc;
    return this;
};

Controller.prototype.validate = function (validate) {
    if(typeof validate !== 'object'){
        throw new Error('validate should be a function');
    }
    this.__validate = validate;
    return this;
};

Controller.prototype.handle = function (handler) {
    if(typeof handler !== 'function'){
        throw new Error('handler should be a function');
    }
    this.__handler = handler;

    var temp = this.__method.toUpperCase() + '@';

    temp += '[' + this.__action + ']';

    var versionAndChannel = ':';

    if(this.__version){
        versionAndChannel = this.__version + ':';
    }

    if(this.__channel){
        versionAndChannel +=  this.__channel;
    }

    temp += '$[' + versionAndChannel + ']';

    this.__exports[temp] = this;

    return this;
};

Controller.prototype.method = function (method) {
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

module.exports = Controller;