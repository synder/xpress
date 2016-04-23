/**
 * Created by synder on 16/4/23.
 */
var express = require('express');
var route = require('./route');
var ExpressRouter = express.Router;

var Router = function (config) {
    "use strict";

    this.router = new ExpressRouter(config);

    this.__init();
};

Router.prototype.__init = function () {
    route.method(Router, this, this.router);
};


module.exports = Router;

