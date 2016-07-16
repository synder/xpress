/**
 * Created by synder on 16/7/16.
 */


exports.validateFunc = function (routeVersion) {

    var version = routeVersion;
    

    if(typeof version === 'number'){
        return function (reqVersion) {
            return reqVersion == version;
        };
    }else{
        if(version.indexOf('>=') >= 0){

            version = parseFloat(version.replace('>=', ''));

            return function (reqVersion) {
                return reqVersion >= version;
            };
        }else if(version.indexOf('<=') >= 0){
            version = parseFloat(version.replace('<=', ''));

            return function (reqVersion) {
                return reqVersion >= version;
            };
        }else if(version.indexOf('>') >= 0){
            version = parseFloat(version.replace('>', ''));

            return function (reqVersion) {
                return reqVersion > version;
            };
        }else if(version.indexOf('<') >= 0){
            version = parseFloat(version.replace('<', ''));

            return function (reqVersion) {
                return reqVersion < version;
            };
        }else {
            return function (reqVersion) {
                return reqVersion == version;
            };
        }
    }
};