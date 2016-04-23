/**
 * @author synder
 * @date 16/1/10
 * @desc
 */

var engine = require('ejs');
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
    app.engine('html', engine.__express);
    app.set('views', config.public.server.view.path);
    app.set('view engine',config.public.server.view.engine);
    app.set('view cache', false);
});


//-----------------------------------------
var body = require('body-parser');
var cookie = require('cookie-parser');
var timeout = require('connect-timeout');
var compression = require("compression");
var statics = require('express-static');

server.use(function(app){
    app.use(compression());
    app.use(timeout('20s'));
    app.use(cookie());
    app.use(body.json());
    app.use(body.urlencoded({
        extended: true
    }));
    app.use(statics(config.public.server.statics.path));
});


//-----------------------------------------
var homeRoute = require('./route/home');

server.route(function(app){
    app.use('/', homeRoute);
});


//-----------------------------------------
server.error(function(app){

    app.use(function(req, res, next){
        res.status(404).send('not found');
    });

    app.use(function(err, req, res, next){
        console.error(err);
    });
});

//-----------------------------------------
server.cluster(function(message){
    console.log(message);
});


module.exports = server;
