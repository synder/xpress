/**
 * Created by synder on 16/7/11.
 */

var Controller = function (action) {
    this.__action = action;
    this.__method = null;
    this.__version = null;
    this.__path = null;
    this.__channel = null;
    this.__validate = null;
    this.__handler = null;
};

Controller.action = function (action) {
    return new Controller(action);
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

Controller.prototype.validate = function (validate) {
    this.__validate = validate;
    return this;
};

Controller.prototype.handle = function (handler) {
    this.__handler = handler;
    return this;
};

Controller.prototype.all = function () {
    this.__method = 'all';
    return this;
};

Controller.prototype.get = function () {
    this.__method = 'get';
    return this;
};

Controller.prototype.post = function () {
    this.__method = 'post';
    return this;
};

Controller.prototype.delete = function () {
    this.__method = 'delete';
    return this;
};

Controller.prototype.put = function () {
    this.__method = 'put';
    return this;
};

Controller.prototype.head = function () {
    this.__method = 'head';
    return this;
};

module.exports = Controller;