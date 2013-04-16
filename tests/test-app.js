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
		if(expected[x] !== actual[x]){
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
		ok(compareFields(expected, result[0]), 'Fields not correct');
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


