module.exports.exportFunctions = function (fns) {
    var obj = {};

    fns.forEach(function (f) {
        obj[f.name] = f;
    });
    return obj;
}
