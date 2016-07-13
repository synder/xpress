/**
 * Created by synder on 16/7/13.
 */

const os = require('os');

var Comment = function () {
    this.__comment = '/**' + os.EOL;
};

Comment.prototype.line = function () {
    this.__comment += ' *';
    for(var i = 0; i < arguments.length; i++){
        if(arguments[i]){
            this.__comment += ' ' + arguments[i] + ' ';
        }
    }
    this.__comment += os.EOL;
};

Comment.prototype.end = function () {
    this.__comment += '**/';
    return this.__comment;
};

module.exports = Comment;