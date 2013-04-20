/**
 * Module dependencies
 */
require = require("require-component")(require);

var Batch = require("batch")
  , debug = require("debug")("pivot:core")
  , each = require("each")
  , find = require("find");

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
 * @param {Array|Function} variants
 * @param {Function} done
 * @return {Pivot}
 * @api public
 */
pivot.feature = function(name, variants, done) {
  var self = this;

  // Defaults
  if(typeof variants === "function" || typeof variants === "undefined") {
    done = variants;
    variants = [false, true];
  }
  done = done || noop;

  debug("notifying backend about feature '"+name+"' with variants:",variants);
  self.callbacks.lookup(name, variants, function(err) {
    if(err) return done(err);

    debug("saving feature '"+name+"'");
    self.features.push({name: name, variants: variants});

    done();
  });
  return this;
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
  var self = this;

  res.on("header", function() {
    debug("serializing features", res.locals.features);
    (self.callbacks.serialize || function(features, req, res, cb) {
      // Default to setting a cookie
      res.cookie("pivot", JSON.stringify(features));
      cb();
    })(res.locals.features, req, res, noop); // TODO How should we handle when errors occur?
  });

  var batch = new Batch;

  // Deserialize the current experiments for the user
  batch.push(function(done) {
    (self.callbacks.deserialize || function(req, res, cb) {
      // Default to getting a cookie
      cb(null, (req.cookies ? safeParse(req.cookies.pivot) : {}));
    })(req, res, done);
  });

  // Lookup the user
  batch.push(function(done) {
    (self.callbacks.findUser || function(req, res, cb) {
      // Default to req.user if not set
      cb(null, req.user);
    })(req, res, done);
  });

  batch.end(function(err, results) {
    if(err) return next(err);

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
    function assignFeature (name, variants, done) {
      done = done || noop;
      var user = results[1];
      return self._assignVariant(name, variants, user, function(err, variant) {
        if(err) return done(err);

        res.locals.features[name] = variant;
        debug("setting",name,"to",variant,"for user:",user);

        done(null, variant);
      });
    };

    /**
     * Assign the deserialized features to the request
     */
    debug("assigning deserialized features", results[0]);
    res.locals.features = results[0] || {};

    /**
     * Alias `assignFeature` for ad-hoc features and feature reading
     */
    res.feature = assignFeature;

    /**
     * Apply all of the application-wide features
     */
    var defaults = new Batch;

    debug("assigning application-wide features", self.features);
    each(self.features, function(feature) {
      defaults.push(function(done) {
        assignFeature(feature.name, feature.variants, done);
      });
    });

    defaults.end(function(err) {
      debug("done assigning features");
      next(err);
    });
  });
  return this;
};


/**
 * Lookup a feature variant for a user
 *
 * @param {String} name
 * @param {Object} user
 * @param {Function} done
 * @api public
 */
pivot.variant = function(name, user, done) {
  var variants = find(this.features, {name: name});

  if(!variants) return done(new Error("Could not find feature '"+name+"'"));

  return this._assignVariant(name, variants, user, done);
};

pivot.serialize = function(fn) {
  this.callbacks.serialize = fn;
  return this;
};

pivot.deserialize = function(fn) {
  this.callbacks.deserialize = fn;
  return this;
};

pivot.findUser = function(fn) {
  this.callbacks.findUser = fn;
  return this;
};

pivot.lookup = function(fn) {
  this.callbacks.lookup = fn;
  return this;
};

pivot.assign = function(fn) {
  this.callbacks.assign = fn;
  return this;
};

/**
 * Assign a feature variant to a user
 *
 * @param {String} name
 * @param {Array} variants
 * @param {Object} user
 * @param {Function} done
 * @api private
 */
pivot._assignVariant = function(name, variants, user, done) {
  var self = this;
  done = done || noop;

  debug("looking up feature '"+name+"' with variants:",variants," for user:",user);
  self.callbacks.lookup(name, variants, function(err, featureSettings) {
    if(err) return done(err);

    debug("got settings for feature '"+name+"':", featureSettings);

    self.callbacks.assign(name, featureSettings, user, done);
  });
  return this;
};

function safeParse (string) {
  try {
    return JSON.parse(string);
  }
  catch(e) {}
  return null;
}