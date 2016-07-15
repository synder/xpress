/**
 * Created by synder on 16/7/11.
 */

const os = require('os');
const path = require('path');
const async = require('async');
const engine = require('art-template/node/template-native.js');
const crypto = require('crypto');
const fs = require('../lib/fs');
const string = require('../lib/string');
const Controller = require('../server/Controller');

const TMPL_DIR_PATH = path.join(__dirname, '../template/doc/views');
const TMPL_ASSERT_PATH = path.join(__dirname, '../template/doc/assets');

const MODULE_TMPL_PATH = path.join(TMPL_DIR_PATH, 'module');
const ACTION_TMPL_PATH = path.join(TMPL_DIR_PATH, 'action');

const SUFFIX = {
    ACTION: '&A.json',
    RESPONSE: '&R.json',
    EXAMPLE: '&E.json'
};

/**
 * @desc gen file name
 * */
var genDocRawDocumentPath = function (docPath) {
    return path.join(docPath, 'raw');
};

var genDocHtmlDocumentPath = function (docPath) {
    return path.join(docPath, 'html');
};

var genActionDocumentFileName = function (action) {
    return action.__id() + SUFFIX.ACTION;
};

var genResponseDocumentFileName = function (action) {
    return action.__id() + SUFFIX.RESPONSE;
};

var genExampleDocumentFileName = function (action) {
    return action.__id() + SUFFIX.EXAMPLE;
};

var genActionHtmlDocumentFileName = function (module, ctrl, action) {
    return  module + '-' + ctrl + '-' + action.toLowerCase() + '.html';
};

var genActionID = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};

/***/
var getActionNameFromDocFileName = function (filename) {
    return filename.split('@')[1].split('#')[0];
};

var getActionIDFromDocFileName = function (filename) {
    return filename.split('&')[0];
};

var getMethodFromDocFileName = function (filename) {
    return filename.split('@')[0];
};

var getVerAndChaFromDocFileName = function (filename) {
    return filename.split('&')[0].split('#')[1].split(':')
};


/**
 * @desc gen doc by controller
 * */
var actionDocument = function (action, docPath, callback) {

    if(!(action instanceof Controller)){
        throw new Error('action should be a Controller instance');
    }

    var docObj = {
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
        docObj.request.push(headerParam);
    }

    if(paramParam.params.length > 0){
        paramParam.params.sort(sort);
        docObj.request.push(paramParam);
    }

    if(queryParam.params.length > 0){
        queryParam.params.sort(sort);
        docObj.request.push(queryParam);
    }

    if(bodyParam.params.length > 0){
        bodyParam.params.sort(sort);
        docObj.request.push(bodyParam);
    }

    var docStr = JSON.stringify(docObj);

    var rawDocRootPath = genDocRawDocumentPath(docPath);

    var actionDocSavePath = path.join(rawDocRootPath, action.__module, action.__controller);

    fs.mkdir(actionDocSavePath, function (err) {
        if(err){
            return callback && callback(err);
        }

        var filename = genActionDocumentFileName(action);

        var filepath = path.join(actionDocSavePath, filename);

        fs.save(filepath, docStr, callback);
    });
};

/**
 * @desc 
 * */
var responseDocument = function (action, docPath, response, callback) {
    if(!(action instanceof Controller)){
        throw new Error('action should be a Controller instance');
    }

    var actionDocSavePath = path.join(genDocRawDocumentPath(docPath), action.__module, action.__controller);

    fs.mkdir(actionDocSavePath, function (err) {
        if(err){
            return callback(err);
        }

        var filename = genResponseDocumentFileName(action);

        var filepath = path.join(actionDocSavePath, filename);

        fs.save(filepath, JSON.stringify(response), callback);
    });
};

/**
 * @desc
 * */
var exampleDocument = function(action, docPath, example, callback){
    if(!(action instanceof Controller)){
        throw new Error('action should be a Controller instance');
    }

    var actionDocSavePath = path.join(genDocRawDocumentPath(docPath), action.__module, action.__controller);

    fs.mkdir(actionDocSavePath, function (err) {
        if(err){
            return callback(err);
        }

        var filename = genExampleDocumentFileName(action);

        var filepath = path.join(actionDocSavePath, filename);

        fs.save(filepath, JSON.stringify(example), callback);
    });
};

/**
 * @desc
 * */
var renderActionHtmlDocument = function (docPath, oneActionDocument, menus, callback) {

    var html = engine(ACTION_TMPL_PATH, {
        documents: oneActionDocument,
        menus: menus
    });

    var rootPath = genDocHtmlDocumentPath(docPath);
    var module = oneActionDocument.module;
    var controller = oneActionDocument.controller;
    var action = oneActionDocument.action;

    var filename = genActionHtmlDocumentFileName(module, controller, action);
    var dirpath = path.join(rootPath, 'api');
    var filepath = path.join(dirpath, filename);

    fs.mkdir(dirpath, function (err) {
        if(err){
            return callback(err);
        }

        fs.save(filepath, html, {encoding: 'utf8'}, callback);
    });
};

