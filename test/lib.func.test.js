/**
 * Created by synder on 16/5/31.
 */

var func = require('../lib/func');

console.log(func.pad('12222', 10, '0', 'left'));
console.log(func.clean('  122  22  '));
console.log(func.lines('122\r\n2'));
console.log(func.truncate('122212313213132132', 13, '...'));
console.log(func.capitalize('adsccdsdADSW', true));
console.log(func.upperCase('adsccdsdADSW'));
console.log(func.lowerCase('adsccdsdADSW'));
console.log(func.chineseCurrency('92102600401.001', true));
console.log(func.currency(242605401.001, '$'));
console.log(func.bankCard('233546454633344332'));
console.log(func.percentage(0.5));
console.log(func.number(0.5, 3));
console.log(func.versionPath('/name', 10));
console.log(func.date(new Date(), '-'));
console.log(func.time(new Date(), ':'));
console.log(func.dateTime(new Date(), '-', ':'));
console.log(func.urlFormat('/home', {name:1}, 'http', '127.0.0.1'));