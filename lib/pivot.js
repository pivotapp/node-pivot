/**
 * Module dependencies
 */
var proto = require('./proto');

exports = module.exports = createExperiments;

/**
 * Expose the prototype.
 */

exports.proto = proto;

function createExperiments() {
  function pivot(req, res, next){ pivot.handle(req, res, next) };
  merge(pivot, proto);
  for (var i = 0; i < arguments.length; ++i) {
    pivot.feature(arguments[i]);
  }
  return pivot;
}

function merge(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};
