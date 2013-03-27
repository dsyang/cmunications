test("defaultAction test ", function() {
    var data = {"hello": "world!"};
    var response = new MockResponse();
    defaultAction(new MockRequest({}), response);
    deepEqual(response.things_sent, data, 'this should be set');
});
