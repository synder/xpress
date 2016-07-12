/**
 * Created by synder on 16/7/11.
 */

const os = require('os');
const dox = require('dox');
const fs = require('../lib/fs');

var Comment = function () {
    this.__comment = '/**' + os.EOL;
};

Comment.prototype.line = function () {
    this.__comment += ' * ';
    for(var i = 0; i < arguments.length; i++){
        if(arguments[i]){
            this.__comment += arguments[i] + ' ';
        }
    }
    this.__comment += os.EOL;
};

Comment.prototype.end = function () {
    this.__comment += '**/';
    return this.__comment;
};


var validate = {
    body: {
        username: {type: 'string', required: true, len: {gt: 2, lt: 20}, val: {like: ''}},
        password: {type: 'string', required: true, len: {gt: 2, lt: 20}},
        scores  : {type: 'array',  required: true, len: {gte: 2, lte: 20}, val:{eq: [100, 98]}},
        age     : {type: 'number', required: false, val: {gte: 0, lte: 100}},
        channel : {type: 'number', required: true, val: {eq: 2}},
        height  : {type: 'number', required: true, val: {neq: 10}},
        gender  : {type: 'bool',   required: true, val: {in: [true, false]}},
        mind    : {type: 'number', required: true, val: {nin: [0,1]}}
    }
};

var genDocWithValidate = function (rule) {

    var comment = new Comment();

    for(var key in rule){
        var temp = rule[key];

        var type = temp.type;

        if(temp.required){
            type = type + '!';
        }else{
            type = type + '?';
        }

        type = '{' + type + '}';

        var match = '';

        if(temp.val){
            match += key + ' should match ' + JSON.stringify(temp.val);
        }

        if(temp.len){
            if(match){
                match += ' and ';
            }
            match +=  key + '.length should match ' + JSON.stringify(temp.len) + ';';
        }

        comment.line('@param', type, 'body.' + key, match, temp.desc);
    }

    return comment.end();
};

console.log(genDocWithValidate(validate.body));


var code = `
/**
 * Output the given str to _stdout_
 * or the stream specified by options.
 *
 * Options:
 *
 *   - stream defaulting to _stdout_
 *
 * Examples:
 *
 *     mymodule.write('foo')
 *     mymodule.write('foo', { stream: process.stderr })
 *
 * @author 作者
 * @time 2015-06-19
 * @group name
 * @action index 
 * @method GET
 * @path /home/index
 * @version 1.0
 * @channel 2.0
 * @param {String!} query.name required lg 10 and lt 20
 * @param {String} query.html string to be escaped
 * @param {String} body.name string to be escaped
 * @param {String} body.escaped html
 * @api public
 */
`;

var obj = dox.parseComments(genDocWithValidate(validate.body));

console.log(obj[0].tags);
//console.log(obj);