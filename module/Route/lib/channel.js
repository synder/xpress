/**
 * Created by synder on 16/7/16.
 */


exports.validateFunc = function (routeChannel) {

    var channels = {};

    if(routeChannel + ''){
        routeChannel.split('|').forEach(function (item) {
            channels[item] = true;
        });
    }

    return function (reqChannel) {
        return channels[reqChannel];
    };
};