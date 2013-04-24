//`applicateCode.js` holds all of the application logic right now.
//All functionality goes in here. These can also be moved into separate files
// later. Be sure to export any function you write or else it can't be tested.

var utils = require('./utils.js');
var ObjectID = require('mongodb').BSONPure.ObjectID;
var async = require('async');


function Application(db) {

	// The names of the collections which are going to be used with the database.
	var collUsers = 'users';
	var collOrgs = 'organizations';
	var collEvents = 'events';
	var collTags = 'tags';

	/* Generic Utility Functions that won't be exposed */

	// Callback function to log what happens
	var logger = function(error, result){
		if (error)
			throw error;
		console.log(result);
	}

	var throwError = function(error){
		if(error)
			throw error;
	}

	// Calls function with arg,
	// Special case for find - arrayOfArgs = [query, callback]
			//funcName: 'insert', 'find', 'update', 'remove'
	var getCallbackWithArgs = function(funcName, arrayOfArgs){
		return (function(error, collection){
			if (error)
				throw error;

			//arrayOfArgs.push(throwError);
			//console.log(arrayOfArgs);

			if (funcName === 'insert')
				collection.insert.apply(collection, arrayOfArgs);
			else if (funcName === 'find'){
				var results = collection.find(arrayOfArgs[0]).toArray(arrayOfArgs[1]);
			}
			else if (funcName === 'update')
				collection.update.apply(collection, arrayOfArgs);
			else if (funcName === 'remove')
				collection.remove.apply(collection, arrayOfArgs);
			else
				throw "Invalid function called of insert, find, update, remove";
		});
	}

	var isValidCollectionName = function(collectionName){
		return (collectionName === collUsers ||
		   collectionName === collOrgs ||
		   collectionName === collEvents ||
		   collectionName === collTags);
	}
	/* Templates for the database objects*/


	function User(){
		this.name = "";
		this.password = "";

		// Saved by name
		this.tags = [];

		// Saved by plaintext
		this.notifications = [];

		// Saved by reference.
		this.savedEvents = [];
		this.orgs = [];
	}

	function Organization(){
		this.name = "";
		this.password = "";
		this.description = "";

		// Saved by reference.
		this.events = [];
		this.subscribers = [];
	}

	function Event(){
		this.name = "";
		this.location = "";
		this.timeStart = new Date();
		this.timeEnd = new Date();
		this.description = "";

		// By Name
		this.tags = [];

		this.hostOrg;

		// By reference
		this.followers = [];
	}

	function Tag(){
		this.name = "";

		// By reference
		this.events = [];
		this.subscribers = [];
	}

	/* Some conventions:
			create - Making a new database object from scratch.
			delete - Deleting an object completely from the database.
			add - Add a reference to another part of the database (e.g. addEventsToUser)
			remove - Removing a reference to another part of the database (e.g. removeEventFromUser)
	*/

	//---------------------------------------------------------------------------------------------
	/* Here's the set of create functions, used to create database objects.
	 * We want to separate the database object definition above
	 * from sanitation checking
	 *
	 */

	// Creates a user and adds it to the database.
	function createUser(name, password, callback){
		var user = new User();
		user.name = name;
		user.password = password;

		if(!callback){
			callback = logger;
		}

		db.collection(collUsers, getCallbackWithArgs('insert', [user,{safe:true}
                                                            , callback]));
	}

	// Creates an org and adds it to the database.
	function createOrganization(name, password, description, callback){
		var org = new Organization();
		org.name = name;
		org.password = password;
		org.description = description;

		if(!callback){
			callback = logger;
		}

		db.collection(collOrgs, getCallbackWithArgs('insert', [org, {safe:true},
                                                           callback]));
	}

	// Creates an event and adds it to the database.
	function createEvent(name, location, description, hostOrgName, startTime,
                       endTime, callback){
		// Check that startTime < endTime

		var event = new Event();
		event.name = name;
		event.location = location;
		event.description = description;
		event.hostOrg = hostOrgName;
		event.startTime = startTime;
		event.endTime = endTime;

		if(!callback){
			callback = logger;
		}

		db.collection(collEvents, getCallbackWithArgs('insert', [event, {safe:true}
                                                             , callback]));
	}

	// Creates a tag and adds it to the database.
	function createTag(name, callback){
		var tag = new Tag();
		tag.name = name;

		if(!callback){
			callback = logger;
		}

		db.collection(collTags, getCallbackWithArgs('insert', [tag, {safe:true},
                                                           callback]));
	}

	// Search for a field in the database.
	function searchDb(collectionName, query, callback){
		db.collection(collectionName, getCallbackWithArgs('find',[query, callback]))
	}

	// Update field in collection
	function updateStringField(collectionName, query, field, value, callback){
		if(isValidCollectionName(collectionName)){
		   		var update = {}, partialUpdate = {};
				partialUpdate[field] = value;
				update['$set'] = partialUpdate;
				//callback();
				db.collection(collectionName,
						getCallbackWithArgs('update', [query, update,{'multi':true},
                                           callback]));
		}
	}

	// Update fields in collection
	function updateFields(collectionName, query, fields, callback){
		if(isValidCollectionName(collectionName)){
		   		var update = {}, partialUpdate = {};
				partialUpdate = fields
				update['$set'] = partialUpdate;
				//callback();
				db.collection(collectionName,
						getCallbackWithArgs('update', [query, update,{'multi':true},
                                           callback]));
		}
	}


	// Add to array field in collection
	// value is expected to be an array of values toAdd
	function addToArrayField(collectionName, query, field, value, callback){
		if(isValidCollectionName(collectionName)){
	   		var update = {}, partialUpdate = {}, partialpartialUpdate = {};
			partialpartialUpdate['$each'] = value;
			partialUpdate[field] = partialpartialUpdate;
			update['$addToSet'] = partialUpdate;

			db.collection(collectionName,
					getCallbackWithArgs('update', [query, update, {'multi':true},
                                         callback]));

		}
	}

	// Remove from array field in collection
	function removeFromArrayField(collectionName, query, field, value, callback){
		if(isValidCollectionName(collectionName)){
	   		var update = {}, partialUpdate = {};
			partialUpdate[field] = value;
			update['$pull'] = partialUpdate;

			db.collection(collectionName,
					getCallbackWithArgs('update', [query, update, {'multi':true},
                                         callback]));

		}
	}


	//=====================================
	// UTILITIES FOR ACTIONS
	//=====================================
	// These functions don't do any sanitation checking. All things passed here need to be safe!

	// Adds an event to a user, by id.
	function addEventsToUser(userid, eventids, cb){
		var query = {};
		query['_id'] = userid;

		addToArrayField(collUsers, query, 'savedEvents', eventids, cb);
	}

		// Adds an event to a user, by id.
	function addEventsToOrg(orgid, eventids, cb){
		var query = {};
		query['_id'] = orgid;

		addToArrayField(collOrgs, query, 'events', eventids, cb);
	}

	// Adds organizations to a user.
    function addOrganizationsToUser(userid, orgids, cb){
		var query = {};
		query['_id'] = userid;

		addToArrayField(collUsers, query, 'orgs', orgids, cb);
	}

	// Adds organizations to a user.
    function addTagsToUser(userid, tags, cb){
		var query = {};
		query['_id'] = userid;

		addToArrayField(collUsers, query, 'tags', tags, cb);
	}



//=====================================
// ACTIONS
//=====================================

    function success(name, obj) {
        var res =  {'success': true};
        res[name] = obj;
        return res;
    }

    function fail(message) {
        return {'success': false,
                'message': message};
    }

    //given data.text, start, end, return all events in the period
	/*data = { text: request.body.text,
                     start: request.body.startDate,
                     end: request.body.endDate
                   };
	*/
    function searchAction(request, response, data) {
        function cb(err, result) {
            if(err) response.send(fail(err));

            response.send(success('results', result));
        }

		var query = {};
		query['name'] = data.text;

		    // IS DATA.TXT ACTUALLY A QUERY OBJECT?
        searchDb(collEvents, query, cb);
    }

    //given data,orgs or data.tags, add to request.user's tags/organizations
	/*
		{orgids: request.body.orgids,
         tags: request.body.tags
        };
	*/
    function subscribeAction(request, response, data) {
        var id = request.user.id;
		var finalResult = {};
		//console.log(data.orgids, data.tags);

        if(data.orgids) {
            addOrganizationsToUser(id, data.orgids, cb);
        }
		else{
			cb();
		}
        function cb(err, result) {

            if(err){ response.send(fail(err));}
			finalResult = result;


            if(data.tags) {
                addTagsToUser(id, data.tags, cb2);
            }
			else{
				cb2(err, result);
			}
        }
        function cb2(err, result) {
            if(err){ response.send(fail(err));}

			finalResult = result;
            response.send(success('result', result));
        }
    }

    //given data.event_id
    function eventDetailAction(request, response, data) {
        var id = ObjectID(data.event_id);

        searchDb(collEvents, {'_id' : id}, cb);
        function cb(err, result) {
            if(err){
                response.send(fail(err));
            } else if(result[0]){
                response.send(success('event', result[0]));
            } else {
                response.send(fail('no event found'));
            }
        }
    }

    //given data.event_id
    function starEventAction(request, response, data) {
        var event_id = ObjectID(data.event_id);
        var user_id = ObjectID(request.user.id);
        searchDb(collEvents, {'_id' : event_id}, cb);
        function cb(err, result) {
            if(err) response.send(fail(err));
            if(!result) response.send(fail('no event found'));
            addEventsToUser( user_id, [event_id], cb2);
        }
		function cb2(err, result) {
            if(err){
                response.send(fail(err));
            } else if(result[0]){
                response.send(success('success', true));
            } else {
                response.send(fail('no event found'));
            }
        }

    }

    //return all starred events for request.user
    function listStarredEventsAction(request, response, data) {
		/*
        var dbCalls = [];

		//console.log(request);


        request.user.savedEvents.forEach(function(event_id) {
			dbCalls.push(function(callback){

				searchDb(collEvents, {'_id' : event_id}, callback);
			});
			//console.log(event_id);
		});
        async.parallel(dbCalls, finalCallback);

		function finalCallback(err, results){
			if(err){ throw err;}
			response.send(success('results', results));
		}*/


		var savedEvents = request.user.savedEvents;
		var query = {'_id': {'$in': savedEvents}};
		searchDb(collEvents, query, finalCallback);

		function finalCallback(err, results){
			if(err){ throw err;}
			response.send(success('results', results));
		}
    }

    //list events for request.org.id
    function listOrgEventsAction(request, response, data){
		var scope = this;

		var orgid = request.org.id;
        searchDb(collOrgs, {'_id' : orgid}, cb);

		function cb(err, results){
			if(err){ throw err;}

			var query = {'_id': {'$in': results[0].events}};
			searchDb(collEvents, query, finalCallback);
		}

		function finalCallback(err, results){
			if(err){ throw err;}
			response.send(success('results', results));
		}
    }

    //given an event in data.event
    function createEventAction(request, response, data) {
        console.log("stuff");
        var dStart = new Date(data.event.timeStart);
        var dEnd = new Date(data.event.timeEnd);
        createEvent(data.event.name, data.event.location, data.event.description,
                    null, dStart, dEnd, cb);

        function cb(err, result) {
            if(err) throw err;
            console.log(result);
            response.send(success('_id', result));
        }

        console.log(data.event);
        response.send(success('dummy', 42));
    }

    //given an event in data.event and a data.event_id
    function editEventAction(request, response, data) {
        var event_id = ObjectID(data.event_id);
        searchDb(collEvents, {'_id': event_id}, cb);
        function cb(err, result) {
            if(err) throw err;
            console.log(result);
            var dStart = new Date(data.event.timeStart);
            var dEnd = new Date(data.event.timeEnd);
            data.event.timeStart = dStart;
            data.event.timeEnd = new Date();
            delete data.event._id;
            updateFields(collEvents, {'_id' : event_id}, data.event, cb2);
            function cb2(err, result) {
                if(err) throw err;
                response.send(success('event', {'event_id': event_id,
                                                'result': result
                                               }
                                     ));
            }
        }

    }

    //list all events
    function listEventsAction(request, response, data) {
		    function sendResults(err,listOfDocs){
				response.send( { 'success': true,
								 'events': listOfDocs });
		    }

		    searchDb(collEvents, {}, sendResults);
    };

    //list all organizations
    function listOrganizationAction(request, response, data) {
		    function sendResults(err,listOfDocs){
            response.send( { 'success': true,
                             'organizations': listOfDocs });
		    }

		    searchDb(collOrgs, {}, sendResults);
    }


    //list all tags
    function listTagsAction(request, response, data) {
		    function sendResults(err,listOfDocs){
            response.send( { 'success': true,
                             'tags': listOfDocs });
		    }

		    searchDb(collTags, {}, sendResults);
    }


    //given data.name, data.password, data.description
    function organizationCreateAction(request, response, data) {
        function cb(err, result) {
            if (err) throw err;

            response.send( { 'success': true,
                             'organization': result });
        }

        createOrganization(data.name, data.password, data.description, cb);
    }


    function loginAction(request, response, data) {
        console.log("stuff");
        response.send(success('dummy', 42));
    }

    function facebookLoginAction(request, response, data) {
        response.send({"hi" : request.user});
    }

    function organizationLoginAction(request, response, data) {
        response.send({"hi":
                       'curl -v -d "username=bob&password=secret" http://127.0.0.1:5000/auth/organization'
                      });
    }

    function defaultAction(request, response) {
        if(request.user) {
            response.send({"hello": "world!",
                           "logged in as" : request.user});
        } else {
            response.send({"hello": "world!",
                           "not logged in": "go to /auth/facebook to log in"});
        }
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
    return utils.exportFunctions([defaultAction,
                                  nameAction,
                                  postAction,
                                  searchAction,
                                  subscribeAction,
                                  eventDetailAction,
                                  starEventAction,
                                  listStarredEventsAction,
                                  listOrgEventsAction,
                                  createEventAction,
                                  editEventAction,
                                  listEventsAction,
                                  listOrganizationAction,
                                  listTagsAction,
                                  loginAction,
                                  facebookLoginAction,
                                  organizationLoginAction,


								                  createUser,
								                  createOrganization,
								                  createEvent,
								                  createTag,
								                  searchDb,
								                  updateStringField,
								                  addToArrayField,
								                  removeFromArrayField,
												  addEventsToUser,
												  addEventsToOrg,
												  addOrganizationsToUser,
												  addTagsToUser,
                                 ]);
}

module.exports.Application = Application;
