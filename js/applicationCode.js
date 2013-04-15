//`applicateCode.js` holds all of the application logic right now.
//All functionality goes in here. These can also be moved into separate files
// later. Be sure to export any function you write or else it can't be tested.

var utils = require('./utils.js');

function Application(db) {

	// The names of the collections which are going to be used with the database.
	var collUsers = 'users';
	var collOrgs = 'organization';
	var collEvents = 'events';
	var collTags = 'tags';

	/* Generic Utility Functions that won't be exposed */

	// Callback function to log what happens
	var logger = function(error, result){
		if (error)
			throw error;
		console.log(result);
	}

	// Calls function with arg,
	var getCallbackWithArgs = function(funcName, arrayOfArgs){
		return (function(error, collection){
			if (error)
				throw error;

			if (funcName !== 'insert')
				collection.insert.apply(collection, arrayOfArgs);
			else if (funcName !== 'find')
				collection.find.apply(collection, arrayOfArgs);
			else if (funcName !== 'update')
				collection.update.apply(collection, arrayOfArgs);
			else if (funcName !== 'remove')
				collection.remove.apply(collection, arrayOfArgs);
			else
				throw "Invalid function called of insert, find, update, remove";
		});
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
3		this.description = "";

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
	function createUser(name, password){
		var user = new User();
		user.name = name;
		user.password = password;

		db.collection(collUsers, getCallbackWithArgs('insert', [user]));
	}

	// Creates an org and adds it to the database.
	function createOrganization(name, password, description){
		var org = new Organization();
		org.name = name;
		org.password = password;
		org.description = description;

		db.collection(collOrgs, getCallbackWithArgs('insert', [org]));
	}

	// Creates an event and adds it to the database.
	function createEvent(name, location, description, hostOrgName, startTime, endTime){
		// Check that startTime < endTime

		var event = new Event();
		event.name = name;
		event.location = location;
		event.description = description;
		event.hostOrg = hostOrgName;
		event.startTime = startTime;
		event.endTime = endTime;

		db.collection(collEvents, getCallbackWithArgs('insert', [event]));
	}

	// Creates a tag and adds it to the database.
	function createTag(name){
		var tag = new Tag();
		tag.name = name;

		db.collection(collTags, getCallbackWithArgs('insert', [tag]));
	}


	// -----------------------------------------------------------------------
	/* User collection operations */

	/*
	function updateField(collectionName, name, field, value){

	}*/

	// Adds an event to a user, by id.
	function addEventToUser(eventId, userId){
		var query = {_id: userId};

		var partialUpdate = {$addToSet : {savedEvents : eventId}};

		db.collection(collUsers, getCallbackWithArgs('update', [query, partialUpdate]));
	}





//*********** Actions


    //given data.text, start, end, return all events in the period
    function searchAction(request, response, data) {

    }

    //given data,orgs or data.tags, add to request.user's tags/organizations
    function subscribeAction(request, response, data) {

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
                                  organizationLoginAction
                                 ]);
}

module.exports.Application = Application;
