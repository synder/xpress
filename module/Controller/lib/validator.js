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

    if(Array.isArray(rule.has)){
        rule.has.forEach(function (property) {
            if(!value.hasOwnProperty(property)){
                return type + '.' + key + '.' + attr + ' has none property "' + property + '"';
            }
        });
    }

    return null;
};

var genValidateFunction = function (type, validate) {

    var conditions = validate;

    return function (data) {

        var rule,
            param,
            value;

        for(var i = 0, len = conditions.length; i < len; i++){

            param = conditions[i].param;
            rule = conditions[i].rule;

            value = data[param];

            if(rule.required == true){
                if(!value){
                    return type + '.' + param + ' is required';
                }
            }else{
                if(validator.isNullOrUndefined(value)){
                    continue;
                }
            }

            if(rule.type){
                switch (rule.type){
                    case DATA_TYPES.IP: {
                        if(!validator.isIPAddress(value)){
                            return type + '.' + param + ' is not ip';
                        }
                    } break;
                    case DATA_TYPES.URL: {
                        if(!validator.isUrl(value)){
                            return type + '.' + param + ' is not url';
                        }
                    } break;
                    case DATA_TYPES.EMAIL: {
                        if(!validator.isEmail(value)){
                            return type + '.' + param + ' is not email';
                        }
                    } break;
                    case DATA_TYPES.BOOL: {
                        if(!validator.isBool(value)){
                            return type + '.' + param + ' is not bool';
                        }
                    } break;
                    case DATA_TYPES.STRING: {
                        if(!validator.isString(value)){
                            return type + '.' + param + ' is not string';
                        }
                    } break;
                    case DATA_TYPES.ARRAY: {
                        if(!validator.isArray(value)){
                            return type + '.' + param + ' is not string';
                        }
                    } break;
                    case DATA_TYPES.DATE: {

                        if(!validator.isDateable(value)){
                            return type + '.' + param + ' is not date';
                        }
                    } break;
                    case DATA_TYPES.FLOAT: {
                        if(!validator.isFloatable(value)){
                            return type + '.' + param + ' is not float';
                        }
                    } break;
                    case DATA_TYPES.INTEGER: {
                        if(!validator.isIntable(value)){
                            return type + '.' + param + ' is not integer';
                        }
                    } break;
                    case DATA_TYPES.NUMBER: {
                        if(!validator.isNumable(value)){
                            return type + '.' + param + ' is not number';
                        }
                    } break;
                    case DATA_TYPES.OBJECT: {
                        if(!validator.isObject(value)){
                            return type + '.' + param + ' is not object';
                        }

                        if(rule.pro){
                            var msg = verify('property', type, param, value, rule.val);
                            if(msg){
                                return rule.msg || msg;
                            }
                        }

                    } break;
                    default: throw new Error(rule.type + ' is not support');
                }
            }

            if(rule.validator && typeof rule.validator === 'function'){
                if(!rule.validator(value)){
                    return rule.msg || type + '.' + param + ' is validate failed';
                }else{
                    return null;
                }
            }else{

                if(rule.len){
                    var lenVerifyMsg = verify('length', type, param, value.length, rule.len);
                    if(lenVerifyMsg){
                        return rule.msg || lenVerifyMsg;
                    }
                }

                if(rule.val){
                    var valVerifyMsg = verify('value', type, param, value, rule.val);
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