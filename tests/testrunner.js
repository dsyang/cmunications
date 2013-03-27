var testrunner = require("qunit"); //the testing framework
var dirname = __dirname; // qunit requires full pathnames

testrunner.setup({
    "deps": dirname + "/utils.js" // MockRequest and MockResponse
});


testrunner.run({
    code: dirname + "/../app.js", // The code to test
    tests:dirname + "/test-app.js" // The testing code
}, function(err, report) {
    if(err) throw err;
});
