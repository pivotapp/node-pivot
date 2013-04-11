var should = require("should")
  , express = require("express")
  , request = require("supertest")
  , pivot = require("./fixtures/experiments");

describe("Pivot Server", function() {

  var experiments, app;

  beforeEach(function() {
    experiments = pivot();
    app = express();
    app.use(experiments);
  });

  it("should setup a feature", function(done) {
    experiments.feature("testing123", ["test1","test2","test3"]);

    request(app)
      .get("/")
      .end(function(err, res) {
        if(err) return done(err);
        res.should.have.header('x-pivot');

        var features = JSON.parse(res.headers['x-pivot']);

        should.exist(features.testing123);
        features.testing123.should.eql("test1");
        
        done();
      });
  });

  it("should setup multiple feature", function(done) {
    experiments.feature("testing123", ["test1","test2","test3"]);
    experiments.feature("myFeature");

    request(app)
      .get("/")
      .end(function(err, res) {
        if(err) return done(err);
        res.should.have.header('x-pivot');

        var features = JSON.parse(res.headers['x-pivot']);

        should.exist(features.myFeature);
        features.myFeature.should.eql(false);
        
        done();
      });
  });

});
