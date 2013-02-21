/**
 * Module dependencies
 */
var express = require("express")
  , experiments = require("./experiments")
  , pivot = require("..")
  , pivotCookie = require("../user/cookie")
  , pivotJson = require("../backend/json");

var app = module.exports = express();

app.configure(function() {
  app.use(express.cookieParser());
  app.use(pivot({
    user: pivotCookie(),
    backend: pivotJson(experiments)
  }));
});

app.get("/", function(req, res) {
  res.send(req.feature("test"));
});
