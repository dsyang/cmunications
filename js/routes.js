// This file hold all the routes for the app, describing our api endpoints

//`applicationCode.js` holds all the logic for our application.
var async = require("async");

function success(name, obj) {
    var res =  {'success': true};
    res[name] = obj;
    return res;
}

function fail(message) {
    return {'success': false,
            'message': message};
}


module.exports = function(app, db, Auth) {
    var code = new require("./applicationCode.js").Application(db);


    app.post('/events/search', function(request, response) {
        var data = { text: request.body.text,
                     startDate: request.body.startDate,
                     endDate: request.body.endDate
                   };
        code.searchAction(request, response, data);
    });


    app.post('/subscriptions/search', function(request, response) {
        var data = { text: request.body.text};
        code.searchSubscriptionsAction(request, response, data);
    });

    app.post('/subscribe',
             function(request, response) {
                 var data = {orgids: request.body.orgids,
                             tags: request.body.tags
                            };
                 code.subscribeAction(request, response, data);
             });

    app.post('/unsubscribe',
             function(request, response) {
                 var data = {orgids: request.body.orgids,
                             tags: request.body.tags
                            };
                 code.unsubscribeAction(request, response, data);
             });             
             
    app.post('/notifications/clear', function(request, response) {
        Auth.checkLogin(request, response, function(err) {
            if(err) {
                response.send(fail("not logged in"));
            } else {
                Auth.getAccount(request, function(err, account) {
                    if(err) {
                        response.send(fail("cannot get account"));
                    }
                    if(account.accountType !== "users") {
                        response.send(fail("not a user account"));
                    }
                    var data = {notification: request.body.notification,
                                account: account
                               };
                    code.clearNotificationAction(request, response, data);
                });
            }
        });
    });

    app.get('/events/:id/details/', function(request, response) {
        var data = {event_id: request.params.id};
        code.eventDetailAction(request, response, data)
    });

    app.get('/events/all/', function(request, response) {
        var data = {};
        code.listEventsAction(request, response, data);
    });

    app.post('/events/:id/star/', function(request, response) {
        Auth.checkLogin(request, response, function(err) {
            if(err) {
                response.send(fail("not logged in"));
            } else {
                Auth.getAccount(request, function(err, account) {
                    if(err) {
                        response.send(fail("cannot get account"))
                    } else {
                        var data = { event_id: request.params.id,
                                     user: account };
                        console.log(data);
                        code.starEventAction(request, response, data);
                    }
                });
            }
        });
    });

    app.post('/events/:id/unstar/', function(request, response) {
        Auth.checkLogin(request, response, function(err) {
            if(err) {
                response.send(fail("not logged in"));
            } else {
                Auth.getAccount(request, function(err, account) {
                    if(err) {
                        response.send(fail("cannot get account"))
                    } else {
                        var data = { event_id: request.params.id,
                                     user: account };
                        code.unstarEventAction(request, response, data);
                    }
                });
            }
        });
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

    app.post('/events/create', function(request, response) {
        Auth.checkLogin(request, response, function(err) {
            if(err) {
                response.send(fail("not logged in"));
            } else {
                var data = { event: request.body.event };
                code.createEventAction(request, response, data);
            }
        });
    });
    app.put('/events/:id/edit', function(request, response) {
        Auth.checkLogin(request, response, function(err) {
            if(err) {
                response.send(fail("not logged in"));
            } else {
                var event = request.body.event;
                console.log(event);
                if(request.session.username === event.hostOrg) {
                    var data = { event: event,
                                 event_id: request.params.id
                               };
                    code.editEventAction(request, response, data);
                } else {
                    response.send(fail("no access"));
                }
            }
        });
    });

    app.get('/orgs/list', function(request, response) {
        var data = {};
        code.listOrganizationAction(request, response, data);
    });
    app.get('/tags/list', function(request, response) {
        var data = {};
        code.listTagsAction(request, response, data);
    });

    app.post( '/auth/login', function(request, response) {
        Auth.login(request, response, function(err, account) {
            if(err) response.send({success: false, message: err});
            else response.send({success: true,
                                account: account});
        });
    });
    app.get('/auth/refresh', function(request, response) {
        Auth.checkLogin(request, response, function(err) {
            if(err) {
                response.send({success: false, message: "not logged in"});
            } else {
                Auth.getAccount(request, function(err, account) {
                    if(err) {
                        response.send({success: false, message: "cannot find account"});
                    } else {
                        response.clearCookie('account');
                        response.cookie('account',
                                        JSON.stringify(account),
                                        { maxAge: 900000 });
                        response.send({success: true});
                    }
                });
            }
        });
    });

    app.post( '/auth/register', function(request, response) {
        Auth.register(request,  function(err, account) {
            if(err) response.send({success: false, message: err});
            else response.send({success: true,
                                account: account});
        }, 'users');
    });

    app.post( '/auth/logout', function(request, response) {
        Auth.logout(request, response);
        response.send({success:true});
    });
    /*    app.get('/auth/facebook', /*passport.authenticate('facebook'), function() {
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
    );*/
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


    app.get("/populatedb2", function (request, response) {
        var database = db;
        var scope = this;
        var index = 0;
        var long_dummy_text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';

        var user1 = ['Mochi', '123'];
        var user2 = ['Shikha', '123'];
        var user3 = ['Dan Yang', '123'];

        var org1 = ['Mayur Sasa', 'abc', "Indian haven on campus"];
        var org2 = ['Activities Board', 'abc', "You know what they say about people with big budgets..."];
        var org3 = ['Taiwanese Student Association', 'abc', "Better than Asian Student Association"];
        var org4 = ['Test', 'test', "A test organization"];

        var event1 = ['Samosa Sale', 'Doherty Hall', 'Selling samosas',  new Date(2013, 4, 30, 12, 0, 0, 0), new Date(2013, 4, 30, 16, 0, 0, 0)];
        var event2 = ['Activities Board GBM', 'Doherty Hall', 'Everybody Come', new Date(2013, 5, 1, 1, 30, 0, 0), new Date(2013, 5, 1, 2, 30, 0, 0)];
        var event3 = ['TSA Club Party', 'Diesel', 'Best club party of the year', new Date(2013, 5, 2, 13, 0, 0, 0), new Date(2013, 5, 2, 15, 0, 0, 0)];
        var event4 = ['ASA Club Party', 'Static', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                      new Date(2013, 5, 3, 12, 0, 0, 0), new Date(2013, 5, 3, 16, 0, 0, 0)];
        //lupe's first
        var event5 = ['Lupe Fiasco', 'The Cut', 'The Show must go on.', new Date(2013, 4, 28, 1, 30, 0, 0), new Date(2013, 4, 28, 2, 30, 0, 0)];
        var event6 = ['That one lecture', 'DH 2210', long_dummy_text, new Date(2013, 5, 5, 13, 0, 0, 0), new Date(2013, 5, 5, 14, 0, 0, 0)];
        var event7 = ['Final Exam relaxation', 'GHC 7', 'Massages',  new Date(2013, 5, 5, 20, 0, 0, 0), new Date(2013, 5, 5, 22, 0, 0, 0)];
        var event8 = ['SDC primal scream', 'The Cut', long_dummy_text, new Date(2013, 5, 6, 1, 30, 0, 0), new Date(2013, 5, 6, 2, 30, 0, 0)];
        var event9 = ['Tepper Spirit Day', 'Merson Courtyard', 'All of the free hotdogs.', new Date(2013, 5, 7, 13, 0, 0, 0), new Date(2013, 5, 7, 20, 0, 0, 0)];
        var event10 = ['#riPHI', 'Panther Hollow Inn', 'Saying goodbye to an era',  new Date(2013, 5, 8, 12, 0, 0, 0), new Date(2013, 5, 8, 16, 0, 0, 0)];
        var event11 = ['Bond Movie Marathon', 'McConomy', 'For your eyes only', new Date(2013, 5, 9, 1, 30, 0, 0), new Date(2013, 5, 9, 2, 30, 0, 0)];
        var event12 = ['Free Food', 'GHC 6', long_dummy_text, new Date(2013, 5, 10, 10, 0, 0, 0), new Date(2013, 5, 10, 12, 0, 0, 0)];
        var event13 = ['University Lecture Series', 'McConomy', 'Obama is coming!',  new Date(2013, 5, 11, 12, 0, 0, 0), new Date(2013, 5, 11, 16, 0, 0, 0)];
        var event14 = ['Shot for Shot', 'Doherty Hall', 'The best movie festival ever', new Date(2013, 5, 12, 1, 30, 0, 0), new Date(2013, 5, 12, 2, 30, 0, 0)];
        var event15 = ['Reading Day Fun', 'Everywhere', 'Best fun you will ever have during finals week.', new Date(2013, 5, 22, 13, 0, 0, 0), new Date(2013, 5, 23, 12, 0, 0, 0)];

        var tag1 = ['party'];
        var tag2 = ['food'];

        // Org1 corresponds to event1 and so on. Change this by changing assignHostOrgIds below.
        var users = [user1, user2, user3];
        var orgs = [org4, org1, org2, org3];
        var events = [event1, event2, event3, event4,
                      event5, event6, event7, event8,
                      event9, event10, event11, event12,
                      event13, event14, event15];
        var tags = [tag1, tag2];

        // Check that the database did what we want.
        var callback = function( error, result ){
            console.log("Return the list of events.");

            if(error){throw error;}
            code.listEventsAction(request, response, undefined);
        }

        function addUsers(err, result){
            if(err) {throw err;}
            console.log("Add users.");

            if(index === users.length){
                callback();
            }
            else{
                var cur = users[index];
                console.log("Index: " + index + "Curr: " + cur);
                index = index + 1;
                var password = Auth.hashPassword(cur[1]);
                code.createUser(cur[0], password, addUsers);
            }
        }

        function addEvents(){
            console.log("Add Events.");

            if(index === events.length){
                index = 0;
                addUsers();
            }
            else{
                var cur = events[index];
                index = index + 1;
                console.log(cur);
                code.createEvent(cur[0], cur[1], cur[2], cur[3], cur[4], cur[5], [], addEvents);
            }
        }

        function addTags(){
            console.log("Add tags.");

            if(index === tags.length){
                index = 0;
                addEvents();
            }
            else{
                var cur = tags[index];
                index = index + 1;
                code.createTag(cur[0], addTags);
            }
        }

        function assignHostOrgIds(err, results){
            if(err){ throw err;}

            console.log("assignHostOrgIds.");
            console.log(results.length);
            console.log(results[0]);


            var ids = results.map(function(elem){ return elem._id;});

            console.log(ids);

            event1.push(ids[0]);
            event2.push(ids[0]);
            event3.push(ids[0]);
            event4.push(ids[1]);
            event5.push(ids[1]);
            event6.push(ids[1]);
            event7.push(ids[1]);
            event8.push(ids[0]);
            event9.push(ids[2]);
            event10.push(ids[2]);
            event11.push(ids[2]);
            event12.push(ids[0]);
            event13.push(ids[2]);
            event14.push(ids[2]);
            event15.push(ids[0]);


            addTags();
        }

        function addOrgs(err, result){
            if(err) {throw err;}
            console.log("AddOrgs " + index);
            if(index === orgs.length){
                index = 0;
                code.searchDb('organizations',{},assignHostOrgIds);
            }
            else{
                var cur = orgs[index];
                index = index + 1;

                console.log(cur[0], cur[1], cur[2]);
                var password = Auth.hashPassword(cur[1]);
                code.createOrganization(cur[0], password, cur[2], addOrgs);
            }
        }


        function runIt(){
            console.log("Run it.");
            index = 0;
            addOrgs();
        }

        // Meant to clear the collection before starting the test.
        function clearDbs(){
            var arrayCollsToClear = ['users', 'organizations', 'events', 'tags'];

            var index = 0;
            console.log("Clearing Dbs");
            // Clears the collections in collsToClear
            function clearCol(err, result){
                if(err) {throw err;}
                console.log(result);
                if(index >=0 && index >= arrayCollsToClear.length){
                    runIt();
                }
                else{
                    database.collection(arrayCollsToClear[index], function(error, collection){
                        if(error)
                            error;

                        console.log("Cleared Collection: " + arrayCollsToClear[index]);
                        index++;

                        collection.remove({},{},clearCol);
                    });
                }
            }

            clearCol();
        }

        console.log("Code Compiled");
        clearDbs();

        //response.send( { 'success': true});

    });


    return app;
}
