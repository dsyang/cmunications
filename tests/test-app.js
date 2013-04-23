QUnit.module("Application", {
    setup: function() {
        this.request = new MockRequest();
        this.response = new MockResponse();
		    var mock = new MockDb();
        this.db = mock.client;
        this.app = new Application(this.db);
    },
	teardown: function(){
		this.db.closeDb();
	}
});


// Checks that all of the fields in expected are present and equal in actual. expected is a subset of actual.
var compareFields = function(expected, actual){
	var bool = true;
	for(var x in expected){
		if(JSON.stringify(expected[x]) !== JSON.stringify(actual[x])){
			bool = false;
		}
	}
	return bool;
}

//things defined by `this` in the setup function can be accessed by `this`
// in the tests.
test("defaultAction not facebook logged in", function() {
    var expected = {"hello": "world!",
                    "not logged in": "go to /auth/facebook to log in"
                   };
    this.app.defaultAction(new MockRequest(), this.response);
    deepEqual(this.response.things_sent, expected, 'send hello world and URL');
});

test("defaultAction facebook logged in", function() {
    var expected = {"hello": "world!",
                    "logged in as": "USAR!"
                   };
    this.request.user = "USAR!";
    this.app.defaultAction(this.request, this.response);
    deepEqual(this.response.things_sent, expected, 'send hello world and name');
});

test("nameAction test normal person", function() {
    var expected = {"hello": "John"};
    this.app.nameAction(this.request, this.response, {name: "John"});
    deepEqual(this.response.things_sent, expected, 'send hello John');

});

test("nameAction test Anand", function() {
    var expected = "ANAND IS HERE!!!";
    this.app.nameAction(this.request, this.response, {name: "Anand"});
    deepEqual(this.response.things_sent, expected, 'send exclaimation');

});

test("postAction test success", function() {
    var expected = {success: true};
    this.request.body = {'stuff': 'herp'};
    this.app.postAction(this.request, this.response, {stuff: "herp"});
    deepEqual(this.response.things_sent, expected, 'send success');

});

test("postAction test fail", function() {
    var expected = {success: false};
    var response = new MockResponse();
    this.request.body = {stuff:'Herp'};
    this.app.postAction(this.request, this.response, {stuff: "herp"});
    deepEqual(this.response.things_sent, expected, 'send failure');
});

// An asynchronous test which should be used with database calls.
/* Asynchronous tests automatically execute stop(), async().
   They expect you to call start() when the test is finished executing.
	   setup: (Above!)
			sets up a database but does not open it.
	   db.runTest(testToRun, arrayOfCollectionsToClear)
			opens up the database, and calls testToRun to run the test.
			lets you clear collections when writing test.
		teardown:
		    closes the database for us.
*/
asyncTest( "createUser: Add User to Database", function() {
	var scope = this;

	// Fill in the fields of the object to be created.
	var expected = {};
	expected.name = 'Dan Yang';
	expected.password = 'pass';

	// Check that the database did what we want.
	var callback = function( error, result ){
		ok(compareFields(expected, result[0]), 'Fields not correct');
	    start();
	}

	function runIt(){
		scope.app.createUser(expected.name, expected.password, callback);
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt, ['users']);
});


asyncTest( "createOrganization: Add Org to Database", function() {
	var scope = this;

	// Fill in the fields of the object to be created.
	var expected = {};
	expected.name = 'ASA';
	expected.password = 'pass';
	expected.description = 'This is the coolest org in the world';

	// Check that the database did what we want.
	var callback = function( error, result ){
		ok(compareFields(expected, result[0]), 'Fields not correct');
	    start();
	}

	function runIt(){
		scope.app.createOrganization(expected.name, expected.password, expected.description, callback);
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt, ['organizations']);
});

asyncTest( "createEvent: Add Event to Database", function() {
	var scope = this;

	// Fill in the fields of the object to be created.
	var expected = {};
	expected.name = 'ASA Bake Sale';
	expected.location = 'UC';
	expected.description = 'This is the coolest event around';
	expected.hostOrg = 'ASA';
	expected.startTime = new Date();
	expected.endTime = new Date();

	// Check that the database did what we want.
	var callback = function( error, result ){
		ok(compareFields(expected, result[0]), 'Fields not correct');
	    start();
	}

	function runIt(){
		scope.app.createEvent(expected.name, expected.location, expected.description, expected.hostOrg, expected.startTime, expected.endTime, callback);
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt, ['events']);
});

asyncTest( "createTag: Add Tag to Database", function() {
	var scope = this;

	// Fill in the fields of the object to be created.
	var expected = {};
	expected.name = 'freefood';

	// Check that the database did what we want.
	var callback = function( error, result ){
		ok(compareFields(expected, result[0]), 'Fields not correct');
	    start();
	}

	function runIt(){
		scope.app.createTag(expected.name, callback);
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt, ['tags']);
});

asyncTest( "searchDb: Searches Database for one entry", function() {
	var scope = this;

	// Fill in the fields of the object to be created.
	var expected = {};
	expected.name = 'Dan Yang';
	expected.password = 'pass';

	var input = {};
	input.collectionName = 'users'
	input.query = {};
	input.query['name'] = 'Dan Yang';

	// Check that the database did what we want.
	var callback = function( error, result ){
		ok(compareFields(expected, result[0]), 'Fields not correct');
	    start();
	}

	function runIt(){
		scope.app.searchDb(input.collectionName, input.query, callback);
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt);
});


