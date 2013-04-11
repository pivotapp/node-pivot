var should = require("should")
  , express = require("express")
  , request = require("supertest")
  , pivot = require("..")
  , assign = require("./fixtures/assign")
  , lookup = require("./fixtures/lookup");

describe("Pivot", function() {

  var experiments;

  beforeEach(function() {
    experiments = pivot();
    experiments.lookup(lookup());
    experiments.assign(assign());
  });

  it("should setup a feature", function(done) {
    experiments.feature("testing123", ["test1","test2","test3"]);

    experiments.variant("testing123", {}, function(err, variant) {
      if(err) return done(err);

      should.exist(variant);

      // Our fixture returns the first thing in the array
      variant.should.eql("test1");
      
      done();
    });
  });

  it("should setup a multiple feature", function(done) {
    experiments.feature("testing123", ["test1","test2","test3"]);
    experiments.feature("myFeature");

    experiments.variant("myFeature", {}, function(err, variant) {
      if(err) return done(err);

      should.exist(variant);

      // Our fixture returns the first thing in the array
      variant.should.eql(false);
      
      done();
    });
  });

});
