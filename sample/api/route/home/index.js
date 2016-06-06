/**
 * @author synder
 * @date 16/1/10
 * @desc
 */
var Router = require('Xpress').Router;
var homeRouter = new Router();

var homeCtrl = require('../../controller/home/index');

homeRouter.post('/',{v:1, c:1}, homeCtrl.data);

module.exports = homeRouter;