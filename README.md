pivot [![Build Status](https://travis-ci.org/CamShaft/pivot.png?branch=master)](https://travis-ci.org/CamShaft/pivot)
=====

_pivot_ is a simple feature multi-variant and A/B testing framework for [node](http://nodejs.org) and [component](http://component.io).

It is designed to have a pluggable backend and provide a common interface to each testing strategy.

Installing
----------

### node

```sh
npm install --save pivot
```

### component

```sh
component install CamShaft/pivot
```

Lookup Strategies
--------

TODO

Assignment Strategies
--------

TODO

Guide
-----

Start by initializing pivot

```js
/**
 * Module dependencies
 */
var pivot = require("pivot");

var experiments = pivot();
```

You'll need to tell it about the following methods:

### lookup

This method looks up the variant settings in the backend. It is called any time
pivot encounters a new feature.

```js
experiments.lookup(function(name, variants, done){
  /**
   * We can do a few things here:
   *
   *   * Lookup our feature settings locally
   *   * If we dont have it, notify an admin control panel page
   *   * Log outdated features; either ones that should be integrated or ones that should be removed
   */

  var settings = []; // can come from anywhere: database, REST api, local json file, etc

  done(null, settings);
});
```

### assign

This method takes the settings from the last call and assigns them to a user.

```js
experiments.assign(function(name, settings, user, done){
  /**
   * If the variant is a group, we can inspect the `user` object to check where they fall
   * If the variant is a weight, we can implement our own random assignment algorithm
   *
   * The callback expects the name of the variant chosen for the given user
   */

  // For this example we're just going to assign the first variant to everyone
  done(null, settings[0]);
});
```

If you plan on using it paired with express/connect, you can also define the following.
Otherwise, pivot will serialize/deserialize using the `pivot` cookie and `req.user`.

### serialize
```js
experiments.serialize(function(features, req, res, next){
  // Save the features for the user
  next();
});
```

### deserialize
```js
experiments.deserialize(function(req, res, next){
  // Retrieve the features for the request
  var features = {}; // can come from anywhere i.e. cookies, session, database
  next(null, features);
});
```

### findUser
```js
experiments.findUser(function(req, res, next){
  // Give the user for the request to pivot
  next(null, req.user);
});
```

### feature
Once you have told pivot how to do things you can start adding features into the system:

```js
// Variants, be default, are [false, true]
experiments.feature("my-cool-test");

// You can also add multi-variant
experiments.feature("my-other-test", ["blue", "red", "green"]);
```

### variant
Now you can ask pivot to assign a variant to a user:

```js
var user = {}; // pull from your user info

experiments.variant("my-cool-test", user, function(err, variant){
  // do something based on the value of variant
})
```

`variant` is either `true` or `false` depending on how we implemented the `assign` method.

### handle
If you are using express/connect pivot comes with some batteries included:

```js
/**
 * Module dependencies
 */
var express = require("express")
  , pivot = require("pivot");

/**
 * Create our server and experiments
 */
var app = module.exports = express()
  , experiments = pivot();

/**
 * Add our experiment setup to express
 */
app.use(experiments);

/**
 * Configure pivot here with the required methods
 */
...

experiments.feature("landing-page", ["minimal", "fancy"]);

app.get("/", function(req, res, next){
  var view = res.locals.features["landing-page"]; // either "minimal" or "fancy"
  res.render(view);
});
```

`res.locals.features` is now populated with all of the enabled features for the
user.

Testing
-------

```js
npm install
npm test
```
