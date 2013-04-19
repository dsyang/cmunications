var mongo = require("mongodb");
var async = require("async");

var connectionURI = process.env.MONGOLAB_URI ||
    "mongodb://localhost:27017/cmunications";


mongo.MongoClient.connect(connectionURI, dbConnectCallback);

function dbConnectCallback(err, database) {
    if(err) {
        console.log("ERROR opening database:  "+err);
    } else {
        console.log("Database connection established. Starting app");

        //`app`, `passport`, and `database` are needed to initialize routes
        // so we case attach routes to the app, declare which ones require
        // authentication, and interact with the database.

        testUser = {
            name: "Test User",
            password: "237",
            savedEvents: [],
            tags: [],
            orgs: [],
            subscriptions: [],
            notifications: []
        };

        testOrg = {
            name: "Test Org",
            password: "237",
            description: "Just another Organization",
            events: [],
            subscribers: [],
        };

        testTag = {
            name: "Test Tag",
            events: [],
            subscribers: []
        };

        async.parallel([
            function(callback) {
                database.collection("users", function(err, col) {
                    if(err) throw err;
                    col.insert(testUser, callback);
                });
            },
            function(callback) {
                database.collection("organizations", function(err, col) {
                    if(err) throw err;
                    col.insert(testOrg, callback);
                });
            },
            function(callback) {
                database.collection("tags", function(err, col) {
                    if(err) throw err;
                    col.insert(testTag, callback);
                });
            }
        ],
                       function (err, results) {
                           if(err) throw err;
                           testEvent = {
                               name: "Test Event",
                               location: "Location",
                               description: "Something cool",
                               timeStart: Date(2013,3,20,10,30),
                               timeEnd: Date(2013, 3, 21, 10, 30),
                               tags: [results[2][0]._id],
                               followers: [results[0][0]._id],
                               hostOrg: results[1][0]._id
                           };
                           database.collection("events", function(err, col) {
                               if(err) throw err;
                               col.insert(testEvent, function(e, r) {
                                   if(e) throw e;
                                   console.log(results);
                                   console.log(r);
                               });
                           });
                       });



    }
}
