/**
 * Created by synder on 16/4/23.
 */

const Xpress = require('./server/Xpress');
const Router = require('./server/Router');

const parser = require('./lib/parser');
const string = require('./lib/string');
const validate = require('./lib/validate');

module.exports = Xpress;
module.exports.Router = Router;

module.exports.parser = parser;
module.exports.string = string;
module.exports.validate = validate;