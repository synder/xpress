/**
 * Created by synder on 16/7/11.
 */

var Controller = function (method) {
    this.__method = method;
    this.__version = null;
    this.__channel = null;
    this.__validate = null;
    this.__handler = null;
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

Controller.create = function (method) {
    return new Controller(method);
};

Controller.all = function () {
    return Controller.create('all');
};

Controller.get = function () {
    return Controller.create('get');
};

Controller.post = function () {
    return Controller.create('post');
};

Controller.delete = function () {
    return Controller.create('delete');
};

Controller.put = function () {
    return Controller.create('put');
};

Controller.head = function () {
    return Controller.create('head');
};

module.exports = Controller;