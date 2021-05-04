//In main, when we call require() of a folder, it automatically directs
//to the index.js file in that folder
module.exports = function() {
  require("./grammar-tool.js")();
  require("./drawing-tool.js")();
  require("./language-tool.js")();
}
