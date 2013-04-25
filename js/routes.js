 // This file hold all the routes for the app, describing our api endpoints

//`applicationCode.js` holds all the logic for our application.
var async = require("async");
module.exports = function(app, db, Auth) {
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

    app.post( '/auth/login', function(request, response) {
        Auth.login(request, response, function(err, account) {
            if(err) response.send({success: false, message: err});
            else response.send({success: true,
                                account: account});
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

		  var user1 = ['Mochi', '123'];
		  var user2 = ['Shikha', '123'];
		  var user3 = ['Dan Yang', '123'];

		  var org1 = ['Mayur Sasa', 'abc', "Indian haven on campus"]
		  var org2 = ['Activities Board', 'abc', "You know what they say about people with big budgets..."]
		  var org3 = ['Taiwanese Student Association', 'abc', "Better than Asian Student Association"]

		  var event1 = ['Samosa Sale', 'Doherty Hall', 'Selling samosas',  new Date(2013, 4, 30, 12, 0, 0, 0), new Date(2013, 4, 30, 16, 0, 0, 0)];

		  var event2 = ['Activities Board GBM', 'Doherty Hall', 'Everybody Come', new Date(2013, 4, 28, 1, 30, 0, 0), new Date(2013, 4, 28, 2, 30, 0, 0)];

		  var event3 = ['TSA Club Party', 'Static', 'Best club party of the year', new Date(2013, 5, 2, 13, 0, 0, 0), new Date(2013, 5, 3, 12, 0, 0, 0)];

		  var tag1 = ['party'];
		  var tag2 = ['food'];

		  // Org1 corresponds to event1 and so on. Change this by changing assignHostOrgIds below.
		  var users = [user1, user2, user3];
		  var orgs = [org1, org2, org3];
		  var events = [event1, event2, event3];
		  var tags = [tag1, tag2];	

		  // Check that the database did what we want.
		  var callback = function( error, result ){
				console.log("Return the list of events.");		  
		  
				if(error){throw error;}
				code.listEventsAction(request, response, undefined);
		  }
		  
		  function addUsers(){
				console.log("Add users.");

				if(index === users.length){
					  callback();
				}
				else{
					  var cur = users[index];
					  //console.log("Index: " + index + "Curr: " + cur);
					  index = index + 1;
					  code.createUser(cur[0], cur[1], addUsers);
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
					  code.createEvent(cur[0], cur[1], cur[2], cur[3], cur[4], cur[5], addEvents);
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
			
			addTags();
		  }

		  function addOrgs(){
				console.log("AddOrgs " + index);		  
				if(index === orgs.length){
					  index = 0;
					  code.searchDb('organizations',{},assignHostOrgIds);
				}
				else{
					  var cur = orgs[index];
					  index = index + 1;

					  console.log(cur[0], cur[1], cur[2]);					  
					  
					  code.createOrganization(cur[0], cur[1], cur[2], addOrgs);
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
			function clearCol(){				
				if(index >=0 && index >= arrayCollsToClear.length){
					runIt();
				}
				else{
					database.collection(arrayCollsToClear[index], function(error, collection){
						if(error)
							error;
						
						console.log("Cleared Collection: " + index);
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
