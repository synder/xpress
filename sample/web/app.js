/**
 * @author synder
 * @date 16/1/10
 * @desc
 */
var Xpress = require('Xpress');
var config = require('./config');

//--------------------------------------------------
var server = new Xpress({
    host: null,
    key: null,
    cert: null,
    port: {
        http: 8001,
        https: null
    }
});

//--------------------------------------------------
server.conf('x-powered-by', false);
server.conf('trust proxy', true);
server.conf('views', config.public.server.view.path);
server.conf('view engine',config.public.server.view.engine);
server.conf('view cache', false);
server.engine('html', Xpress.engine.__express);


//--------------------------------------------------
var body = require('body-parser');
var cookie = require('cookie-parser');
var timeout = require('connect-timeout');
var compression = require("compression");
var statics = require('express-static');

server.use(compression());
server.use(timeout('20s'));
server.use(cookie());
server.use(body.json());
server.use(body.urlencoded({extended: true}));
server.use(statics(config.public.server.statics.path));


//--------------------------------------------------
var homeRouter = require('./route/home');

server.sub('/', homeRouter);

//---------------------------------------------------------

server.error(404, function (err, req, res, next) {
    if(req.xhr){
        res.status(404).json('not found');
    }else{
        res.send('error/404.html');
    }
});

server.error(500, function (err, req, res, next) {
    console.error(err.stack);
    if(req.xhr){
        res.status(500).json('server error');
    }else{
        res.send('error/500.html');
    }
});

//--------------------------------------------------
server.listen(function(message){
    console.log(message);
});

//--------------------------------------------------
module.exports = server;

