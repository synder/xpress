/**
 * Created by synder on 16/7/11.
 */

const path = require('path');
const engine = require('art-template');
const fs = require('../lib/fs');
const string = require('../lib/string');
const Controller = require('../server/Controller');

const tmplDir = path.join(__dirname, '../template/doc/views/');
const indexTmplPath = path.join(tmplDir, 'index.html');
const docTmplPath = path.join(tmplDir, 'doc.html');


/**
 * @desc gen doc by controller
 * */
var genDocObjWithController = function (controller,routePath) {

    if(!(controller instanceof Controller)){
        throw new Error('controller should be a Controller instance');
    }

    var docObj = {
        action: controller.__action,
        summary: controller.__summary,
        method: controller.__method,
        path: routePath,
        version: controller.__version,
        channel: controller.__channel,
        author: controller.__author,
        desc: controller.__desc,
        deprecated: controller.__deprecated,
        params: []
    };

    var validator = controller.__validate;

    var headerParam = {
        region: 'Header',
        params: []
    };

    var paramParam = {
        region: 'Param',
        params: []
    };

    var queryParam = {
        region: 'Query',
        params: []
    };

    var bodyParam = {
        region: 'Body',
        params: []
    };

    if(validator){
        for(var valKey in validator){
            var rule = validator[valKey];

            if(rule){
                for(var ruleKey in rule){
                    var temp = rule[ruleKey];
                    var paramName = ruleKey;
                    var paramType = temp.type;
                    var paramNullable = true;
                    var paramDesc = '';

                    paramType = string.capitalize(paramType, true);

                    if(temp.required == true){
                        paramNullable = false;
                    }

                    if(temp.val){
                        paramDesc += ruleKey + ' should match ' + JSON.stringify(temp.val);
                    }

                    if(temp.len){
                        if(paramDesc){
                            paramDesc += ' and ';
                        }
                        paramDesc +=  ruleKey + '.length should match ' + JSON.stringify(temp.len) + ';';
                    }

                    if(valKey == 'header'){
                        headerParam.params.push({
                            name: paramName,
                            types: paramType,
                            nullable: paramNullable,
                            description: paramDesc
                        });
                    }else if(valKey == 'param'){
                        paramParam.params.push({
                            name: paramName,
                            types: paramType,
                            nullable: paramNullable,
                            description: paramDesc
                        });
                    }else if(valKey == 'query'){
                        queryParam.params.push({
                            name: paramName,
                            types: paramType,
                            nullable: paramNullable,
                            description: paramDesc
                        });
                    }else if(valKey == 'body'){
                        bodyParam.params.push({
                            name: paramName,
                            types: paramType,
                            nullable: paramNullable,
                            description: paramDesc
                        });
                    }
                }
            }
        }
    }
    
    var sort = function (item) {
        if(item.nullable == true){
            return 1;
        }else{
            return -1;
        }
    };

    if(headerParam.params.length > 0){
        headerParam.params.sort(sort);
        docObj.params.push(headerParam);
    }

    if(paramParam.params.length > 0){
        paramParam.params.sort(sort);
        docObj.params.push(paramParam);
    }

    if(queryParam.params.length > 0){
        queryParam.params.sort(sort);
        docObj.params.push(queryParam);
    }

    if(bodyParam.params.length > 0){
        bodyParam.params.sort(sort);
        docObj.params.push(bodyParam);
    }

    return docObj;
};

/**
 * @desc render markdown
 * */
var renderIndexDocWithMarkdown = function (markdown, callback) {
    //todo
    callback && callback();
};

/**
 * @desc render template
 * */
var renderActionDocument = function (action, callback) {
    fs.read(docTmplPath, {encoding: 'utf8'}, function (err, template) {
        if(err){
            return callback(err);
        }

        if(!template){
            return callback(new Error('template is empty'));
        }

        var render = engine.compile(template);

        try{
            var html = render(action);
            callback(null, html);
        }catch (ex){
            callback(err);
        }
    });
};

exports.genDocObjWithController = genDocObjWithController;
exports.renderIndexDocWithMarkdown = renderIndexDocWithMarkdown;
exports.renderActionDocument = renderActionDocument;