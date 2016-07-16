/**
 * Created by synder on 16/7/16.
 */

exports.create = function (code) {
    if(code == 404){
        return function (req, res) {
            var err = new Error('resource not found:' + req.originalUrl);
            err.code = 404;
            res.status(err.code).send('resource not found');
        };
    }else if(code == 500){
        return function (err, req, res) {
            err.code = err.code || 500;
            console.error(err.stack);
            res.status(err.code).send(err.message);
        }
    }else{
        return function (err, req, res) {
            console.error(err.stack);
            res.send(err.message);
        }
    }
};