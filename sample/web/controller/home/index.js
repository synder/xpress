/**
 * @author synder
 * @date 16/1/10
 * @desc
 */

var apiRequestor = require('../../helper/apiRequestor');

exports.page = function(req, res, next){
    apiRequestor.post({
        path: '/',
        version: 1,
        channel: 1,
        body: {
            name: 'age'
        }
    }, function (err, body) {
        if(err){
            console.error(err.stack);
        }
        res.send(body);
    });

};