/**
 * Module dependencies
 */
require = require("require-component")(require);

var Batch = require("batch")
  , Feature = require("./feature")
  , debug = require("debug")("pivot:core")
  , each = require("each")
  , safeParse = require("./util").safeParse;

/**
 * Expose the protoype
 */
var pivot = exports = module.exports;

/**
 * Noop
 */
function noop () {}

/**
 * Add an application-wide feature
 *
 * @param {String} name
 * @return {Pivot}
 * @api public
 */
pivot.feature = function(name) {
  var self = this;

  return new Feature(name, function(feature, done) {
    var config = feature.config;
    done = done || noop;

    debug("notifying backend about feature '"+name+"' with variants:",config.variants);
    self.strategy.create(config, done);
  });
};

/**
 * Handle a request and assign the variants to the user
 *
 * @param {HTTPRequest} req
 * @param {HTTPResponse} res
 * @param {Function} next
 * @return {Pivot}
 * @api public
 */
pivot.handle = function(req, res, next) {
  debug("handle request");

  var self = this
    , features = {};

  var batch = new Batch;

  // Deserialize the current experiments for the user
  batch.push(function(done) {
    debug("deserializing features");
    (self.callbacks.deserialize || self.strategy.deserialize || function(req, res, cb) {
      // Default to getting a cookie
      cb(null, (req.cookies ? safeParse(req.cookies.pivot) : {}));
    })(req, res, done);
  });

  // Lookup the user
  batch.push(function(done) {
    debug("finding user");
    (self.callbacks.user || self.strategy.user || function(req, res, cb) {
      // Default to req.user if not set
      cb(null, req.user);
    })(req, res, done);
  });

  batch.end(function(err, results) {
    if(err) return next(err);

    /**
     * Assign the deserialized features to the request
     */
    debug("assigning deserialized features", results[0]);
    if (!res.locals.features) res.locals.features = {};
    each(results[0], function(key, value) {
      features[key] = res.locals.features[key] = value;
    });

    /**
     * Shortcut for reading experiments
     */
    req.feature = res.locals.feature = function(name) {
      return res.locals.features[name];
    };

    /**
     * Set a feature variant for the request
     *
     * There's one of four things that can happen in this flow:
     *
     *   1. User does not have that feature set and we assign it a variant
     *   2. User has the variant assigned and the feature settings haven't changed
     *   3. User has the variant assigned but the features settings have been updated and need to be reapplied
     *   4. User has set the variant in browser (i.e. with cookies) and what we would assign is different
     *
     * The current implementation supports 1, 2 and 3, which are the easy things
     * to do. We'll need to figure out how to do 4.
     */
    debug("assigning using strategy",self.strategy.name);
    var user = results[1];
    self.strategy.assign(user, features, function(err, variants) {
      if (err) return next(err);

      debug("got back ",variants);

      each(variants, function(name, value) {
        debug("setting",name,"to",value,"for user:",user);
        features[name] = res.locals.features[name] = value;
      });

      // Install specific strategy functions onto the req/res
      if(self.strategy.install) self.strategy.install(req, res, user, features);

      debug("serializing features", features);
      (self.callbacks.serialize || self.strategy.serialize || function(features, req, res, cb) {
        // Default to setting a cookie
        res.cookie("pivot", JSON.stringify(features));
        cb();
      })(features, req, res, next);
    });
  });
  return this;
};


/**
 * Assign the variants to the user
 *
 * @param {String} name
 * @param {Object} user
 * @param {Function} done
 * @api public
 */
pivot.assign = function(user, features, done) {
  features = features || noop;
  if(typeof features === "function") {
    done = features;
    features = {};
  }

  self.strategy.assign(user, features, done);
  return this;
};

pivot.serialize = function(fn) {
  this.callbacks.serialize = fn;
  return this;
};

pivot.deserialize = function(fn) {
  this.callbacks.deserialize = fn;
  return this;
};

pivot.user = function(fn) {
  this.callbacks.user = fn;
  return this;
};

pivot.use = function(strategy) {
  this.strategy = strategy;
  return this;
};
