var vm = require("vm");
var fs = require("fs");
exports.runUploadedModule = function(path, context) {
  var data = fs.readFileSync(path);
  vm.runInNewContext(data, context, path);
}