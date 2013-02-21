/**
 * Module dependencies
 */
var pivot = require("./pivot");

module.exports = function(options) {
  var instance = pivot(options);

  return function pivot(req, res, next) {
    req.feature = res.locals.feature = instance(req, res);
    next();
  };
};
