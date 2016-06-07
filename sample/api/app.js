
var Xpress = require('Xpress');

//--------------------------------------------------
var server = new Xpress({
    host: null,
    key: null,
    cert: null,
    port: {
        http: 8003,
        https: null
    }
});

//--------------------------------------------------
server.conf('x-powered-by', false);
server.conf('trust proxy', true);


//--------------------------------------------------
var body = require('body-parser');

server.use(body.json());
server.use(body.urlencoded({extended: true}));
server.use(function(req, res, next){ next(); });


//--------------------------------------------------
var homeRouter = require('./route/home');

server.sub('/', homeRouter);


//---------------------------------------------------------
server.error(404, function (err, req, res, next) {
    res.status(404).json('not found');
});

server.error(500, function (err, req, res, next) {
    res.status(500).json(err.stack);
});

//--------------------------------------------------
server.listen(function(message){
    console.log(message);
});


//--------------------------------------------------
module.exports = server;
