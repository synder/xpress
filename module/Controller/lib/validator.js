/**
 * Created by synder on 16/7/11.
 */


const validator = require('../../../lib/validate');

const DATA_TYPES = require('../enum/types');

var verify = function (attr, type, key, value, rule) {

    if(rule.gt){
        if(!(value > rule.gt)){
            return type + '.' + key + '.' + attr + ' == ' + value + ' is not gt ' + rule.gt;
        }
    }

    if(rule.gte){
        if(value < rule.gte){
            return type + '.' + key + '.' + attr + ' == ' + value + ' is not gte ' + rule.gte;
        }
    }

    if(rule.lt){
        if(!(value < rule.lt)){
            return type + '.' + key + '.' + attr + ' == ' + value + ' is not lt ' + rule.lt;
        }
    }

    if(rule.lte){
        if(value > rule.lte){
            return type + '.' + key + '.' + attr + ' == ' + value + ' is not lte ' + rule.lte;
        }
    }

    if(rule.eq){
        if(Array.isArray(value) && Array.isArray(rule.eq)){
            if(value.sort().toString() !== rule.eq.sort().toString()){
                return type + '.' + key + '.' + attr + ' == ' + JSON.stringify(value) + ' is not eq ' + JSON.stringify(rule.eq);
            }
        }else{
            if(value !== rule.eq){
                return type + '.' + key + '.' + attr + ' == ' + value + ' is not eq ' + rule.eq;
            }
        }
    }

    if(rule.neq){
        if(Array.isArray(value) && Array.isArray(rule.neq)){
            if(value.sort().toString() === rule.neq.sort().toString()){
                return type + '.' + key + '.' + attr + ' == ' + JSON.stringify(value) + ' is not neq ' + JSON.stringify(rule.neq);
            }
        }else{
            if(value === rule.eq){
                return type + '.' + key + '.' + attr + ' == ' + value + ' is not neq ' + rule.neq;
            }
        }
    }

    if(Array.isArray(rule.in)){
        if(!rule.in.includes(value)){
            return type + '.' + key + '.' + attr + ' == ' + value + ' is not in ' + JSON.stringify(rule.in);
        }
    }

    if(Array.isArray(rule.nin)){
        if(rule.nin.includes(value)){
            return type + '.' + key + '.value == ' + value + ' is not nin ' + JSON.stringify(rule.nin);
        }
    }

    if(rule.like){
        if(!rule.like.test(value)){
            return type + '.' + key + '.' + attr + ' == ' + value + ' is not like ' + rule.like.toString();
        }
    }

    return null;
};

var genValidateFunction = function (type, conditions) {
    return function (data) {
        for(var key in conditions){
            var rule = conditions[key];

            var value = data[key];

            if(rule.required == true){
                if(!value){
                    return type + '.' + key + ' is required';
                }
            }

            if(rule.required == false && validator.isNullOrUndefined(value)){
                return null;
            }

            if(rule.type){
                switch (rule.type){
                    case DATA_TYPES.IP: {
                        if(!validator.isIPAddress(value)){
                            return type + '.' + key + ' is not ip';
                        }
                    } break;
                    case DATA_TYPES.URL: {
                        if(!validator.isUrl(value)){
                            return type + '.' + key + ' is not url';
                        }
                    } break;
                    case DATA_TYPES.EMAIL: {
                        if(!validator.isEmail(value)){
                            return type + '.' + key + ' is not email';
                        }
                    } break;
                    case DATA_TYPES.BOOL: {
                        if(!validator.isBool(value)){
                            return type + '.' + key + ' is not bool';
                        }
                    } break;
                    case DATA_TYPES.STRING: {
                        if(!validator.isString(value)){
                            return type + '.' + key + ' is not string';
                        }
                    } break;
                    case DATA_TYPES.ARRAY: {
                        if(!validator.isArray(value)){
                            return type + '.' + key + ' is not string';
                        }
                    } break;
                    case DATA_TYPES.DATE: {
                        if(!validator.isDate(value)){
                            return type + '.' + key + ' is not date';
                        }
                    } break;
                    case DATA_TYPES.FLOAT: {
                        if(!validator.isFloat(value)){
                            return type + '.' + key + ' is not float';
                        }
                    } break;
                    case DATA_TYPES.INTEGER: {
                        if(!validator.isInt(value)){
                            return type + '.' + key + ' is not integer';
                        }
                    } break;
                    case DATA_TYPES.NUMBER: {
                        if(!validator.isNumber(value)){
                            return type + '.' + key + ' is not number';
                        }
                    } break;
                    default: throw new Error(rule.type + ' is not support');
                }
            }

            if(typeof rule.validator == 'function'){
                if(!rule.validator(value)){
                    return rule.msg || type + '.' + key + ' is validate failed';
                }
            }else{
                if(rule.len){
                    var lenVerifyMsg = verify('length', type, key, value.length, rule.len);
                    if(lenVerifyMsg){
                        return rule.msg || lenVerifyMsg;
                    }
                }

                if(rule.val){
                    var valVerifyMsg = verify('value', type, key, value, rule.val);
                    if(valVerifyMsg){
                        return rule.msg || valVerifyMsg;
                    }
                }
            }
        }
        return null;
    };

};

exports.genValidateFunction = genValidateFunction;