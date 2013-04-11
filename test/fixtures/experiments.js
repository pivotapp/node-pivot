/**
 * Module dependencies
 */
var pivot = require("../..")
  , assign = require("./assign")
  , lookup = require("./lookup");

module.exports = function(options) {

  options = options || {};

  /**
   * Expose experiments
   */
  var experiments = pivot();
   
  /**
   * Store the user's enabled features
   */
  experiments.serialize(options.serialize || function(features, req, res, next){
    res.set("X-Pivot", JSON.stringify(features));
    next();
  });
   
  /**
   * Get the enabled features for the user
   */
  experiments.deserialize(options.deserialize || function(req, res, next){
    next(null, {});
  });
   
  /**
   * Gives the user object to pivot
   */
  experiments.findUser(options.findUser || function(req, res, next){
    next(null, req.user);
  });
   
  experiments.lookup(options.lookup || lookup());
   
  /**
   * Tells pivot which variant gets assigned to the user
   *
   * @param {String} feature
   * @param {Object} variants
   * @param {Object} user
   * @param {Function} done
   */
  experiments.assign(options.assign || assign());

  return experiments;

};
