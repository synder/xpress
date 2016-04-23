/**
 * @author synder
 * @date 16/1/10
 * @desc
 */
var Router = require('xpress').Router;
var homeRouter = new Router();

var homeCtrl = require('../../controller/home/index');

exports.map = function(){

    homeRouter.get('/', homeCtrl.index);
    homeRouter.get('/data', homeCtrl.data);

    return homeRouter;
};