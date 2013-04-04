//`applicateCode.js` holds all of the application logic right now.
//All functionality goes in here. These can also be moved into separate files
// later. Be sure to export any function you write or else it can't be tested.

var utils = require('./utils.js');

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
module.exports = utils.exportFunctions([defaultAction,
                                        nameAction,
                                        postAction,
                                        facebookLoginAction,
                                        organizationLoginAction
                                       ]);
