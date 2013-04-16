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
			add - Add a reference to another part of the database (e.g. addEventToUser)
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


	// Add to array field in collection
	function addToArrayField(collectionName, query, field, value, callback){
		if(isValidCollectionName(collectionName)){
	   		var update = {}, partialUpdate = {};
			partialUpdate[field] = value;
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


	// -----------------------------------------------------------------------
	/* User collection operations */

	// Adds an event to a user, by id.
	function addEventToUser(eventId, userId){
		var query = {_id: userId};

		var partialUpdate = {$addToSet : {savedEvents : eventId}};

		db.collection(collUsers, getCallbackWithArgs('update', [query,
                                                            partialUpdate]));
	}





//*********** Actions

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
    function searchAction(request, response, data) {
        function cb(err, result) {
            if(err) response.send(fail(err));

            response.send(success('results', result));
        }
		
		// IS DATA.TXT ACTUALLY A QUERY OBJECT?
        searchDb(collEvents, data.text, cb);
    }

    //given data,orgs or data.tags, add to request.user's tags/organizations
    function subscribeAction(request, response, data) {
        var id = request.user.id;
        if(data.orgs) {
            addOrganizationsToUser(id, data.orgs, cb);
        }
        function cb(err, result) {
            if(err) response.send(fail(err));
            if(data.tags) {
                addTagsToUser(id, data.tags, cb2);
            }
        }
        function cb2(err, result) {
            if(err) response.send(fail(err));
            response.send(success('result', result));
        }
    }

    //given data.event_id
    function eventDetailAction(request, response, data) {
        var id = ObjectID(data.event_id);
        searchDb(collEvents, {'_id' : id}, cb);
        function cb(err, result) {
            if(err) response.send(fail(err));
            if(result) response.send(success('event', result));
            response.send(fail('no event found'))
        }
    }

    //given data.event_id
    function starEventAction(request, response, data) {
        var event_id = ObjectID(data.event_id);
        var user_id = ObjectID(request.user.id);
        searchDb(collEvents, {'_id' : id}, cb);
        function cb(err, result) {
            if(err) response.send(fail(err));
            if(!result) response.send(fail('no event found'));
            addEventToUser(event_id, user_id);
        };
    }

    //return all stared events for request.user
    function listStarredEventsAction(request, response, data) {
        var dbCalls = []
        request.user.savedEvents.forEach(function(event_id) {
			
		});
        async.parallel([


        ])
    }

    //given an event in data.event
    function createEventAction(request, response, data) {
    }

    //given an event in data.event and a data.event_id
    function editEventAction(request, response, data) {
    }

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
                                  facebookLoginAction,
                                  organizationLoginAction,
								                  createUser,
								                  createOrganization,
								                  createEvent,
								                  createTag,
								                  searchDb,
								                  updateStringField,
								                  addToArrayField,
								                  removeFromArrayField
                                 ]);
}

module.exports.Application = Application;
