require("babel-register");

// require('babel/register') doesn't transpile the file it is called from.
// http://stackoverflow.com/a/29425761/1371351
require("./app");

// Log all unhandled rejections
process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging, throwing an error, or other logic here
});
