var express = require("express");
var mongo = require('mongodb');
var utils = require('./js/utils.js');
var app = express();
var MongoClient = mongo.MongoClient;
var connectionURI = process.env.MONGOLAB_URI ||
    "mongodb://localhost:27017/myNotebook";
var port = process.env.PORT || 8889;
var db;

app.use(express.bodyParser());


app.get("/", function(request, response) {
    var data = {};
    defaultAction(request, response, data);
})


function defaultAction(request, response) {
    response.send({"hello": "world!"});
}

module.exports = utils.exportFunctions([defaultAction]);

// Only runs if this file is passed into node "node app.js"
if(__filename == process.argv[1]) {
    MongoClient.connect(connectionURI, dbConnectCallback);

    function dbConnectCallback(err, database) {
        if(err) {
            console.log("ERROR opening database:  "+err);
        } else {
            console.log("Database connection established.");
            db = database;
            app.listen(port);
            console.log("Created server on port: "+port);
        }
    }

}
