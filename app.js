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
//hook up routes. This can potentially be moved into another file
app.get("/", function(request, response) {
    var data = {};
    defaultAction(request, response, data);
})

app.get("/:name", function(request, response) {
    var data = {"name": request.params.name}
    nameAction(request, response, data);
});

app.post("/post", function(request, response) {
    var data = {"stuff": request.body.stuff}
    postAction(request, response, data);
});


//All functionality goes in here. These can also be moved into another file
// Be sure to export any function you write or else it can't be tested
function defaultAction(request, response) {
    response.send({"hello": "world!"});
}

function nameAction(request, response, d) {
    if(d.name === "Anand") {
        response.send("ANAND IS HERE!!!");
    }
    response.send({"hello": d.name});
}

function postAction(request, response, d) {
    var data = request.body.stuff;
    if(data === d.stuff) {
        response.send({"success": true});
    } else {
        response.send({"success": false});
    }
}

//functions exported so we can test them
module.exports = utils.exportFunctions([defaultAction, nameAction, postAction]);




// Only runs if this file is passed into node like "node app.js"
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
