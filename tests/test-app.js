test("defaultAction not facebook logged in", function() {
    var expected = {"hello": "world!",
                    "not logged in": "go to /auth/facebook to log in"
                   };
    var response = new MockResponse();
    defaultAction(new MockRequest(), response);
    deepEqual(response.things_sent, expected, 'send hello world and URL');
});

test("defaultAction facebook logged in", function() {
    var expected = {"hello": "world!",
                    "logged in as": "USAR!"
                   };
    var response = new MockResponse();
    var request = new MockRequest();
    request.user = "USAR!";
    defaultAction(request, response);
    deepEqual(response.things_sent, expected, 'send hello world and name');
});

test("nameAction test normal person", function() {
    var expected = {"hello": "John"};
    var response = new MockResponse();
    nameAction(new MockRequest(), response, {name: "John"});
    deepEqual(response.things_sent, expected, 'send hello John');

});

test("nameAction test Anand", function() {
    var expected = "ANAND IS HERE!!!";
    var response = new MockResponse();
    nameAction(new MockRequest(), response, {name: "Anand"});
    deepEqual(response.things_sent, expected, 'send exclaimation');

});

test("postAction test success", function() {
    var expected = {success: true};
    var response = new MockResponse();
    postAction(new MockRequest({stuff: "herp"}), response, {stuff: "herp"});
    deepEqual(response.things_sent, expected, 'send success');

});

test("postAction test fail", function() {
    var expected = {success: false};
    var response = new MockResponse();
    postAction(new MockRequest({stuff: "Herp"}), response, {stuff: "herp"});
    deepEqual(response.things_sent, expected, 'send failure');

});
