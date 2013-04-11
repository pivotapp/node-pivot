
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
module.exports = function(){
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
      var feature = features[name] = [];
      variants.forEach(function(variant) {
        // Give it an equal weight by default (expects 0 to 1)
        feature.push({value: variant, weight: 1/variants.length});
        
        // We could also give it a list of groups
        //   feature[variant] = ["beta", "admins"];
        
        // or just a single group
        //   feature[variant] = "beta";
      });
      
      done(null, feature);
    }
  };
};
