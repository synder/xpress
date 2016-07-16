/**
 * Created by synder on 16/7/16.
 */

var path = require('path');
var fs = require('../../../lib/fs');

const util = require('../lib/util');

exports.persist = function (pth, content, callback) {

    var dir = path.dirname(pth);

    fs.exists(pth, function (err, exist) {
        if(exist){
            fs.remove(pth, function () {
                fs.mkdir(dir, function (err) {
                    if(err){
                        return callback(err);
                    }

                    fs.save(pth, content, {encoding: 'utf8'}, callback);
                })
            });
        }else{
            fs.mkdir(dir, function (err) {
                if(err){
                    return callback(err);
                }

                fs.save(pth, content, {encoding: 'utf8'}, callback);
            })
        }
    });
};