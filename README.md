# sample code

    var ejs = require('ejs');
    var path = require('path');
    var Xpress = require('xpress');
    
    //key {string} -if you want to listen on https, you should provide this
    //cert {string} -if you want to listen on https, you should provide this
    //port.http {number} -if you want to listen on http, you should provide this
    //port.https {number} -if you want to listen on https, you should provide this
    //you can also provide port.http and port.https, then server will both listen http and https port
    var server = new Xpress({
        host: null,
        key: null,
        cert: null,
        port: {
            http: 8001,
            https: null
        }
    });
    
    //conf is the same like express set
    server.conf('x-powered-by', false);
    server.conf('trust proxy', true);
    server.conf('views', path.join(__dirname, 'views'));
    server.conf('view engine', 'html');
    server.conf('view cache', false);
    server.engine('html', ejs.__express);
    
    
    //register middleware on express Application instance
    server.use(function(req, res, next){ next(); });
    //server.use(cookie());
    
    //register a controller on server without version and channel control
    server.get('/', function(req, res, next){
        res.render('home/index');
    });
    
    //register a controller on server with version and channel control
    server.post('/', {v:1.0, c: 1}, function(req, res, next){
        res.send('/');
    });
    
    
    //create sub router
    var homeRouter = new Xpress.Router();
    
    //register a router without version and channel control
    homeRouter.get('/', function(req, res, next){
        res.send('/');
    });
    
    //register a router with version or channel control
    homeRouter.post('/', {v:1.0, c: 1}, function(req, res, next){
        res.send('/');
    });
    
    server.sub('/home', homeRouter);
    
    //add a 404 handler
    server.error(404, function(err, req, res, next){
        res.json(err.code);
    });
    
    //add a 500 handler
    server.error(500, function(err, req, res, next){
        res.json(err.code);
    });
    
    //start server in single process
    server.listen(function(message){
        console.log(message);
    });
    
    //start server in cluster , 4 is the count of worker
    //server.cluster(4, function(message){
    //    console.log(message);
    //});
    
    module.exports = server;