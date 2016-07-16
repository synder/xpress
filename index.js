/**
 * Created by synder on 16/4/23.
 */

const Xpress = require('./module').Xpress;
const Router = require('./module').Router;
const Controller = require('./module').Controller;
const Document = require('./module').Document;

const parser = require('./lib/parser');
const crypto = require('./lib/crypto');
const string = require('./lib/string');
const validate = require('./lib/validate');
const fs = require('./lib/fs');


module.exports = Xpress;
module.exports.Router = Router;
module.exports.Controller = Controller;
module.exports.Document = Document;


module.exports.fs = fs;
module.exports.crypto = crypto;
module.exports.parser = parser;
module.exports.string = string;
module.exports.validate = validate;