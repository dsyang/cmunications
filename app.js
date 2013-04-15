//App.js is the starting point of our app. The app can be run with the
//`foreman start` or `npm start` commands.
// Addidionally there are other commands for other tasks:
//
//   + `npm start`:  starts the app
//   + `npm test`:   runs tests/testrunner.js
//   + `npm run-script docs`: Generates html docs from these comments
//


//We start by importing essential external libraries needed for the main app.
//The `passport-facebook` is used to handle facebook authentication for
//users and `passport-local` is used to roll our own auth for organization
//accounts.
var express = require("express"),
    mongo = require('mongodb'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    LocalStrategy = require('passport-local').Strategy;



//These configuration variables are necessary to hook the app to the correct
//services. `process.env` is used here so we can store sensitive data in a
//environment variables and not in version control.  By inculding a `.env`
//file in the project directory, The command `foreman start` will add all
//variables declared in there as environment variables.
//
//MONGOLAB_URI is something defined in heroku with the remote mongo URI
var port = process.env.PORT || 8889;
var connectionURI = process.env.MONGOLAB_URI ||
    "mongodb://localhost:27017/cmunications";
var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
var facebookCallbackUrl = process.env.FACEBOOK_CALLBACK_URL ||
    "http://localhost:"+port+"/auth/facebook/callback";


// The `js/routes.js` file exports a function that sets up all of our
// HTTP routes.
var initializeRoutes = require('./js/routes.js');

// We now initialize the app and database client
var app = express();
var MongoClient = mongo.MongoClient;


// The following code only runs if we execute the file using node or foreman.
// This way we can load the code as a library if we want.
if(__filename == process.argv[1]) {
    initializeApp();

    MongoClient.connect(connectionURI, dbConnectCallback);

    function dbConnectCallback(err, database) {
        if(err) {
            console.log("ERROR opening database:  "+err);
        } else {
            console.log("Database connection established. Starting app");

            //`app`, `passport`, and `database` are needed to initialize routes
            // so we case attach routes to the app, declare which ones require
            // authentication, and interact with the database.
            initializeRoutes(app, passport, database);
            app.listen(port);
            console.log("Created server on port: "+port);
        }
    }

}

//`initializeApp()` does all the heavy lifting in configuring and initializing
// thrid party libraries.
function initializeApp() {

    //Passport session setup.
    // This function is used to serialize the user object so we can access it
    // later. Whatever you pass to `done` in `serializeUser` is
    // `obj` in `deserializeUser`
    // And whatever you pass to `done` in `deseerializeUser` is
    // `request.user`

    /* Typically this will be as simple as storing the user
       ID when serializing, and finding the user by ID when deserializing.
     */
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });


    //This sets up facebook authentication.
    // Strategies in Passport require a `verify` function, which accept
    // credentials (in this case, an accessToken, refreshToken, and Facebook
    // profile), and invoke a callback with a user object.
    passport.use('facebook', new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: facebookCallbackUrl
    }, function(accessToken, refreshToken, profile, done) {
        /* In a typical application, you would want
           to associate the Facebook account with a user record in your database,
           and return that user instead.
        */
        return done(null, profile);
    }
                                                 ));


    // This sets up the local strategy, used for organization accounts.
    // whatever data passed as `username=x&password=y` to the POST
    //request that calls `passport.authenticate('local')` middleware
    //will be passed into this function as `username` and `password`.
    passport.use('local', new LocalStrategy(
        function(username, password, done) {
            console.log(username, password);
            return done(null, {'provider': 'local', "user": username});
        })
                );


    // Finally we register all the middleware we'll be using.
    // `passport.session()` allows us to support presistent login sessions.
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'ahsdjfhiwehfuiahdkf' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    /*  app.use(express.static(__dirname + '/public'));*/

};
