/**
 * Created by synder on 16/6/21.
 */


var fs = require('../lib/fs');

fs.save('./name.txt', "name", function (err) {
    console.error(err);
});