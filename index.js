require("babel-register");

// require('babel/register') doesn't transpile the file it is called from.
// http://stackoverflow.com/a/29425761/1371351
require("./app")
