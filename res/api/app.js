/**
 * @author synder
 * @date 16/1/10
 * @desc
 */

var Xpress = require('xpress');
var config = require('./config');

var server = new Xpress({
    host: config.private.server.host,
    key: config.private.server.key,
    cert: config.private.server.cert,
    port: {
        http: config.private.server.port.http,
        https: config.private.server.port.https
    }
});

//-----------------------------------------
server.setting(function(app){
    app.set('x-powered-by', false);
    app.set('trust proxy', true);
});


//-----------------------------------------
var body = require('body-parser');
var cookie = require('cookie-parser');
var timeout = require('connect-timeout');
var compression = require("compression");

server.use(function(app){
    app.use(compression());
    app.use(timeout('10s'));
    app.use(cookie());
    app.use(body.json());
});


//-----------------------------------------
var homeRoute = require('./route/home');

server.route(function(app){
    app.use('/', homeRoute.router);
});


//-----------------------------------------
server.error(function(app){

    app.use(function(req, res, next){
        res.status(404).json({
            code : 404,
            msg : 'not found'
        });
    });

    app.use(function(err, req, res, next){
        res.status(500).json({
            code : 500,
            msg : 'server error'
        });
    });
});

//-----------------------------------------
server.cluster(function(message){
    console.log(message);
});


module.exports = server;
