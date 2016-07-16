/**
 * Created by synder on 16/7/16.
 */

const path = require('path');

const string = require('../../../lib/string');
const Controller = require('../../Controller');

const store = require('../lib/store');
const util = require('../lib/util');


var checkController = function (action) {
    if(!(action instanceof Controller)){
        throw new Error('action should be a Controller instance');
    }
};

/**
 * @desc gen doc by controller
 * */
exports.storeActionRawDocument = function (docPath, action, callback) {

    checkController(action);

    var objectDocument = {
        action: action.__action,
        summary: action.__summary,
        method: action.__method,
        path: action.__path,
        version: action.__version,
        channel: action.__channel,
        author: action.__author,
        desc: action.__desc,
        deprecated: action.__deprecated,
        request: []
    };

    var validator = action.__validate;

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

                    if(temp.desc){
                        paramDesc += temp.desc + '; ';
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
        objectDocument.request.push(headerParam);
    }

    if(paramParam.params.length > 0){
        paramParam.params.sort(sort);
        objectDocument.request.push(paramParam);
    }

    if(queryParam.params.length > 0){
        queryParam.params.sort(sort);
        objectDocument.request.push(queryParam);
    }

    if(bodyParam.params.length > 0){
        bodyParam.params.sort(sort);
        objectDocument.request.push(bodyParam);
    }

    var stringDocument = JSON.stringify(objectDocument);

    var rawDocRootPath = util.getRawDocRootPath(docPath);

    var moduleName = action.__module;
    var ctrlName =  action.__controller;

    var filename = util.genActionRawDocFileName(action);

    var rawActionDocSavePath = path.join(rawDocRootPath, moduleName, ctrlName, filename);

    store.persist(rawActionDocSavePath, stringDocument, callback);
};

/**
 * @desc store response raw document
 * */
exports.storeResponseRawDocument = function (docPath, action, response, callback) {
    checkController(action);

    var rawDocRootPath = util.getRawDocRootPath(docPath);

    var moduleName = action.__module;
    var ctrlName =  action.__controller;

    var filename = util.genResponseRawDocFileName(action);

    var responseRawDocSavePath = path.join(rawDocRootPath, moduleName, ctrlName, filename);

    var stringDocument = JSON.stringify(response);

    store.persist(responseRawDocSavePath, stringDocument, callback);
};

/**
 * @desc store example raw document
 * */
exports.storeExampleRawDocument = function(docPath, action, response, request, callback){
    checkController(action);

    var example = {
        request: {},
        response : response
    };

    if(Object.getOwnPropertyNames(request.headers).length > 0){
        example.request.headers = request.headers;
    }

    if(Object.getOwnPropertyNames(request.query).length > 0){
        example.request.query = request.query;
    }

    if(Object.getOwnPropertyNames(request.params).length > 0){
        example.request.params = request.params;
    }

    if(Object.getOwnPropertyNames(request.body).length > 0){
        example.request.body = request.body;
    }

    var rawDocRootPath = util.getRawDocRootPath(docPath);

    var moduleName = action.__module;
    var ctrlName =  action.__controller;

    var filename = util.genExampleRawDocFileName(action);

    var exampleRawDocSavePath = path.join(rawDocRootPath, moduleName, ctrlName, filename);

    var stringDocument = JSON.stringify(example);

    store.persist(exampleRawDocSavePath, stringDocument, callback);
};