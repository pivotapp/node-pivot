/**
 * Module dependencies
 */
var async = require("async")
  , debug = require("debug")("pivot:core");

// protoype

var pivot = module.exports = {callbacks: {}, features: []};

// noop

function noop () {}

pivot.feature = function(name, variants, done) {
  if(typeof variants === "function") {
    done = variants;
    variants = [true, false];
  }
  if(typeof variants === "undefined" && typeof done === "undefined") {
    variants = [true, false];
    done = noop;
  }

  var self = this;
  debug("looking up '"+name+"'");
  this.callbacks.lookup(name, variants, function(err) {
    if(err) return debug("error while looking up '"+name+"'", err) && done(err);

    debug("variants for '"+name+"'", variants);
    self.features.push({name: name, variants: variants});

    (done || noop)();
  });
}

pivot.handle = function(req, res, next) {
  var self = this;

  res.features = {};

  res.on("header", function() {
    // TODO How should we handle when errors occur?
    self.callbacks.serialize(res.features, res, res, noop);
  });

  async.waterfall([
    function(done) {
      async.parallel([
        async.apply(self.callbacks.deserialize, req, res),
        async.apply(self.callbacks.findUser, req, res)
      ], done);
    },
    function(results, cb) {
      // Assign the deserialized features to the request
      res.features = res.locals.features = results[0];

      debug("parsed features", res.features);

      // Alias feature for ad-hoc features
      res.feature = function feature(name, variants, done) {
        return self.checkFeature(name, variants, results[1], function(err, variant) {
          if(err) return done(err);
          res.features[name] = variant;

          (done || noop)();
        });
      };

      // TODO how do we handle the existing features for the user
      // Do we:
      // * just call them all again? (why would we need to serialize at that point)
      // * ignore them (how will we know if they change?)

      // Apply all of the default features
      async.each(self.features, function(feature, done) {
        res.feature(feature.name, feature.variants, done);
      }, cb);
    }
  ], next);
};

pivot.checkFeature = function(name, variants, user, done) {
  var self = this;

  debug("checking feature", name);

  this.callbacks.lookup(name, variants, function(err, featureSettings) {
    if(err) return done(err);

    debug("got weighting for", name, featureSettings);

    self.callbacks.assign(name, featureSettings, user, done);
  });
}

pivot.serialize = function(fn) {
  debug("setting serialize function");
  this.callbacks.serialize = fn;
};

pivot.deserialize = function(fn) {
  debug("setting deserialize function");
  this.callbacks.deserialize = fn;
};

pivot.findUser = function(fn) {
  debug("setting findUser function");
  this.callbacks.findUser = fn;
};

pivot.lookup = function(fn) {
  debug("setting lookup function");
  this.callbacks.lookup = fn;
};

pivot.assign = function(fn) {
  debug("setting assign function");
  this.callbacks.assign = fn;
};