/**
 * @desc
 * */
var renderIndexHtmlDocument = function () {
    
};


var copyStaticAssert = function (docPath, callback) {
    var rootPath = genDocHtmlDocumentPath(docPath);
    fs.copy(TMPL_ASSERT_PATH, path.join(rootPath, 'assets'), callback);
};


/**
 * @desc render template
 * */
var renderRawDocumentToHtmlDocument = function (docPath, callback) {

    var rawDocumentPath = genDocRawDocumentPath(docPath);

    var rawDouments = {};

    fs.walk(rawDocumentPath, function (opth, oname, onext) {

        if(oname.indexOf(SUFFIX.ACTION) < 0){
            return onext();
        }

        var tempPath = path.relative(rawDocumentPath, opth).split(path.sep);

        var moduleName = tempPath[0];
        var ctrlName = tempPath[1];
        var actionName = getActionNameFromDocFileName(oname);
        var methodName = getMethodFromDocFileName(oname);
        var versionAndChannel = getVerAndChaFromDocFileName(oname);

        if(!rawDouments[moduleName]){
            rawDouments[moduleName] = {};
        }

        if(!rawDouments[moduleName][ctrlName]){
            rawDouments[moduleName][ctrlName] = {};
        }

        if(!rawDouments[moduleName][ctrlName][actionName]){
            rawDouments[moduleName][ctrlName][actionName] = {};
        }

        if(!rawDouments[moduleName][ctrlName][actionName][methodName]){
            rawDouments[moduleName][ctrlName][actionName][methodName] = {};
        }

        var outerActionID = getActionIDFromDocFileName(oname);

        var actionDocuments = JSON.parse(fs.readFileSync(path.join(opth, oname), {encoding: 'utf8'}));
        actionDocuments.actionID = genActionID(outerActionID);

        fs.walk(opth, function (ipth, iname, inext) {

            var innerActionID = getActionIDFromDocFileName(iname);

            if(innerActionID !== outerActionID){
                return inext();
            }

            if(iname.indexOf(SUFFIX.EXAMPLE) > 0){
                var example = JSON.parse(fs.readFileSync(path.join(ipth, iname), {encoding: 'utf8'}));
                actionDocuments.example = {
                    request: JSON.stringify(example.request, null, 2),
                    response: JSON.stringify(example.response, null, 2)
                };
            }

            if(iname.indexOf(SUFFIX.RESPONSE) > 0){
                var response = JSON.parse(fs.readFileSync(path.join(ipth, iname), {encoding: 'utf8'}));
                actionDocuments.response = JSON.stringify(response, null, 2);
            }

            inext();

        }, function (err) {

            if(err){
                console.error(err.stack);
            }

            onext();
        });

        rawDouments[moduleName][ctrlName][actionName][methodName][versionAndChannel] = actionDocuments;

    }, function (err) {
        if(err){
            callback(err);
        }

        var documents = [];
        var moduleMenus = {};

        for(var module in rawDouments){

            var moduleTemp = {
                module: module,
                controllers : []
            };

            moduleMenus[module] = {};

            for(var ctrl in rawDouments[module]){

                var ctrlTemp = {
                    module: module,
                    controller: ctrl,
                    actions: []
                };


                var ctrlMenuTemp = [];

                for(var action in rawDouments[module][ctrl]){

                    var actionTemp = {
                        module: module,
                        controller: ctrl,
                        action: action,
                        methods: []
                    };

                    ctrlMenuTemp.push({
                        action: action,
                        filename: genActionHtmlDocumentFileName(module, ctrl, action)
                    });

                    for(var method in rawDouments[module][ctrl][action]){

                        var methodTemp = {
                            module: module,
                            controller: ctrl,
                            action: action,
                            method: method,
                            versions: []
                        };

                        for(var vnc in rawDouments[module][ctrl][action][method]){
                            methodTemp.versions.push(rawDouments[module][ctrl][action][method][vnc]);
                        }

                        actionTemp.methods.push(methodTemp);
                    }

                    ctrlTemp.actions.push(actionTemp);
                }

                moduleTemp.controllers.push(ctrlTemp);
                moduleMenus[module][ctrl] = ctrlMenuTemp;
            }

            documents.push(moduleTemp);
        }

        async.eachLimit(documents, 1, function (module, next) {

            var controllers = module.controllers;

            async.eachLimit(controllers, 1, function (controller, next) {

                var actions = controller.actions;

                async.eachLimit(actions, 1, function (action, next) {

                    renderActionHtmlDocument(docPath, action, moduleMenus[action.module], function () {
                        next();
                    });

                }, function (err) {
                    next(err);
                });

            }, function (err) {
                next(err);
            });
            
        }, function (err) {
            copyStaticAssert(docPath, callback);
        });
    });
};


exports.actionDocument = actionDocument;
exports.responseDocument = responseDocument;
exports.exampleDocument = exampleDocument;

exports.renderRawDocumentToHtmlDocument = renderRawDocumentToHtmlDocument;