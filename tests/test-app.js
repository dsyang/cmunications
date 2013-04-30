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

var emptyCallback = function(error, results){
	  if(error) throw error;
}

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

test("Test sorting of Dates.", function() {
    var dates = [{timeStart: new Date(2010, 4, 10, 10, 07, 16)},
                 {timeStart: new Date(2010, 4, 8, 9, 16, 09)},
                 {timeStart: new Date(2010, 3, 30, 0, 15, 49)},
                 {timeStart: new Date(2010, 3, 8, 10, 08, 35)}];                
                
    var date_sort_asc = function (date1, date2) {
        if (date1.timeStart > date2.timeStart) return 1;
        if (date1.timeStart < date2.timeStart) return -1;
        return 0;
    };            
                
    //console.log(dates.sort(date_sort_asc));

    ok(true);
});

// An asynchronous test which should be used with database calls.
 // Asynchronous tests automatically execute stop(), async().
 //   They expect you to call start() when the test is finished executing.
 //   setup: (Above!)
 //   sets up a database but does not open it.
 //   db.runTest(testToRun, arrayOfCollectionsToClear)
 //   opens up the database, and calls testToRun to run the test.
 //   lets you clear collections when writing test.
 //   teardown:
 //   closes the database for us.

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
	  this.db.runTest(runIt, ['users','organizations','events','tags']);
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
      scope.hostOrgId = '';

	  // Fill in the fields of the object to be created.
	  var expected = {};
	  expected.name = 'ASA Bake Sale';
	  expected.location = 'UC';
	  expected.description = 'This is the coolest event around';
	  expected.hostOrg = 'ASA';
	  expected.timeStart = new Date();
	  expected.timeEnd = new Date();

	  // Check that the database did what we want.
	  var callback = function( error, result ){
		    ok(true);
            start();
	  }

	  // Check that the database did what we want.
	  var checkOrgHasEvent = function( error, result ){
		    ok(compareFields(expected, result[0]), 'Fields not correct');

            scope.app.searchDb('organizations', {'_id':scope.hostOrgId}, callback);
	  }

      function checkEventAdded(){
            scope.app.searchDb('events',{'name':'ASA Bake Sale'},checkOrgHasEvent);
      }

	  function callback1(err, results){

            if(err){ throw err; }
            scope.hostOrgId = results[0]._id;

		    scope.app.createEvent(expected.name, expected.location, expected.description, expected.timeStart, expected.timeEnd,scope.hostOrgId, [], checkEventAdded);
	  }

      function runIt(){
            scope.app.searchDb('organizations',{'name': expected.hostOrg},callback1);
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
	  input.value = [12345098];

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
	  input.value = [12345098];

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

	  var event1 = ['Samosa Sale', 'Doherty Hall', 'Selling samosas',  new Date(2013, 4, 30, 12, 0, 0, 0), new Date(2013, 4, 30, 16, 0, 0, 0)];

	  var event2 = ['Activities Board GBM', 'Doherty Hall', 'Everybody Come', new Date(2013, 4, 28, 1, 30, 0, 0), new Date(2013, 4, 28, 2, 30, 0, 0)];

	  var event3 = ['TSA Club Party', 'Static', 'Best club party of the year', new Date(2013, 5, 2, 13, 0, 0, 0), new Date(2013, 5, 3, 12, 0, 0, 0)];

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


	  function addEvents(){
		    if(index === events.length){
			      index = 0;
			      addUsers();
		    }
		    else{
			      var cur = events[index];
			      index = index + 1;
			      scope.app.createEvent(cur[0], cur[1], cur[2], cur[3], cur[4], cur[5], [], addEvents);
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

      function assignHostOrgIds(err, results){
        if(err){ throw err;}

        var ids = results.map(function(elem){ return elem._id;});

        event1.push(ids[0]);
        event2.push(ids[1]);
        event3.push(ids[2]);

        addTags();
      }

      function addOrgs(){
		    if(index === orgs.length){
			      index = 0;
			      scope.app.searchDb('organizations',{},assignHostOrgIds);
		    }
		    else{
			      var cur = orgs[index];
			      index = index + 1;
			      scope.app.createOrganization(cur[0], cur[1], cur[2], addOrgs);
		    }
	  }


	  function runIt(){
		    index = 0;
		    addOrgs();
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, ['users', 'organizations', 'events', 'tags']);
});



// This just tests a basic string search (no substrings) of the name field of event. As better search is added, more will be featured here.
asyncTest("Basic Search by name of Event", function() {
	  var scope = this;

    scope.expected = {"name": "Samosa Sale",
                      "location": "Doherty Hall",
					            "description": "Selling samosas"
                     };

	  scope.data = {};
    scope.data['text'] = "Samosa Sale";

    setTimeout(function() {
		    ok(compareFields(scope.expected, scope.response.things_sent.results[0]), 'Fields not correct');

        //Make assertion
        //ok(true);
        // After the assertion called, restart the test
        start();
    }, 1000);

	  function runIt(){
		    scope.app.searchAction(scope.request, scope.response, scope.data);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});

// This tests an advanced substring search, but doesn't limit date ranges.
asyncTest("Advanced Search by name of Event", function() {
	  var scope = this;

    scope.expected = {"name": "Samosa Sale",
                      "location": "Doherty Hall",
					            "description": "Selling samosas"
                     };

	  scope.data = {};
    scope.data['text'] = "samosa";

    setTimeout(function() {
		    ok(compareFields(scope.expected, scope.response.things_sent.results[0]), 'Fields not correct');

        start();
    }, 1000);

	  function runIt(){
		    scope.app.searchAction(scope.request, scope.response, scope.data);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});


// This tests a basic org and subscription action.
asyncTest("addTagsToUser", function() {
	  var scope = this;

    scope.expected = {"name": "Mochi",
					            "password" : '123',
					            'tags' : ['party','food']
                     };

	  scope.tags = ['party', 'food'];
	  scope.userid = {};

	  // Check that the database did what we want.
	  var callback = function( error, result ){
		    ok(compareFields(scope.expected, result[0]), 'Fields not correct');
	      start();
	  }

	  var callback1 = function(){
		    var query = {};
		    query['_id'] = scope.userid;
		    scope.app.searchDb('users', query, callback);
	  }

	  function saveUserId(err, result){
		    scope.userid = result[0]._id;

		    scope.app.addTagsToUser(scope.userid, scope.tags, callback1);
	  }

	  function runIt(){
		    scope.app.searchDb('users',{'name' : "Mochi"}, saveUserId);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});

// This tests a basic org and subscription action.
asyncTest("addOrganizationsToUser", function() {
	  var scope = this;

    scope.expected = {"name": "Mochi",
					            "password" : '123',
					            'orgs':''
                     };

	  scope.orgids = [];
	  scope.userid = {};

	  // Check that the database did what we want.
	  var callback = function( error, result ){
		    ok(compareFields(scope.expected, result[0]), 'Fields not correct');
	      start();
	  }

	  var callback1 = function(){
		    var query = {};
		    query['_id'] = scope.userid;
		    scope.app.searchDb('users', query, callback);
	  }

	  function saveUserId(err, result){
		    scope.userid = result[0]._id;

		    scope.expected['orgs'] = scope.orgids;

		    scope.app.addOrganizationsToUser(scope.userid, scope.orgids, callback1);
	  }

	  function saveOrgIds(err, results){
		    results.forEach(function(elem){
			      scope.orgids.push(elem._id);
		    });


		    scope.app.searchDb('users',{'name' : "Mochi"},saveUserId);
	  }

	  function runIt(){
		    scope.app.searchDb('organizations',{},saveOrgIds);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});

// This tests a basic org and subscription action.
asyncTest("addEventsToUser", function() {
	  var scope = this;

    scope.expected = {"name": "Mochi",
					            "password" : '123',
					            'savedEvents':''
                     };

	  scope.eventids = [];
	  scope.userid = {};

	  // Check that the database did what we want.
	  var callback = function( error, result ){
		    ok(compareFields(scope.expected, result[0]), 'Fields not correct');
	      start();
	  }

	  var callback1 = function(){
		    var query = {};
		    query['_id'] = scope.userid;
		    scope.app.searchDb('users', query, callback);
	  }

	  function saveUserId(err, result){
		    scope.userid = result[0]._id;

		    scope.expected['savedEvents'] = scope.eventids;

		    scope.app.addEventsToUser(scope.userid, scope.eventids, callback1);
	  }

	  function saveEventIds(err, results){
		    results.forEach(function(elem){
			      scope.eventids.push(elem._id);
		    });

		    scope.app.searchDb('users',{'name' : "Mochi"},saveUserId);
	  }

	  function runIt(){
		    scope.app.searchDb('events',{},saveEventIds);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});

// This tests a basic org and subscription action.
asyncTest("addEventsToOrg", function() {
	  var scope = this;

    scope.expected = {"name": "Mayur Sasa",
					            "password" : 'abc',
					            "description":"Indian haven on campus",
					            'events':''
                     };

	  scope.eventids = [];
	  scope.orgid = {};

	  // Check that the database did what we want.
	  var callback = function( error, result ){
            result[0].events = result[0].events.sort();
            scope.expected.events = scope.expected.events.sort();

            //console.log(result);
            //console.log(scope.expected);
            
		    ok(compareFields(scope.expected, result[0]), 'Fields not correct');
	      start();
	  }

	  var callback1 = function(){
		    var query = {};
		    query['_id'] = scope.orgid;
		    scope.app.searchDb('organizations', query, callback);
	  }

	  function saveOrgId(err, result){
		    scope.orgid = result[0]._id;

		    scope.app.addEventsToOrg(scope.orgid, scope.eventids, callback1);
	  }

	  function saveEventIds(err, results){
            //console.log(results);
		    results.forEach(function(elem, index){
			      scope.eventids[index] = elem._id;
		    });

		    scope.expected['events'] = scope.eventids;

		    scope.app.searchDb('organizations',{'name' : "Mayur Sasa"},saveOrgId);
	  }

	  function runIt(){
		    scope.app.searchDb('events',{},saveEventIds);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});

// This tests a basic org and subscription action.
asyncTest("Basic Search by name of Event", function() {
	  var scope = this;

    scope.expected = {"name": "Dan Yang",
					            "password" : '123',
					            'tags' : ['party','food']
                     };

	  scope.data = {};
	  scope.data.orgids = [];
	  scope.data.tags = ['party', 'food'];

	  scope.request = {};
	  scope.request.user = {};

	  // Check that the database did what we want.
	  var callback = function( error, result ){
		    //ok(true);

		    ok(compareFields(scope.expected, result[0]), 'Fields not correct');
	      start();
	  }

	  var callback1 = function(){
		    var query = {};
		    query['_id'] = scope.request.user.id_obj;
		    scope.app.searchDb('users', query, callback);
	  }

    setTimeout(function() {
		    callback1();
    }, 3000);

	  function saveUserId(err, result){
		    scope.request.user.id = result[0]._id.toString();
			scope.request.user.id_obj = result[0]._id;

		    scope.app.subscribeAction(scope.request, scope.response, scope.data);
	  }

	  function saveOrgIds(err, results){
		    results.forEach(function(elem){
			      scope.data.orgids.push(elem._id.toString());
		    });

		    scope.expected['orgs'] = scope.data['orgids'];

		    scope.app.searchDb('users',{'name' : "Dan Yang"},saveUserId);
	  }

	  function runIt(){
		    scope.app.searchDb('organizations',{},saveOrgIds);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});


// This tests a basic org and subscription action.
asyncTest("starEventAction", function() {
	  var scope = this;

	  scope.request.user = {};
	  scope.request.user.id = {};
	  scope.data = {};
	  scope.data.event_id;

	  // Check that the database did what we want.
	  var callback2 = function( error, result ){

		    ok(result[0].followers[0].toString() ===  scope.data.user._id, 'Fields not correct');
	      start();
	  }

	  // Check that the database did what we want.
	  var callback = function( error, result ){

		    ok(result[0].savedEvents[0].toString() ===  scope.data.event_id, 'Fields not correct');

		    var query = {};
		    query['_id'] = scope.data.event_id_obj;

		    scope.app.searchDb('events', query, callback2);
	  }

	  var callback1 = function(){
		    var query = {};
		    query['_id'] = scope.data.user._id_obj;
		    scope.app.searchDb('users', query, callback);
	  }

	  setTimeout(function() {
		    callback1();
    }, 1000);

	  function saveUserId(err, result){
        scope.data.user = {};
		    scope.data.user._id = result[0]._id.toString();
        scope.data.user._id_obj = result[0]._id;
		    scope.app.starEventAction(scope.request, scope.response, scope.data);
	  }

	  function saveEventIds(err, results){      
		    scope.data.event_id = results[0]._id.toString();
            scope.data.event_id_obj = results[0]._id;

		    scope.app.searchDb('users',{'name' : "Shikha"},saveUserId);
	  }

	  function runIt(){
		    scope.app.searchDb('events',{"name": "Activities Board GBM"},saveEventIds);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});




// This tests a basic org and subscription action.
asyncTest("starEventAction2", function() {
	  var scope = this;

	  scope.request.user = {};
	  scope.data = {};
      scope.data.user = {};
      scope.data.user._id = {};

	  scope.data.event_id;

	  // Check that the database did what we want.
	  var callback2 = function( error, result ){
            //console.log(result[0]);

		    ok(result[0].followers[1].toString() ===  scope.data.user._id, 'Fields not correct');
	      start();
	  }      
      
	  // Check that the database did what we want.
	  var callback = function( error, result ){
		    ok(result[0].savedEvents[2].toString() ===  scope.data.event_id, 'Fields not correct');

		    var query = {};
		    query['_id'] = scope.data.event_id_obj;
            
		    scope.app.searchDb('events', query, callback2);            
	  }

	  var callback1 = function(){
		    var query = {};
		    query['_id'] = scope.data.user._id_obj;
		    scope.app.searchDb('users', query, callback);
	  }

	  setTimeout(function() {
		    callback1();
    }, 1000);

	  function saveUserId(err, result){
		    scope.data.user._id = result[0]._id.toString();
            scope.data.user._id_obj = result[0]._id;
		    scope.app.starEventAction(scope.request, scope.response, scope.data);
	  }

	  function saveEventIds(err, results){      
		    scope.data.event_id = results[0]._id.toString();
            scope.data.event_id_obj = results[0]._id;
		    scope.app.searchDb('users',{'name' : "Mochi"},saveUserId);
	  }

	  function runIt(){
		    scope.app.searchDb('events',{"name": "Activities Board GBM"},saveEventIds);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});



// This tests a basic org and subscription action.
asyncTest("unstarEventAction", function() {
	  var scope = this;

	  scope.request.user = {};
	  scope.data = {};
      scope.data.user = {};
      scope.data.user._id = {};

	  scope.data.event_id;

	  // Check that the database did what we want.
	  var callback2 = function( error, result ){
            //console.log(result[0]);

		    ok(result[0].followers.length === 1, 'Fields not correct');
	      start();
	  }      
      
	  // Check that the database did what we want.
	  var callback = function( error, result ){
            //console.log(result[0]);
		    ok(result[0].savedEvents.length === 2, 'Length not correct');

		    var query = {};
		    query['_id'] = scope.data.event_id_obj;
            
		    scope.app.searchDb('events', query, callback2);            
	  }

	  var callback1 = function(){
		    var query = {};
		    query['_id'] = scope.data.user._id_obj;
		    scope.app.searchDb('users', query, callback);
	  }

	  setTimeout(function() {
		    callback1();
    }, 1000);

	  function saveUserId(err, result){
		    scope.data.user._id = result[0]._id.toString();
            scope.data.user._id_obj = result[0]._id;
            
            //console.log("Unstarring User: ");
            //console.log(result[0]);
		    scope.app.unstarEventAction(scope.request, scope.response, scope.data);
	  }

	  function saveEventIds(err, results){      
		    scope.data.event_id = results[0]._id.toString();
            scope.data.event_id_obj = results[0]._id;

            //console.log("From Event: ");
            //console.log(results[2]);            
            
		    scope.app.searchDb('users',{'name' : "Mochi"},saveUserId);
	  }

	  function runIt(){
		    scope.app.searchDb('events',{'name':'Activities Board GBM'},saveEventIds);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});


asyncTest( "editEventAction: Edit Event in database", function() {
	  var scope = this;
      scope.data = {};
      scope.data.event_id = "";
      scope.data.event = {};
      scope.data.event.timeStart = (new Date()).toString();
      scope.data.event.timeEnd = (new Date()).toString();
      scope.data.event.description = "This is the 2nd coolest event"
      scope.data.event.location = 'Doherty Hall';
      
	  // Fill in the fields of the object to be created.
	  var expected = {};
	  expected.name = 'Activities Board GBM';
	  expected.location = scope.data.event.location;
	  expected.description = scope.data.event.description;
	  expected.hostOrg = 'Activities Board';
	  expected.startTime = scope.data.event.timeStart;
	  expected.endTime = scope.data.event.timeEnd;

      scope.not = "";
      scope.user_id = "";
      
      var callback = function(err, results){
        //console.log(scope.not); 
        //console.log(results[0].notifications);
        ok(compareFields(scope.not, results[0].notifications[0]), 'Fields not correct');
            
        start();
    }
    
    function checkEvent(err, results){
            
            ok(compareFields(scope.expected, results[0]), 'Fields not correct');
    
            scope.user_id = results[0].followers[0];
            scope.app.searchDb('users', {'_id': scope.user_id}, callback);
    }
      
    setTimeout(function() {    

            scope.not = scope.response.things_sent.event.notification;

            scope.app.searchDb('events',{'_id':scope.data.event_id_obj}, checkEvent);       
    }, 1000);

    // Check that the database did what we want.
	  var saveEventId = function( error, result ){     
            scope.data.event_id = result[0]._id.toString();
            scope.data.event_id_obj = result[0]._id;
            
            scope.app.editEventAction(scope.request, scope.response, scope.data);
	  }      
      
      function runIt(){
            scope.app.searchDb('events',{'name':expected.name},saveEventId);
      }
      
	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt);
});


// This tests a basic listStarredEvents Actions.
asyncTest("listStarredEventsAction", function() {
	  var scope = this;

	  scope.eventids = [];

	  scope.data = {};
	  scope.request.user = {};
	  // Check that the database did what we want.

    setTimeout(function() {
		    //console.log(scope.response.things_sent.results);
		    ok(scope.response.things_sent.results.length === 2);
		    start();
    }, 3000);

	  function saveUserId(err, result){
		    if(err){ throw err;}

		    scope.request.user = result[0];

			scope.request.user.savedEvents = scope.request.user.savedEvents.map(function(elem){return elem.toString();})

		    scope.app.listStarredEventsAction(scope.request, scope.response, scope.data);
	  }

	  function runIt(){
		    scope.app.searchDb('users',{'name' : "Mochi"},saveUserId);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});


// This tests a basic listOrgEvents Actions.
asyncTest("listOrgEventsAction", function() {
	  var scope = this;

	  scope.eventids = [];

	  scope.data = {};
	  scope.request.org = {};
	  // Check that the database did what we want.

    setTimeout(function() {
		    //console.log(scope.response.things_sent.results);
		    ok(scope.response.things_sent.results.length === 3);
		    start();
    }, 3000);

	  function saveUserId(err, result){
		    if(err){ throw err;}

		    scope.request.org.id = result[0]._id.toString();

		    scope.app.listOrgEventsAction(scope.request, scope.response, scope.data);
	  }

	  function runIt(){
		    scope.app.searchDb('organizations',{'name' : "Mayur Sasa"},saveUserId);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, []);
});


asyncTest( "eventDetailAction: Fetch Event Info From database", function() {
	  var scope = this;
      scope.hostOrgId = '';

	  scope.data = {};
	  scope.data['event_id'] = {};

	  // Fill in the fields of the object to be created.
	  var expected = {};
	  expected.name = 'Capture the flag';
	  expected.location = 'Resnik House';
	  expected.description = 'Everybody come see resnik house';
	  expected.hostOrg = 'Mayur Sasa';
	  expected.timeStart = new Date(2013, 07, 03, 5, 0, 0);
	  expected.timeEnd = new Date(2013, 07, 03, 8, 0, 0);


	  setTimeout(function() {
		    ok(compareFields(expected, scope.response.things_sent.event), 'Fields not correct');
        //Make assertion
        // After the assertion called, restart the test
        start();
    }, 1000);

	  var getEventId = function( error, result ){
		    scope.data.event_id = result[0]._id.toString();

		    scope.app.eventDetailAction(scope.request, scope.response, scope.data);
	  }

      function getHostOrgId(err, result){
            if(err){ throw err;}

            scope.hostOrgId = result[0]._id;

  		    scope.app.createEvent(expected.name, expected.location, expected.description, expected.timeStart, expected.timeEnd, scope.hostOrgId, ['abc', 'bcd','party'], getEventId);
      }

	  function runIt(){
          scope.app.searchDb('organizations',{'name':expected.hostOrg}, getHostOrgId);
	  }

	  // Call this to open the database, and run the test. ONLY CALL ONCE!
	  this.db.runTest(runIt, ['events']);
});
