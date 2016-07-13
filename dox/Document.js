/**
 * Created by synder on 16/7/11.
 */


const dox = require('dox');
const template = require('art-template');
const fs = require('../lib/fs');
const string = require('../lib/string');
const Comment = require('./Comment');

const Controller = require('../server/Controller');

var controller = Controller.action(exports, 'index').post()
    .path('/')
    .name('测试api')
    .desc('这是一个测试api')
    .validate({
        query: {
            username: {type: 'string', required: true, len: {gt: 2, lt: 20}, val: {like: ''}},
            password: {type: 'string', required: true, len: {gt: 2, lt: 20}},
            scores  : {type: 'array',  required: true, len: {gte: 2, lte: 20}, val:{eq: [100, 98]}},
            age     : {type: 'number', required: true, val: {gte: 0, lte: 100}},
            channel : {type: 'number', required: true, val: {eq: 2}},
            height  : {type: 'number', required: true, val: {neq: 10}},
            gender  : {type: 'bool',   required: true, val: {in: [true, false]}},
            mind    : {type: 'number', required: true, val: {nin: [0,1]}}
        },
        body: {
            username: {type: 'string', required: true, len: {gt: 2, lt: 20}, val: {like: ''}},
            password: {type: 'string', required: true, len: {gt: 2, lt: 20}},
            scores  : {type: 'array',  required: true, len: {gte: 2, lte: 20}, val:{eq: [100, 98]}},
            age     : {type: 'number', required: true, val: {gte: 0, lte: 100}},
            channel : {type: 'number', required: true, val: {eq: 2}},
            height  : {type: 'number', required: true, val: {neq: 10}},
            gender  : {type: 'bool',   required: true, val: {in: [true, false]}},
            mind    : {type: 'number', required: true, val: {nin: [0,1]}}
        }
    })
    .handle( function(req, res, next){
        res.json({
            code: 1,
            msg: null,
            data: {
                version: 1.0
            }
        });
    });

const COMMENT_FILED_MAP = {
    "author": "作者",
    "time": "时间",
    "action": "名字",
    "summary": "详情",
    "desc": "详情",
    "method": "方法",
    "path": "路径",
    "version": "版本",
    "channel": "通道",
    "param": "参数",
    "return": "返回",
    "api": "可见度",
    "property": "属性",
    "function": "函数",
    "declaration": "声明",
    "exception": "异常",
    "name": "名字",
    "req.header": "请求头",
    "req.query": "URL参数",
    "req.body": "请求体",
    "res.header": "响应头",
    "res.body": "响应体",
    "examples": "示例"
};

var genCommentWithController = function (controller) {

    var comment = new Comment();

    if(controller.__name){
        comment.line(controller.__name);
    }

    if(controller.__desc){
        comment.line();
        comment.line(' -', controller.__desc);
    }

    if(controller.__action){
        comment.line('@action', controller.__action);
    }

    if(controller.__method){
        comment.line('@method', controller.__method);
    }

    if(controller.__path){
        comment.line('@path', controller.__path);
    }

    if(controller.__version){
        comment.line('@version', controller.__version);
    }

    if(controller.__channel){
        comment.line('@channel', controller.__channel);
    }

    if(controller.__author){
        comment.line('@author', controller.__author);
    }

    var validator = controller.__validate;

    var ruleDoc = function (filed, rule) {
        for(var key in rule){
            var temp = rule[key];

            var type = temp.type;

            type = string.capitalize(type, true);

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

            comment.line('@param', type, filed + '.' + key, match, temp.desc);
        }
    };

    if(validator){
        for(var key in validator){
            if(key == 'body'){
                if(validator.body){
                    ruleDoc('req.body', validator.body);
                }
            }else if(key == 'query'){
                if(validator.query){
                    ruleDoc('req.query', validator.query);
                }
            }else if(key == 'header'){
                if(validator.header){
                    ruleDoc('req.header', validator.header);
                }
            }
        }
    }

    return comment.end();
};

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

var x = genCommentWithController(controller);

var obj = dox.parseComments(x);

console.log(x);
console.log(obj);