/**
 * Module dependencies
 */
var debug = require("debug")("pivot:json");

module.exports = function(options) {

  var experiments = options.experiments
    , groups = options.groups;

  return function json(name, user) {
    debug("checking '"+name+"' in backend");
    var experiment = experiments[name];

    // If it's a simple switch just return it
    if(typeof experiment === "boolean") return experiment;

    debug("'"+name+"' not found. Calculating variance");
  };
};
