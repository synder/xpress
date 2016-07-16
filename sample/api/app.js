/**
 * @author xpress
 * @date 16/1/10
 * @desc
 */
const path = require('path');
const Xpress = require('../../index');
global.Controller = Xpress.Controller;

//--------------------------------------------------
const server = new Xpress({
    host: null,
    key: null,
    cert: null,
    trace: true,
    debug: true,
    document:  path.join(__dirname, 'docs'),
    port: {
        http: 8003,
        https: null
    },
    controller: path.join(__dirname, 'controller')
});

//--------------------------------------------------
server.conf('x-powered-by', false);
server.conf('trust proxy', true);


//--------------------------------------------------
const body = require('body-parser');

server.use(body.json());
server.use(body.urlencoded({extended: true}));

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
