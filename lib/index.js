import Promise from "bluebird";
import _ from "lodash";
require("babel-core/register");
require("babel-polyfill");

global.Promise = Promise;
global._ = _;
module.exports.product = require('./product');
