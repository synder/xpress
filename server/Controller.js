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
    this.__summary = summary;
    this.__desc= null;
};

Controller.action = function (exports, action) {
    return new Controller(exports, action);
};

Controller.prototype.path = function (p) {
    this.__path = p;
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
    return this;
};

Controller.prototype.all = function () {
    this.__method = 'all';
    this.__exports[this.__method + '-' + this.__action] = this;
    return this;
};

Controller.prototype.get = function () {
    this.__method = 'get';
    this.__exports[this.__method + '-' + this.__action] = this;
    return this;
};

Controller.prototype.post = function () {
    this.__method = 'post';
    this.__exports[this.__method + '-' + this.__action] = this;
    return this;
};

Controller.prototype.delete = function () {
    this.__method = 'delete';
    this.__exports[this.__method + '-' + this.__action] = this;
    return this;
};

Controller.prototype.put = function () {
    this.__method = 'put';
    this.__exports[this.__method + '-' + this.__action] = this;
    return this;
};

Controller.prototype.head = function () {
    this.__method = 'head';
    this.__exports[this.__method + '-' + this.__action] = this;
    return this;
};

module.exports = Controller;