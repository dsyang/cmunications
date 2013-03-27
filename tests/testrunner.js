/*
Defaults:

    {
        // logging options
        log: {

            // log assertions overview
            assertions: true,

            // log expected and actual values for failed tests
            errors: true,

            // log tests overview
            tests: true,

            // log summary
            summary: true,

            // log global summary (all files)
            globalSummary: true,

            // log currently testing code file
            testing: true
        },

        // run test coverage tool
        coverage: false,

        // define dependencies, which are required then before code
        deps: null,

        // define namespace your code will be attached to on global['your namespace']
        namespace: null
    }
*/

var testrunner = require("qunit");
var dirname = __dirname;

testrunner.setup({
    "deps": __dirname + "/utils.js"
});

// using testrunner callback
testrunner.run({
    code: __dirname + "/../app.js",
    tests: __dirname + "/test-app.js"
}, function(err, report) {
    if(err) throw err;
});
