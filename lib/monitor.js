/**
 * Created by synder on 16/6/8.
 * @desc Monitoring program state
 */

exports.wrapCreateServer = function(httpModule, callback){

    var createServerFunc = httpModule.createServer;

    httpModule.createServer = function(){

        var server = createServerFunc.apply(httpModule, arguments);

        server.on('request', function(req, res){

            var resEnd = res.end;

            res.end = function(){

                if(res.statusCode > 300) {
                    var error = new Error(res.statusMessage);
                    error.code = res.statusCode;
                    callback(error, req, res);
                }

                return resEnd.apply(res, arguments);
            };
        });

        return server;
    };
};