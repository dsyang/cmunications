QUnit.module("Application", {
    setup: function() {
        this.request = new MockRequest();
        this.response = new MockResponse();
        this.db = new MockDb();
        this.app = new Application(this.db);
    },
});
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
