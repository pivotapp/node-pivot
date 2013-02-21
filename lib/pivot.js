/**
 * Module dependencies
 */

module.exports = function(options) {
  var backend = options.backend;
  
  return function instance(req, res) {

    var user = options.user(req);

    res.on("header", function() {
      user.save(res);
    });

    return function feature(name, defaultValue) {
      // Check the experiment for the user
      var experiment = user.get(name);

      // It's set for the current user
      if (typeof experiment !== "undefined") return experiment;

      // Get the experiment from the backend
      experiment = backend(name, user);

      // If there is no feature, return the defaultValue or true
      if(typeof experiment === "undefined") {
        return typeof defaultValue === "undefined" ? true : defaultValue;
      }

      // Set the experiment for the user and return the result
      user.set(name, experiment);

      return experiment;
    };
  };
};
