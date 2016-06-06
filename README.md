# sample code
## there are two full sample projects in /sample/api and /sample/web
    #cd ./sample/api
    cd ./sample/web 
    npm install 
    node app.js
### open http://127.0.0.1:8001/, there are many template engine(base on artTemplate) helper sample code
    
# create an api server with xpress
    //import module
    var Xpress = require('Xpress');
    var config = require('./config');

    //create server
    var server = new Xpress({
        host: null,
        key: null,
        cert: null,
        port: {
            http: 8001,
            https: null
        }
    });

    //configure
    server.conf('x-powered-by', false);
    server.conf('trust proxy', true);
    server.conf('views', config.public.server.view.path);
    server.conf('view engine',config.public.server.view.engine);
    server.conf('view cache', false);
    server.engine('html', Xpress.engine.__express);


    //use middleware
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


    //register an api on a controller with version or channel control
    //'v' represent version and 'c' represent channel
    //if you register an api with version and channel control, 
    //you must set 'X-Accept-Version' and 'X-Client-Channel' on request header, 
    //xpress will get the two value from the header and compared with the register v and c
    //if not equal, xpress will skip the controller and jump to the next controller which has registered the same route
    //you can get and set the two headers on Xpress.defaults.versionHeader and Xpress.defaults.channelHeader
    server.get('/user', {v:1.0, c: 'ios'}, function(req, res, next){
        res.json({
            users: []
        });
    });
    
    //register an api on a controller without version and channel control
    server.get('/user/:id', function(req, res, next){
        res.json({
            name: 'synder',
            age : 29
        });
    })
    
    //create a sub router and register on server
    var Router = Xpress.Router;
    var productRouter = new Router();
    
    //register an api on subRouter without version or channel control  
    productRouter.get('/', function(req, res, next){
        res.json({
            products: []
        });
    })
    
    //register an api on subRouter with version or channel control  
    productRouter.get('/:id', {v:1, c:1}, function(req, res, next){
        res.json({
            products: []
        });
    })

    server.sub('/product', productRouter); 

    //listen on host and port
    server.listen(function(message){
        console.log(message);
    });
    
    //listen on host and port with cluster
    //server.cluster(0, function(msg){
    //    console.log(msg);
    //});

    //export
    module.exports = server;
    