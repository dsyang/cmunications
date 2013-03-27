test("defaultAction test", function() {
    var expected = {"hello": "world!"};
    var response = new MockResponse();
    defaultAction(new MockRequest(), response);
    deepEqual(response.things_sent, expected, 'send hello world');
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
