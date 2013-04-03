var express = require("express"),
    mongo = require('mongodb'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
    LocalStrategy = require('passport-local').Strategy;

var connectionURI = process.env.MONGOLAB_URI ||
    "mongodb://localhost:27017/myNotebook";
var port = process.env.PORT || 8889;
var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
var facebookCallbackUrl = process.env.FACEBOOK_CALLBACK_URL ||
    "http://localhost:"+port+"/auth/facebook/callback";

var initializeRoutes = require('./js/routes.js');
var app = express();
var MongoClient = mongo.MongoClient;
var db;

// Only runs if this file is passed into node like "node app.js"
if(__filename == process.argv[1]) {
    initializeApp();
    //set up routes
    initializeRoutes(app, passport);
    MongoClient.connect(connectionURI, dbConnectCallback);

    function dbConnectCallback(err, database) {
        if(err) {
            console.log("ERROR opening database:  "+err);
        } else {
            console.log("Database connection established. Starting app");
            db = database;
            app.listen(port);
            console.log("Created server on port: "+port);
        }
    }

}

function initializeApp() {

    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete Facebook profile is serialized
    //   and deserialized.
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });


    passport.use('local', new LocalStrategy(
        function(username, password, done) {
            console.log(username, password);
            return done(null, {'provider': 'local', "user": username});
        })
                );


    // Use the FacebookStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and Facebook
    //   profile), and invoke a callback with a user object.
    passport.use('facebook', new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: facebookCallbackUrl
    }, function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Facebook profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Facebook account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
                                                 ));

    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'ahsdjfhiwehfuiahdkf' }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    //  app.use(express.static(__dirname + '/public'));

};
