/**
 * Module dependencies
 */

module.exports = function(options) {
  if(!options) options = {};
  var cookieName = options.cookieName || "pivot-settings";

  return function(req) {
    var user;

    try {
      user = JSON.parse(req.cookies[cookieName]);
    }
    catch (e) {
      user = {};
    }
    
    return {
      get: function(name) {
        if(!name) return user;
        return user[name];
      },
      set: function(name, value) {
        user[name] = value;
        return this;
      },
      save: function(res) {
        res.cookie(cookieName, JSON.stringify(user));
      }
    };
  };
};
