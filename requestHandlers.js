// functions that will be executed when 
// typeoff handle[pathname] === a function in requestHandlers.
// the handle and function are discribed in index.js

var fs = require('fs'),
server = require('./server');

function sendInterface(response) {
  console.log("Request handler 'BacterioPhone' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  //var html = fs.readFileSync(__dirname + "/pages/interface.html")
  var html = fs.readFileSync(__dirname + "/pages/index.html")
  response.end(html);
}

exports.sendInterface = sendInterface;
