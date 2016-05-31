/**
 * Created by synder on 16/5/31.
 */

var Requester = require('../../../index').Requester;

module.exports = new Requester({
    protocol: 'http',
    host: '127.0.0.1',
    port: 8003,
    appKey: '1',
    appSecret: '2',
    timeout: 20000
});