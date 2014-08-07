var silent = true;

var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");

var app = express();
var root = __dirname + "/public";


// --------------------------------------------------------------------
// SET UP EXPRESS
// --------------------------------------------------------------------

// Parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Simple logger
app.use(function(req, res, next){
  console.log("%s %s", req.method, req.url);
  console.log(req.body);
  next();
});

// Error handler
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

// Serve static files from directory
app.use(express.static(root));

// Open server on specified port
if (!silent) console.log("Starting Express server");
app.listen(process.env.PORT || 5001);


// Capture uncaught errors
process.on("uncaughtException", function(err) {
  console.log(err);
});