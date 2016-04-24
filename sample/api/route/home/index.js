/**
 * @author synder
 * @date 16/1/10
 * @desc
 */
var Router = require('xpress').Router;
var homeRouter = new Router();

var homeCtrl = require('../../controller/home/index');


homeRouter.get('/', homeCtrl.index);
homeRouter.get('/data', {v:1, c:1}, homeCtrl.data);



module.exports = homeRouter;