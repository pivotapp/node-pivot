/**
 * Module dependencies
 */
var proto = require("./proto")
  , merge = require("./util").merge;

module.exports = exports = createExperiments;

/**
 * Expose the prototype.
 */

exports.proto = proto;

/**
 * Create a new set of experiments
 */
function createExperiment(strategy) {
  function pivot(req, res, next){ pivot.handle(req, res, next) };

  merge(pivot, proto);

  // Save the experiment strategy
  pivot.strategy = strategy;

  return pivot;
}
