/**
 * Tells pivot which variant gets assigned to the user
 *
 * @param {String} feature
 * @param {Object} variants
 * @param {Object} user
 * @param {Function} done
 */
module.exports = function() {
  return function(feature, variants, user, done){
    /**
     * If the variant is a group, we can inspect the `user` object to check where they fall
     * If the variant is a weight, we can implement our own random assignment algorithm
     *
     * The callback expects the name of the variant chosen for the given user
     */
   
    // For this example we're just going to assign the first variant to everyone
    done(null, variants[0].value);
  };
};
