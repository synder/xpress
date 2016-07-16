/**
 * Created by synder on 16/7/16.
 */

const string = require('../../lib/string');
const colors = require('colors');

exports.create = function () {
    return function (color, func, method, version, channel, path) {

        var str = colors[color](string.pad('Time:' + Date.now(), 22, ' ', 'right'));

        if(func){
            str += ' ' + colors[color](string.pad(func, 10, ' ', 'right'));
        }

        if(method){
            str += ' ' + colors[color](string.pad(method, 6, ' ', 'right'));
        }

        if(version){
            str += ' ' + colors[color]('version:' + string.pad(version, 5, ' ', 'right'));
        }

        if(channel){
            str += ' ' + colors[color]('channel:' + string.pad(channel, 5, ' ', 'right'));
        }

        if(path){
            str += ' ' + colors[color](path);
        }

        console.log(str);
    };
};