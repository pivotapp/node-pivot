function Feature(name, createfn) {
  this.config = {
    name: name,
    variants: [false, true]
  };

  this._createFn = createfn;
};

Feature.prototype.variants = function(variants) {
  this.config.variants = variants;
  return this;
};

Feature.prototype.wip = function() {
  this.config.wip = true;
  return this;
};

Feature.prototype.create = function(cb) {
  this._createFn(this, cb);
};

module.exports = Feature;
