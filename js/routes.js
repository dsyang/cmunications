// This file hold all the routes for the app, describing our api endpoints

//`applicationCode.js` holds all the logic for our application.

module.exports = function(app, passport, db) {
    var code = new require("./applicationCode.js").Application(db);


    app.get("/", function(request, response) {
        var data = {};
        code.defaultAction(request, response, data);
    })

    app.get('/auth/facebook', passport.authenticate('facebook'), function() {
        //This callback is never called as we're redirected to facebook.
        return;
    });

    // After the user authenticates with facebook, this route is hit
    // (Configurable of course in app.js)
    app.get(
        '/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: '/' }),
        function(request, response) {
            var data = {};
            code.facebookLoginAction(request, response, data);
        }
    );

    app.get('/auth/organization', function(request, response) {
        var data = {};
        code.organizationLoginAction(request, response, data);
    });

    app.post(
        '/auth/organization',
        passport.authenticate('local', { failureRedirect: '/' }),
        function(request, response) {
            response.send({"hi" : request.user});
        });

    app.get("/:name", function(request, response) {
        var data = {"name": request.params.name}
        code.nameAction(request, response, data);
    });

    app.post("/post", function(request, response) {
        var data = {"stuff": request.body.stuff}
        code.postAction(request, response, data);
    });

    return app;
}
