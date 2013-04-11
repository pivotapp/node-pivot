/**
 * Module dependencies
 */
var express = require("express")
  , experiments = require("./experiments");

/**
 * Expose app
 */
var app = module.exports = express();

/**
 * Features
 */
// Split test/AB test (defaults to [true, false])
experiments.feature("validate");
// Multi-variant
experiments.feature("loginButtonColor", ["red", "blue", "green", "yellow"]);

/**
 * Configure our app
 */
app.configure(function(){
  app.set("views", __dirname+"/views");
  app.set("view engine", "jade");

  app.use(express.favicon());
  app.use(express.cookieParser());
  app.use(experiments);
  app.use(app.router);
});

app.get("/", function(req, res, next){
  res.render("view");
});

app.get("/ad-hoc", function(req, res, next) {
  // We can do ad-hoc features
  res.feature("welcomeMessage", ["message1", "message2"], function(err) {
    if(err) return next(err);
    
    if(res.locals.features.validate) {
      // Our validate feature is turned on
    }
    else {
      // It's turned off
    }
    
    res.render("view");
  });
});
