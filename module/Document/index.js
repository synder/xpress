/**
 * Created by synder on 16/7/11.
 */


const raw = require('./module/raw');
const html = require('./module/html');

/**
 * @desc 保存原始文档
 * */
exports.__storeRawDocument = function (docPath, action, response, request) {
    if(arguments.length == 2){
        raw.storeActionRawDocument(docPath, action, function (err) {
            if(err){
                console.error(err.stack);
            }
        });
    }else if(arguments.length == 3){
        raw.storeResponseRawDocument(docPath, action, response, function (err) {
            if(err){
                console.error(err.stack);
            }
        });
    }else if(arguments.length == 4){
        raw.storeExampleRawDocument(docPath, action, response, request, function (err) {
            if(err){
                console.error(err.stack);
            }
        });
    }else{
        throw new Error('rawDocument func param error');
    }
};


/**
 * @desc 渲染原始文档
 * */
exports.renderDocument = function (docPath, callback) {
    html.renderDocument(docPath, callback);
};