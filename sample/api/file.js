/**
 * Created by synder on 15/7/10.
 */
const path = require('path');
const Xpress = require('../../index');
const fileSys = Xpress.fs;
const document = Xpress.document;
const fs = require('fs');

const docRawPath = path.join(__dirname, 'docs', 'raw');

var parseInfoFromFileName = function (filename) {
    var temp = filename.split('@');
    var method = temp[0];
    var actionWithVersionAndChannel = temp[1].split('$');
    var action = actionWithVersionAndChannel[0].replace('[', '').replace(']', '');
    var versionAndChannel = actionWithVersionAndChannel[1].split('-')[0];

    return {
        method: method,
        action: action,
        versionAndChannel: versionAndChannel
    };
};

var getAllDocuments = function (docRawPath, callback) {
    var documents = {};
    fileSys.walk(docRawPath, function (opath, oname, onext) {

        var realtivePath = path.relative(docRawPath, opath).split(path.sep);

        var module = realtivePath.length > 0 ? realtivePath[0] : '';
        var controller = realtivePath.length > 1 ? realtivePath[1] : '';

        if(!documents[module]){
            documents[module] = {};
        }

        if(!documents[module][controller]){
            documents[module][controller] = {};
        }

        if(oname.indexOf('[ACTION]') > 0){

            var actionDocument = fs.readFileSync(path.join(opath, oname), {encoding: 'utf8'});
            var responseDocument = null;
            var exampleDocument = null;

            var outerInfo = parseInfoFromFileName(oname);

            if(!documents[module][controller][outerInfo.action]){
                documents[module][controller][outerInfo.action] = {};
            }

            var tempDoc = {};

            fileSys.list(opath, function (ipath, iname, inext) {

                if(oname == iname){
                    return inext();
                }

                if( oname.split('-')[0] = iname.split('-')[0]){

                    if(iname.indexOf('[EXAMPLE]') > 0){
                        //读取Example
                        exampleDocument = fs.readFileSync(path.join(ipath, iname), {encoding: 'utf8'});
                    }else if(iname.indexOf('[RESPONSE]') > 0){
                        //读取Response
                        responseDocument = fs.readFileSync(path.join(ipath, iname), {encoding: 'utf8'});
                    }

                    if(actionDocument){
                        tempDoc.action = JSON.parse(actionDocument);
                    }

                    if(responseDocument){
                        tempDoc.response = JSON.stringify(JSON.parse(responseDocument), null, 2);
                    }

                    if(exampleDocument){
                        tempDoc.example = JSON.stringify(JSON.parse(exampleDocument), null, 2);
                    }
                }

                inext();

            }, function (err) {
                documents[module][controller][outerInfo.action][outerInfo.method] = tempDoc;
                onext();
            });
        }else{
            onext();
        }
    }, function (err) {
        callback(err, documents);
    });
};

//生成所有模块的菜单
var genAllModuleMenus = function (docObj) {
    var moduleMenus = [];
    for(var key in docObj){
        moduleMenus.push({
            title: key,
            url: '/api/module/key'
        });
    }

    return moduleMenus;
};

//生成一个模块的所有Action菜单
var genModuleAllActionMenus = function (moduleObj) {
    var moduleActionMenus = [];
    for(var key in moduleObj){
        moduleActionMenus.push({
            title: key,
            url: '/api/module/action/key'
        });
    }

    return moduleActionMenus;
};

//生成一个模块下属于一个Action的文档
var renderModuleActionDocument = function (actionObj) {

    var action = [];

    for(var key in actionObj){
        action.push(actionObj[key]);
        console.log(JSON.stringify(actionObj[key],null, 2));
    }

    document.renderActionDocument({
        action: action
    }, function (err, html) {
        fs.writeFileSync('/Users/synder/Documents/project/node/xpress/template/doc/views/x.html', html, {
            encoding: 'utf8'
        })
    });
};

getAllDocuments(docRawPath, function (err, documents) {
    if(err){
        return //console.log(err);
    }

    var x = documents['home']['index']['index'];

    renderModuleActionDocument(x);

});