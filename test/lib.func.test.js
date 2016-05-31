/**
 * Created by synder on 16/5/31.
 */

var func = require('../lib/func');

console.log(func.dateFormat(Date.now()));
console.log(func.dateTimeFormat(Date.now(), '-', ':'));
console.log(func.timeFormat(Date.now(), ':'));