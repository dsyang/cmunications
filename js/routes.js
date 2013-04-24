 // This file hold all the routes for the app, describing our api endpoints

//`applicationCode.js` holds all the logic for our application.
var async = require("async");
module.exports = function(app, db) {
    var code = new require("./applicationCode.js").Application(db);


    app.post('/search', function(request, response) {
        var data = { text: request.body.text,
                     start: request.body.startDate,
                     end: request.body.endDate
                   };
        code.searchAction(request, response, data);
    });

    app.post('/subscribe',
//             passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
             function(request, response) {
                 var data = {orgids: request.body.orgids,
                             tags: request.body.tags
                            };
                 code.subscribeAction(request, response, data);
             });


    app.get('/events/:id/details/', function(request, response) {
        var data = {event_id: request.params.id};
        code.eventDetailAction(request, response, data)
    });

    app.get('/events/all/', function(request, response) {
        var data = {};
        code.listEventsAction(request, response, data);
    });
    app.post('/events/:id/star/',
//             passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
             function(request, response) {
                 var data = {event_id: request.params.id};
                 code.starEventAction(request, response, data)
             });

    app.get('/events/starred',
//            passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
            function(request, response) {
                var data = {};
                code.listStarredEventsAction(request, response, data);
            });

    app.get('/myevents',
//            passport.authenticate('local', { failureRedirect: '/auth/login' }),
            function(request, response) {
                var data = {};
                code.listOrgEventsAction(request, response, data);
            });

    app.post('/events/create',
//             passport.authenticate('local', { failureRedirect: '/auth/login' }),
             function(request, response) {
                 var data = { event: request.body.event };
                 code.createEventAction(request, response, data);
             });
    app.put('/events/:id/edit',
//             passport.authenticate('local', { failureRedirect: '/auth/login' }),
             function(request, response) {
                 var data = { event: request.body.event,
                              event_id: request.params.id
                            };
                 code.editEventAction(request, response, data);
             });


    app.get('/orgs/list', function(request, response) {
        var data = {};
        code.listOrganizationAction(request, response, data);
    });
    app.get('/tags/list', function(request, response) {
        var data = {};
        code.listTagsAction(request, response, data);
    });

    app.post( '/auth/login',
/*              passport.authenticate('local', {failureRedirect: '/auth/fail',
                                              failureFlash: true,
                                              successRedirect: '/index.html'
                                             }),
*/              function(request, response) {
                  var data = {};
                  code.loginAction(request, response, data);
    });

    app.get('/auth/facebook', /*passport.authenticate('facebook'),*/ function() {
        //This callback is never called as we're redirected to facebook.
        return;
    });
    app.get(
        '/auth/facebook/callback',
//        passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
        function(request, response) {
            var data = {};
            code.facebookLoginAction(request, response, data);
        }
    );
    app.post('/auth/create', function(request, response) {
        var data = {name: request.body.name,
                    password: request.body.password,
                    description: request.body.description
                   };
        code.organizationCreateAction(request, response, data);
    });

    // app.get("/", function(request, response) {
    //     var data = {};
    //     code.defaultAction(request, response, data);
    // });

    // app.get('/auth/organization', function(request, response) {
    //     var data = {};
    //     code.organizationLoginAction(request, response, data);
    // });

    // app.post(
    //     '/auth/organization',
    //     passport.authenticate('local', { failureRedirect: '/' }),
    //     function(request, response) {
    //         response.send({"hi" : request.user});
    //     });

    //app.get("/:name", function(request, response) {
//        var data = {"name": request.params.name}
//        code.nameAction(request, response, data);
//    });

    app.post("/post", function(request, response) {
        var data = {"stuff": request.body.stuff}
        code.postAction(request, response, data);
    });

    // This is for serving files in the static directory
    app.get("/static/:staticFilename", function (request, response) {
        response.sendfile("static/desktop/" + request.params.staticFilename);
    });

    app.get("/populatedb", function (request, response) {
        var database = db;
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
                                   response.send({results: results,
                                                  event: r});
                               });
                           });
                       });




    });

    return app;
}