asyncTest( "updateStringField: check if updates a string field", function() {
	var scope = this; 

	var input = {};
	input.collectionName = 'users';
	input.query = {password: 'pass'};
	input.field = 'name';
	input.value = 'Mochi';

	// Fill in the fields of the object to be created.
	var expected = {};
	expected.name = 'Mochi';
	expected.password = 'pass';

	// Check that the database did what we want.
	var callback = function( error, result ){
		//console.log(result[0]);
		//console.log(expected);
		ok(compareFields(expected, result[0]), result[0] + "    vs.   " + expected);
	    start();
	}

	var findResult = function(){
		scope.app.searchDb(input.collectionName, input.query, callback);
	}

	function runIt(){
		scope.app.updateStringField(input.collectionName, input.query, input.field, input.value, findResult);
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt);
});


asyncTest( "addToArrayField: check if updatedArrayField", function() {
	var scope = this;

	var input = {};
	input.collectionName = 'users';
	input.query = {password: 'pass'};
	input.field = 'savedEvents';
	input.value = 12345098;

	// Fill in the fields of the object to be created.
	var expected = {};
	expected.name = 'Mochi';
	expected.password = 'pass';
	expected.savedEvents = [12345098];

	// Check that the database did what we want.
	var callback = function( error, result ){
		//console.log(result[0]);
		//console.log(expected);
		ok(compareFields(expected, result[0]), 'Fields not correct: ' + expected + '  vs.  ' + result[0]);
	    start();
	}

	var findResult = function(){
		scope.app.searchDb(input.collectionName, input.query, callback);
	}

	function runIt(){
		scope.app.addToArrayField(input.collectionName, input.query, input.field, input.value, findResult);
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt);
});

asyncTest( "removeFromArrayField: check if updatedArrayField", function() {
	var scope = this;

	var input = {};
	input.collectionName = 'users';
	input.query = {password: 'pass'};
	input.field = 'savedEvents';
	input.value = 12345098;

	// Fill in the fields of the object to be created.
	var expected = {};
	expected.name = 'Mochi';
	expected.password = 'pass';
	expected.savedEvents = [];

	// Check that the database did what we want.
	var callback = function( error, result ){
		//console.log(result[0]);
		//console.log(expected);
		ok(compareFields(expected, result[0]), 'Fields not correct: ' + expected + '  vs.  ' + result[0]);
	    start();
	}

	var findResult = function(){
		scope.app.searchDb(input.collectionName, input.query, callback);
	}

	function runIt(){
		console.log(scope.app);
		scope.app.removeFromArrayField(input.collectionName, input.query, input.field, input.value, findResult);
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt);
});

// Next should be a series of followup tests for the actions.
asyncTest( "Populate Database test. This puts a bunch of items in the database to test.", function() {
	var scope = this;
	
	var index = 0;
	
	var user1 = ['Mochi', '123'];
	var user2 = ['Shikha', '123'];
	var user3 = ['Dan Yang', '123'];

	var org1 = ['Mayur Sasa', 'abc', "Indian haven on campus"]
	var org2 = ['Activities Board', 'abc', "You know what they say about people with big budgets..."]
	var org3 = ['Taiwanese Student Association', 'abc', "Better than Asian Student Association"] 

	var event1 = ['Samosa Sale', 'Doherty Hall', 'Selling somasas', 'Mayur Sasa', new Date(2013, 4, 30, 12, 0, 0, 0), new Date(2013, 4, 30, 16, 0, 0, 0)];

	var event2 = ['Activities Board GBM', 'Doherty Hall', 'Everybody Come', 'Activities Board', new Date(2013, 4, 28, 1, 30, 0, 0), new Date(2013, 4, 28, 2, 30, 0, 0)];

	var event3 = ['TSA Club Party', 'Static', 'Best club party of the year', 'Taiwanese Student Association', new Date(2013, 5, 2, 13, 0, 0, 0), new Date(2013, 5, 3, 12, 0, 0, 0)];

	var tag1 = ['party'];
	var tag2 = ['food'];
	
	
	var users = [user1, user2, user3];
	var orgs = [org1, org2, org3];
	var events = [event1, event2, event3];
	var tags = [tag1, tag2];
	
	// Check that the database did what we want.
	var callback = function( error, result ){
		if(error){throw error;}
		else{
			ok(true);
			start();
		}	
	}
	
	function addUsers(){
		if(index === users.length){
			callback();
		}
		else{
			var cur = users[index];
			//console.log("Index: " + index + "Curr: " + cur);
			index = index + 1;
			scope.app.createUser(cur[0], cur[1], addUsers);
		}
	}
	
	function addOrgs(){
		if(index === orgs.length){
			index = 0;
			addUsers();
		}
		else{
			var cur = orgs[index];
			index = index + 1;
			scope.app.createOrganization(cur[0], cur[1], cur[2], addOrgs);
		}
	}

	function addEvents(){
		if(index === events.length){
			index = 0;
			addOrgs();
		}
		else{
			var cur = events[index];
			index = index + 1;
			scope.app.createEvent(cur[0], cur[1], cur[2], cur[3], cur[4], cur[5], addEvents);
		}
	}

	function addTags(){
		if(index === tags.length){
			index = 0;
			addEvents();
		}
		else{
			var cur = tags[index];
			index = index + 1;
			scope.app.createTag(cur[0], addTags);
		}
	}	

	function runIt(){
		index = 0;
		addTags();	
	}

	// Call this to open the database, and run the test. ONLY CALL ONCE!
	this.db.runTest(runIt, ['users', 'organizations', 'events', 'tags']);
});



