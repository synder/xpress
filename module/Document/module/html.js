/**
 * Created by synder on 16/7/16.
 */
const path = require('path');
const async = require('async');
const engine = require('art-template/node/template-native.js');

const fs = require('../../../lib/fs');
const crypto = require('../../../lib/crypto');

const PATH = require('../enum/path');
const SUFFIX = require('../enum/suffix');

const util = require('../lib/util');
const store = require('../lib/store');

/**
 * @desc 读取原始文档
 * */
var readRawDocument = function (docPath, callback) {

    var rawDocumentPath = util.getRawDocRootPath(docPath);

    var rawDouments = {};

    fs.walk(rawDocumentPath, function (opth, oname, onext) {

        if (oname.indexOf(SUFFIX.ACTION) < 0) {
            return onext();
        }

        var outerFilepath = path.join(opth, oname);
        var moduleName = util.parseModuleNameFromRawFileName(oname);
        var ctrlName = util.parseCtrlNameFromRawFileName(oname);
        var actionName = util.parseActionNameFromRawFileName(oname);
        var methodName = util.parseMethodNameFromRawFileName(oname);
        var versionAndChannel = util.parseVncNameFromRawFileName(oname);

        if (!rawDouments[moduleName]) {
            rawDouments[moduleName] = {};
        }

        if (!rawDouments[moduleName][ctrlName]) {
            rawDouments[moduleName][ctrlName] = {};
        }

        if (!rawDouments[moduleName][ctrlName][actionName]) {
            rawDouments[moduleName][ctrlName][actionName] = {};
        }

        if (!rawDouments[moduleName][ctrlName][actionName][methodName]) {
            rawDouments[moduleName][ctrlName][actionName][methodName] = {};
        }

        var outerActionID = util.parseActionIdentifierFromRawFileName(oname);

        var actionRawDocuments = JSON.parse(fs.readFileSync(outerFilepath, {encoding: 'utf8'}));

        actionRawDocuments.actionID = crypto.md5Hash(outerActionID);

        fs.walk(opth, function (ipth, iname, inext) {

            var innerActionID = util.parseActionIdentifierFromRawFileName(iname);

            if (iname.indexOf(SUFFIX.ACTION) > 0) {
                return inext();
            }

            if (innerActionID !== outerActionID) {
                return inext();
            }

            var innerFilePath = path.join(ipth, iname);

            if (iname.indexOf(SUFFIX.EXAMPLE) > 0) {
                var exampleRawDoc = JSON.parse(fs.readFileSync(innerFilePath, {encoding: 'utf8'}));

                actionRawDocuments.example = {
                    request: JSON.stringify(exampleRawDoc.request, null, 2),
                    response: JSON.stringify(exampleRawDoc.response, null, 2)
                };
            }

            if (iname.indexOf(SUFFIX.RESPONSE) > 0) {
                var responseRawDoc = fs.readFileSync(innerFilePath, {encoding: 'utf8'});

                try {
                    responseRawDoc = JSON.parse(responseRawDoc);
                    actionRawDocuments.response = JSON.stringify(responseRawDoc, null, 2);
                }catch (ex){
                    actionRawDocuments.response = responseRawDoc;
                }
            }

            inext();

        }, function (err) {

            if (err) {
                console.error(err.stack);
            }

            onext();
        });

        rawDouments[moduleName][ctrlName][actionName][methodName][versionAndChannel] = actionRawDocuments;

    }, function (err) {
        callback(err, rawDouments);
    });
};


/**
 * @desc 渲染每个api
 * */
var renderApiDocument = function (docPath, oneActionDocument, menus, callback) {

    var html = engine(PATH.TMPL_ACTION_VIEW_PATH, {
        documents: oneActionDocument,
        menus: menus
    });

    html = html.replace(/^[\s|\t| ]*\n/igm ,'');

    var moduleName = oneActionDocument.module.toUpperCase();
    var ctrlName = oneActionDocument.controller.toUpperCase();
    var actionName = oneActionDocument.action.toUpperCase();

    var filepath = util.getHtmlApiDocFilePath(docPath, moduleName, ctrlName, actionName);

    store.persist(filepath, html, callback);
};

/**
 * @desc 渲染首页
 * */
var renderIndexDocument = function (docPath, callback) {
    callback();
};


/**
 * @desc render template
 * */
exports.renderDocument = function (docPath, callback) {

    readRawDocument(docPath, function (err, rawDocuments) {
        if(err){
            return callback(err);
        }

        var documentsTemp = [];
        var moduleMenus = {};

        for(var module in rawDocuments){

            var moduleTemp = {
                module: module,
                controllers : []
            };

            moduleMenus[module] = {};

            for(var ctrl in rawDocuments[module]){

                var ctrlTemp = {
                    module: module,
                    controller: ctrl,
                    actions: []
                };


                var ctrlMenuTemp = [];

                for(var action in rawDocuments[module][ctrl]){

                    var actionTemp = {
                        module: module,
                        controller: ctrl,
                        action: action,
                        methods: []
                    };

                    ctrlMenuTemp.push({
                        action: action,
                        filename: util.getHtmlApiDocFileName(module, ctrl, action)
                    });

                    for(var method in rawDocuments[module][ctrl][action]){

                        var methodTemp = {
                            module: module,
                            controller: ctrl,
                            action: action,
                            method: method,
                            versions: []
                        };

                        for(var vnc in rawDocuments[module][ctrl][action][method]){
                            methodTemp.versions.push(rawDocuments[module][ctrl][action][method][vnc]);
                        }

                        actionTemp.methods.push(methodTemp);
                    }

                    ctrlTemp.actions.push(actionTemp);
                }

                moduleTemp.controllers.push(ctrlTemp);
                moduleMenus[module][ctrl] = ctrlMenuTemp;
            }

            documentsTemp.push(moduleTemp);
        }

        async.parallel({
            copyAssets: function (cb) {
                var htmlDocRootPath = util.getHtmlDocRootPath(docPath);
                var srcAssetsPath = PATH.TMPL_ASSETS_PATH;
                var desAssetsPath = path.join(htmlDocRootPath, 'assets');

                fs.copy(srcAssetsPath, desAssetsPath, cb);
            },
            
            renderIndex: function (cb) {
                renderIndexDocument(docPath, cb);
            },
            
            renderApis: function (cb) {
                async.eachLimit(documentsTemp, 1, function (module, next) {

                    var controllers = module.controllers;

                    async.eachLimit(controllers, 1, function (controller, next) {

                        var actions = controller.actions;

                        async.eachLimit(actions, 1, function (action, next) {

                            renderApiDocument(docPath, action, moduleMenus[action.module], function () {
                                next();
                            });

                        }, next);

                    }, next);

                }, cb);
            }
            
        }, callback);
        
    });
};