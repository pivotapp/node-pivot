/**
 * Module dependencies
 */
var pivot = require("..");
 
/**
 * Expose experiments
 */
var experiments = module.exports = pivot();
 
/**
 * Store the user's enabled features
 */
experiments.serialize(function(features, req, res, next){
  res.cookie("pivot", JSON.stringify(features));
  next();
});
 
/**
 * Get the enabled features for the user
 */
experiments.deserialize(function(req, res, next){
  next(null, JSON.parse(req.cookies.pivot || "{}"));
});
 
/**
 * Gives the user object to pivot
 */
experiments.findUser(function(req, res, next){
  next(null, req.user);
});
 
/**
 * Retrieve feature settings from our backend
 * 
 * This can be anything:
 * * JSON file
 * * API Call (i.e. Product owner service)
 * * DB Call
 * 
 * These should really be separate modules so you can have pluggable backends to do this stuff
 */
experiments.lookup(function(){
  var features = {};
  
  /**
   * @param {String} name
   * @param {Array[String]} variants
   * @param {Function} done
   */
  return function(name, variants, done){
    /**
     * We can do a few things here:
     * * Lookup our feature settings locally
     * * If we dont have it, notify the admin control panel page
     * * Log outdated features; either ones that should be integrated or ones that should be removed
     */
   
    // In this case we'll just look it up locally
    
    // This should also look up if the variants have changed
    if(features[name]) {
      done(null, features[name]);
    }
    else {
      var feature = features[name] = {};

      variants.forEach(function(variant) {
        // Give it an equal split by default (expects 0 to 1)
        feature[variant] = 1/variants.length;
        
        // We could also give it a list of groups
        //   feature[variant] = ["beta", "admins"];
        
        // or just a single group
        //   feature[variant] = "beta";
      });
      
      done(null, features[name]);
    }
  };
}());

/**
 * Tells pivot which variant gets assigned to the user
 *
 * @param {String} feature
 * @param {Object} variants
 * @param {Object} user
 * @param {Function} done
 */
experiments.assign(function(feature, variants, user, done){
  /**
   * If the variant is a group, we can inspect the `user` object to check where they fall
   * If the variant is a weight, we can implement our own random assignment algorithm
   *
   * The callback expects the name of the variant chosen for the given user
   */
 
  // For this example we're just going to assign the first variant to everyone
  done(null, Object.keys(variants)[0]);
});