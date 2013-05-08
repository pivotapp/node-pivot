
exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

exports.safeParse = function (string) {
  try {
    return JSON.parse(string);
  }
  catch(e) {}
  return null;
}