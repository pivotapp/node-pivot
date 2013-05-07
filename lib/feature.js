function Feature(name, createfn) {
  this.config = {
    name: name,
    variants: [false, true],
    control: false,
    target: true,
    enabled: false,
    released: false
  };

  this._createFn = createfn;
};

Feature.prototype.variants = function(variants) {
  this.config.variants = variants;
  this.config.control = variants[0];
  this.config.target = variants[variants.length-1];
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
