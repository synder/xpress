/**
 * Created by synder on 16/7/15.
 */


Controller.action(exports, 'create').post()
    .summary('创建订单')
    .validate({
        param: {
            id: {type: 'number', required: true, val: {gt: 2, lt: 20}}
        },
        body: {
            name: {type: 'string', required: true, len: {gt: 2, lt: 20}, val: {like: ''}},
            price: {type: 'string', required: true, len: {gt: 2, lt: 20}},
            weight: {type: 'array',  required: false, len: {gte: 2, lte: 20}, val:{eq: [100, 98]}},
            height: {type: 'number', required: false, val: {gte: 0, lte: 100}},
            length: {type: 'number', required: false, val: {eq: 2}},
            date: {type: 'number', required: false, val: {neq: 10}}
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