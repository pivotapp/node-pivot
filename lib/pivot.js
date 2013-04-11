/**
 * Module dependencies
 */
var proto = require("./proto");

module.exports = exports = createExperiments;

/**
 * Expose the prototype.
 */

exports.proto = proto;

/**
 * Create a new set of experiments
 */
function createExperiments() {
  function pivot(req, res, next){ pivot.handle(req, res, next) };

  merge(pivot, proto);

  // Setup the app callbacks
  pivot.callbacks = {};

  // Setup the features
  pivot.features = [];

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
