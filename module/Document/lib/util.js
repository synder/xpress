/**
 * Created by synder on 16/7/16.
 */

var path = require('path');

var PATH = require('../enum/path');
var SUFFIX = require('../enum/suffix');

//-------------------------------------------------
//获取原始文档的根目录
exports.getRawDocRootPath = function (docPath) {
    return path.join(docPath, PATH.DOC_RAW_DIRNAME);
};

//获取html文档额根目录
exports.getHtmlDocRootPath = function (docPath) {
    return path.join(docPath, PATH.DOC_HTML_DIRNAME);
};

//-------------------------------------------------
//生成不带后缀的原始文档文件名
var genRawDocFileName = function (action, suffix) {

    var moduleName = action.__module ? action.__module.toUpperCase() : '';
    var ctrlName   = action.__controller ? action.__controller.toUpperCase() : '';
    var actionName = action.__action ? action.__action.toUpperCase() : '';
    var methodName = action.__method ? action.__method.toUpperCase().slice(0,3) : '';
    var version    = action.__version ? action.__version : '';
    var channel    = action.__channel ? action.__channel : '';
    var versionAndChannel = version + ':' + channel;

    return  methodName + '@'
        + actionName + '#'
        + moduleName + '$'
        + ctrlName + '&'
        + versionAndChannel + suffix;
};

//生成每个action的原始文件名
exports.genActionRawDocFileName = function (action) {
    return genRawDocFileName(action, SUFFIX.ACTION);
};

//生成每个response的原始文件名
exports.genResponseRawDocFileName = function (action) {
    return genRawDocFileName(action, SUFFIX.RESPONSE);
};

//生成每个example的原始文件名
exports.genExampleRawDocFileName = function (action) {
    return genRawDocFileName(action, SUFFIX.EXAMPLE);
};


//-------------------------------------------------
//从原始文档名中解析出
exports.parseActionNameFromRawFileName = function (filename) {
    return filename.split('@')[1].split('#')[0];
};

exports.parseModuleNameFromRawFileName = function (filename) {
    return filename.split('$')[0].split('#')[1];
};

exports.parseCtrlNameFromRawFileName = function (filename) {
    return filename.split('&')[0].split('$')[1];
};

exports.parseActionIdentifierFromRawFileName = function (filename) {
    return filename.split('%')[0];
};

exports.parseMethodNameFromRawFileName = function (filename) {
    return filename.split('@')[0];
};

exports.parseVncNameFromRawFileName = function (filename) {
    return filename.split('&')[1].split('%')[0];
};


//-------------------------------------------------
exports.getHtmlApiDocFileName = function (moduleName, ctrlName, actionName) {
    return  moduleName + '-' + ctrlName + '-' + actionName + SUFFIX.HTML;
};

exports.getHtmlApiDocFilePath = function (docPath, moduleName, ctrlName, actionName) {

    var htmlRootPath = exports.getHtmlDocRootPath(docPath);
    var apiDir = PATH.DOC_HTML_API_DIRNAME;
    var htmlApiFileName = exports.getHtmlApiDocFileName(moduleName, ctrlName, actionName);

    return path.join(htmlRootPath, apiDir, htmlApiFileName);
};