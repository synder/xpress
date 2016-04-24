
var Xpress = require('xpress');

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


//--------------------------------------------------
server.use(function(req, res, next){ next(); });


//--------------------------------------------------
var homeRouter = require('./route/home');
server.sub('/home', homeRouter);


//--------------------------------------------------
server.cluster(function(message){
    console.log(message);
});


//--------------------------------------------------
module.exports = server;
