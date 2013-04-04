//This file holds utility functions that might come in handy

//This is a simple function that creates a hash of {"functionName": function}
// for the `fns` array passed in.
module.exports.exportFunctions = function (fns) {
    var obj = {};

    fns.forEach(function (f) {
        obj[f.name] = f;
    });
    return obj;
}
