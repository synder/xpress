/**
 * Created by synder on 16/6/21.
 */


var fs = require('../lib/fs');

fs.access('/usr', {r:true, w:true, x: false}, function (err) {
   console.log(err);
});