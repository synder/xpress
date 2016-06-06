/**
 * @author synder
 * @date 16/1/10
 * @desc
 */
var Router = require('Xpress').Router;
var homeRouter = new Router();

var homeCtrl = require('../../controller/home/index');

homeRouter.get('/', homeCtrl.page);

module.exports = homeRouter;