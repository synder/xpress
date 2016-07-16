/**
 * Created by synder on 16/7/16.
 */


exports.validateFunc = function (routeChannel) {
    return function (reqChannel) {
        return reqChannel == routeChannel;
    };
};