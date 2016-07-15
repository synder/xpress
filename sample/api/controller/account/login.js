/**
 * Created by synder on 16/7/15.
 */
/**
 * @author xpress
 * @date 16/1/10
 * @desc
 */

Controller.action(exports, 'login').post()
    .summary('用户登陆')
    .desc('用户通过用户名和密码登陆到账户')
    .validate({
        body: {
            username: {type: 'string', required: true, len: {gt: 2, lt: 20}, val: {like: ''}},
            password: {type: 'string', required: true, len: {gt: 2, lt: 20}}
        }
    })
    .handle( function(req, res, next){
        res.json({
            code: 1,
            msg: null,
            data: {
                version: 1.0
            }
        });
    });

Controller.action(exports, 'logout').post()
    .summary('用户登出')
    .desc('用户退出登陆')
    .handle( function(req, res, next){
        res.json({
            code: 1,
            msg: null,
            data: {
                version: 1.0
            }
        });
    });
