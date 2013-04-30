//`applicateCode.js` holds all of the application logic right now.
//All functionality goes in here. These can also be moved into separate files
// later. Be sure to export any function you write or else it can't be tested.

var utils = require('./utils.js');
var ObjectID = require('mongodb').BSONPure.ObjectID;
var async = require('async');


function Application(db) {

    // The names of the collections which are going to be used with the database.
    var collUsers = 'users';
    var collOrgs = 'organizations';
    var collEvents = 'events';
    var collTags = 'tags';

    /* Generic Utility Functions that won't be exposed */

    // Callback function to log what happens
    var logger = function(error, result){
        if (error)
            throw error;
        console.log(result);
    }

    var throwError = function(error){
        if(error)
            throw error;
    }

    // Calls function with arg,
    // Special case for find - arrayOfArgs = [query, callback]
    //funcName: 'insert', 'find', 'update', 'remove'
    var getCallbackWithArgs = function(funcName, arrayOfArgs){
        return (function(error, collection){
            if (error)
                throw error;

            //arrayOfArgs.push(throwError);
            //console.log(arrayOfArgs);

            if (funcName === 'insert')
                collection.insert.apply(collection, arrayOfArgs);
            else if (funcName === 'find'){
                var results = collection.find(arrayOfArgs[0]).toArray(arrayOfArgs[1]);
            }
            else if (funcName === 'update')
                collection.update.apply(collection, arrayOfArgs);
            else if (funcName === 'remove')
                collection.remove.apply(collection, arrayOfArgs);
            else
                throw "Invalid function called of insert, find, update, remove";
        });
    }

    var isValidCollectionName = function(collectionName){
        return (collectionName === collUsers ||
                collectionName === collOrgs ||
                collectionName === collEvents ||
                collectionName === collTags);
    }
    /* Templates for the database objects*/


    function User(){
        this.name = "";
        this.password = "";

        // Saved by name
        this.tags = [];

        // Saved by plaintext
        this.notifications = [];

        // Saved by reference.
        this.savedEvents = [];
        this.orgs = [];
    }

    function Organization(){
        this.name = "";
        this.password = "";
        this.description = "";

        // Saved by reference.
        this.events = [];
        this.subscribers = [];
    }

    function Event(){
        this.name = "";
        this.location = "";
        this.timeStart = new Date();
        this.timeEnd = new Date();
        this.description = "";

        // By Name
        this.tags = [];

        this.hostOrg;

        // By reference
        this.followers = [];
    }

    function Tag(){
        this.name = "";

        // By reference
        this.events = [];
        this.subscribers = [];
    }

    function Notification(){
        this.event_id = "";
        this.checked = false;
        this.dateUpdated = "";

        // Event name has changed.
        this.text = "";
    }


    /* Some conventions:
       create - Making a new database object from scratch.
       delete - Deleting an object completely from the database.
       add - Add a reference to another part of the database (e.g. addEventsToUser)
       remove - Removing a reference to another part of the database (e.g. removeEventFromUser)
    */

    //---------------------------------------------------------------------------------------------
    /* Here's the set of create functions, used to create database objects.
     * We want to separate the database object definition above
     * from sanitation checking
     *
     */

    // Creates a user and adds it to the database.
    function createUser(name, password, callback){
        var user = new User();
        user.name = name;
        user.password = password;

        if(!callback){
            callback = logger;
        }

        db.collection(collUsers, getCallbackWithArgs('insert', [user,{safe:true}
                                                                , callback]));
    }

    // Creates an org and adds it to the database.
    function createOrganization(name, password, description, callback){
        var org = new Organization();
        org.name = name;
        org.password = password;
        org.description = description;

        if(!callback){
            callback = logger;
        }

        db.collection(collOrgs, getCallbackWithArgs('insert', [org, {safe:true},
                                                               callback]));
    }

     // Creates an event and adds it to the database.
    function createEvent(name, location, description, startTime,
                         endTime, hostOrgId, tags, callback){
        // Check that startTime < endTime
        var scope = this;

        var event = new Event();
        event.name = name;
        event.location = location;
        event.description = description;
        event.hostOrg = '';
        event.timeStart = startTime;
        event.timeEnd = endTime;
        event.tags = tags;

        if(!callback){
            callback = logger;
        }

        // This function is necessary to make sure our function is called
        // with the full event object.
        function callbackContext(){
            callback(null, [event]);
        }

        function getTagsFromDb(err, results){
            if(err){ throw err;}

            addTagsToDb(event.tags,callbackContext);
        }

        function updateOrg(err, listOfDocs){
            event._id = listOfDocs[0]._id;
            addEventsToOrg(hostOrgId, [event._id], getTagsFromDb);
        }

        function insertEvent(err, results){
            if(err){ throw err;}
            //console.log("from insert Event");
            //console.log(results);
            event.hostOrg = results[0].name;

            db.collection(collEvents, getCallbackWithArgs('insert', [event, {safe:true}, updateOrg]));
        }

        function getHostOrgName(){
            searchDb(collOrgs, {'_id':hostOrgId}, insertEvent)
        }

        getHostOrgName();
    }

    // Creates a tag and adds it to the database.
    function createTag(name, callback){
        var tag = new Tag();
        tag.name = name;

        if(!callback){
            callback = logger;
        }

        db.collection(collTags, getCallbackWithArgs('insert', [tag, {safe:true},
                                                               callback]));
    }

    // Creates a notification object to be kept in each user.
    //      event_id should be a string!!!!
    function createNotification(event_id, eventName, date){
        var not = new Notification();

        not.event_id = event_id;
        not.text = eventName + " has been changed.";
        not.dateUpdated = date;

        return not;
    }

    // Search for a field in the database.
    function searchDb(collectionName, query, callback){
        db.collection(collectionName, getCallbackWithArgs('find',[query, callback]))
    }

    // Update field in collection
    function updateStringField(collectionName, query, field, value, callback){
        if(isValidCollectionName(collectionName)){
            var update = {}, partialUpdate = {};
            partialUpdate[field] = value;
            update['$set'] = partialUpdate;
            //callback();
            db.collection(collectionName,
                          getCallbackWithArgs('update', [query, update,{'multi':true},
                                                         callback]));
        }
    }

    // Update fields in collection
    function updateFields(collectionName, query, fields, callback){
        if(isValidCollectionName(collectionName)){
            var update = {}, partialUpdate = {};
            partialUpdate = fields
            update['$set'] = partialUpdate;
            //callback();
            db.collection(collectionName,
                          getCallbackWithArgs('update', [query, update,{'multi':true},
                                                         callback]));
        }
    }


    // Add to array field in collection
    // value is expected to be an array of values toAdd
    function addToArrayField(collectionName, query, field, value, callback){
        if(isValidCollectionName(collectionName)){
            var update = {}, partialUpdate = {}, partialpartialUpdate = {};

            partialpartialUpdate['$each'] = value;
            partialUpdate[field] = partialpartialUpdate;
            update['$addToSet'] = partialUpdate;

            db.collection(collectionName,
                          getCallbackWithArgs('update', [query, update, {'multi':true},
                                                         callback]));

        }
    }



    // Remove from array field in collection
    //
    // value is an array of values from which to remove.
    function removeFromArrayField(collectionName, query, field, value, callback){
        if(isValidCollectionName(collectionName)){
            var update = {}, partialUpdate = {};
            partialUpdate[field] = value;
            update['$pullAll'] = partialUpdate;
            console.log(update);
            db.collection(collectionName,
                          getCallbackWithArgs('update', [query, update, {'multi':true},
                                                         callback]));

        }
    }


    //=====================================
    // UTILITIES FOR ACTIONS
    //=====================================
    // These functions don't do any sanitation checking. All things passed here need to be safe!

    // Adds an event to a user, by id.
    function addEventsToUser(userid, eventids, cb){
        var query = {};
        query['_id'] = userid;

        addToArrayField(collUsers, query, 'savedEvents', eventids, cb);
    }

    // Adds an event to a user, by id.
    function removeEventsFromUser(userid, eventids, cb){
        var query = {};
        query['_id'] = userid;

        removeFromArrayField(collUsers, query, 'savedEvents', eventids, cb);
    }


    // Adds an event to a user, by id.
    function addEventsToOrg(orgid, eventids, cb){
        var query = {};
        query['_id'] = orgid;

        addToArrayField(collOrgs, query, 'events', eventids, cb);
    }

    // Adds users to event, by id. userids should be an array of ids.
    function addUsersToEvent(eventid, userids, cb){
        var query = {};
        query['_id'] = eventid;

        addToArrayField(collEvents, query, 'followers', userids, cb);
    }

    // Adds users to event, by id. userids should be an array of ids.
    function removeUsersFromEvent(eventid, userids, cb){
        var query = {};
        query['_id'] = eventid;

        removeFromArrayField(collEvents, query, 'followers', userids, cb);
    }



    // Adds organizations to a user.
    function addOrganizationsToUser(userid, orgids, cb){
        var query = {};
        query['_id'] = userid;

        addToArrayField(collUsers, query, 'orgs', orgids, cb);
    }

    // Adds organizations to a user.
    function removeOrganizationsFromUser(userid, orgids, cb){
        var query = {};
        query['_id'] = userid;

        removeFromArrayField(collUsers, query, 'orgs', orgids, cb);
    }

    // Adds tagss to a user.
    function addTagsToUser(userid, tags, cb){
        var query = {};
        query['_id'] = userid;

        addToArrayField(collUsers, query, 'tags', tags, cb);
    }

    // remove Tags from a user.
    function removeTagsFromUser(userid, tags, cb){
        var query = {};
        query['_id'] = userid;

        removeFromArrayField(collUsers, query, 'tags', tags, cb);
    }



    function addTagsToDb(tags, callback){
        function cb(err, results){
            var allTags = results.map(function(elem){
                return elem.name;
            });

            var tagsToAdd = tags.filter(function(elem){
                if(allTags.indexOf(elem) === -1){
                    return true;
                }
                else{
                    return false;
                }
            });


            tagsToDb(tagsToAdd);
        }

        function tagsToDb(tags){
            //console.log(tags.length);
            if(tags.length === 0){
                callback();
                return;
            }

            var nextTag = tags.shift();

            createTag(nextTag, cb);

            function cb(err, stuff){
                if(err){ throw err;}
                tagsToDb(tags);
            }
        }

        searchDb(collTags, {}, cb);
    }



    //=====================================
    // ACTIONS
    //=====================================

    function success(name, obj) {
        var res =  {'success': true};
        res[name] = obj;
        return res;
    }

    function fail(message) {
        return {'success': false,
                'message': message};
    }

    function clearNotificationAction(request, response, data) {
        var notifications = data.account.notifications;
        console.log("clearing notifications");
        console.log(notifications[0].dateUpdated);
        console.log(typeof(notifications[0].dateUpdated));
        console.log(data.notification.dateUpdated);
        console.log(typeof(data.notification.dateUpdated));
        console.log(typeof(data.account._id));
        console.log("her");
        var idx = -1;
        var length = notifications.length;
        for(var i = 0; i < length; i++) {
            var date = new Date(data.notification.dateUpdated);
            if(notifications[i].event_id.toString() === data.notification.event_id
               && notifications[i].dateUpdated.getTime() === date.getTime())
                idx = i;
        }
        if(idx === -1) {
            response.send(fail("no matching notification"));
        } else {
            removeFromArrayField(collUsers, {_id : data.account._id},
                               'notifications', [notifications[idx]],
                               function(err, result) {
                                   console.log(err, result);
                                   if(err) response.send(fail(err));
                                   response.send(success('result', result));
                               })
        }
    }

    // Get the notifications
    function getNotificationsAction(request, response){
        var id = ObjectID(request.user.id);

        function cb(err, result) {
            if(err){ response.send(fail(err));}
            else if(result.length == 0){
                response.send(fail("No results found."));
            }
            else{ response.send(success('notifications', result[0].notifications));
            }
        }

        searchDb(collUsers, {'_id' : id}, cb);
    }

    //given data.text, start, end, return all events in the period
    /*data = { text: request.body.text,
      start: request.body.startDate,
      end: request.body.endDate
      };
    */
    function searchAction(request, response, data) {
        function cb(err, result) {
            if(err) response.send(fail(err));

            var sorted = result.sort(function (event1, event2) {
                return event1.name.localeCompare(event2.name);
            });


            response.send(success('results', sorted));
        }


        var query = {};

        var regexPat = ".*" + data.text + ".*";
        var regexMod = 'i'

        var patt = new RegExp(regexPat,regexMod);

        query['$or'] = [{'name' : patt},
                        {'description' : patt}, {'location' : patt}, {'hostOrg' : patt}];

        if(data.startDate){
            var startTime = new Date(data.startDate);
            console.log(startTime);
            query['startTime'] = {'$gte': startTime};
        }
        if(data.endDate){
            var endTime = new Date(data.endDate);
            console.log(endTime);
            query['endTime'] = {'$lte': endTime};
        }

        // IS DATA.TXT ACTUALLY A QUERY OBJECT?

        searchDb(collEvents, query, cb);
    }

    //given data.text, start, end, return all events in the period
    /*data = { text: request.body.text,
      start: request.body.startDate,
      end: request.body.endDate
      };
    */

    function searchSubscriptionsAction(request, response, data) {
        var scope = this;
        scope.results = {
                        'orgs' : '',
                        'tags' : ''
                         };

        function cb2(err, result) {
            if(err) response.send(fail(err));

            scope.results.tags = result;

            response.send(success('results', scope.results));
        }


        function cb(err, result) {
            if(err) response.send(fail(err));

            scope.results.orgs = result;

            searchDb(collTags, scope.query, cb2);
        }


        scope.query = {};

        var regexPat = ".*" + data.text + ".*";
        var regexMod = 'i'

        var patt = new RegExp(regexPat,regexMod);

        scope.query['name'] = patt;

        searchDb(collOrgs, scope.query, cb);
    }


    //given data,orgs or data.tags, add to request.user's tags/organizations
    /*
      {orgids: request.body.orgids,
      tags: request.body.tags
      };
    */
    function subscribeAction(request, response, data) {
        var id = data.user._id;
        var finalResult = {};
        //console.log(data.orgids, data.tags);
        //console.log("data!", data);
        var orgids = [];
        if(data.orgids !== undefined) {
            orgids = data.orgids.map(function(elem){return ObjectID(elem);})
        }

        if(orgids) {
            addOrganizationsToUser(id, orgids, cb);
        }
        else{
            cb();
        }
        function cb(err, result) {

            if(err){ response.send(fail(err));}
            finalResult = result;


            if(data.tags) {
                addTagsToUser(id, data.tags, cb2);
            }
            else{
                cb2(err, result);
            }
        }
        function cb2(err, result) {
            if(err){ response.send(fail(err));}

            finalResult = result;
            response.send(success('result', result));
        }
    }

    function unsubscribeAction(request, response, data) {
        var id = data.user._id;
        var finalResult = {};
        console.log("data!", data);
        //console.log(data.orgids, data.tags);

        var orgids = [];
        if(data.orgids !== undefined) {
            for(var i = 0; i < data.orgids.length; i++) {
                orgids.push(ObjectID(data.orgids[i]));
            }
        }

        if(orgids) {
            removeOrganizationsFromUser(id, orgids, cb);
        }
        else{
            cb();
        }
        function cb(err, result) {

            if(err){ response.send(fail(err));}
            finalResult = result;


            if(data.tags) {
                removeTagsFromUser(id, data.tags, cb2);
            }
            else{
                cb2(err, result);
            }
        }
        function cb2(err, result) {
            if(err){ response.send(fail(err));}

            finalResult = result;
            response.send(success('result', result));
        }
    }

    //given data.event_id
    function eventDetailAction(request, response, data) {
        var id = ObjectID(data.event_id);

        searchDb(collEvents, {'_id' : id}, cb);
        function cb(err, result) {
            if(err){
                response.send(fail(err));
            } else if(result[0]){
                response.send(success('event', result[0]));
            } else {
                response.send(fail('no event found'));
            }
        }
    }

    //given data.event_id
    function starEventAction(request, response, data) {
        //console.log("Route called.");
        var event_id = ObjectID(data.event_id);
        var user_id = ObjectID(String(data.user._id));
        searchDb(collEvents, {'_id' : event_id}, cb);
        function cb(err, result) {
            if(err) response.send(fail(err));
            if(result.length === 0) response.send(fail('no event found'));
            addEventsToUser( user_id, [event_id], cb2);
        }
        function cb2(err,result){
            if(err){
                response.send(fail(err));
            }
            addUsersToEvent(event_id,[user_id], cb3);
        }
        function cb3(err, result) {
            if(err){
                response.send(fail(err));
            } else if(result > 0 ){
                response.send(success('success', true));
            } else {
                response.send(fail('no event found'));
            }
        }

    }

    //given data.event_id
    function unstarEventAction(request, response, data) {
        var event_id = ObjectID(data.event_id);
        var user_id = ObjectID(String(data.user._id));
        searchDb(collEvents, {'_id' : event_id}, cb);
        function cb(err, result) {
            if(err) response.send(fail(err));
            if(result.length === 0) response.send(fail('no event found'));
            removeEventsFromUser( user_id, [event_id], cb2);
        }
        function cb2(err,result){
            if(err){
                response.send(fail(err));
            }
            removeUsersFromEvent(event_id,[user_id], cb3);
        }
        function cb3(err, result) {
            if(err){
                response.send(fail(err));
            } else if(result > 0 ){
                response.send(success('success', true));
            } else {
                response.send(fail('no event found'));
            }
        }
    }


    function listMyEventsAction(request, response, data) {
        var user = data.user;
        var savedEvents = [];
        if(user.savedEvents !== undefined) {
            savedEvents = user.savedEvents;
            // for(var i = 0; i < user.savedEvents.length; i++) {
            //     console.log(user.savedEvents[i]);
            //     savedEvents.push(ObjectID(user.savedEvents[i]));
            // }
        }
        var savedOrgIds = [];
        if(user.orgs !== undefined) {
            savedOrgIds = user.orgs;
//            for(var i = 0; i < user.orgs.length; i++) {
//                savedOrgIds.push(ObjectID(user.orgs[i]));
//            }
        }
        var savedTags = [];
        if(user.tags !== undefined) {
            savedTags = user.tags
        }

        var querySavedEvents = {'_id': {$in: savedEvents}};
        var queryEventsFromSavedTags = {'tags' : {$elemMatch:
                                                  { $in: savedTags }}};

        var queryOrgNames = {'_id': {$in: savedOrgIds}};
        //grab events
        searchDb(collEvents, querySavedEvents, callback1);
        function callback1 (err, savedEvents) {
            if(err) throw err;
            //create array of org names
            searchDb(collOrgs, queryOrgNames, callback2);
            function callback2 (err, savedOrgs) {
                if(err) throw err;
                var savedOrgNames = [];
                if(savedOrgs !== undefined) {
                    for(var i = 0; i < savedOrgs.length; i++) {
                        savedOrgNames.push(savedOrgs[i].name);
                    }
                }
                var queryEventsFromSavedOrgs = {'hostOrg': {$in: savedOrgNames}};
                searchDb(collEvents, queryEventsFromSavedOrgs, callback3);

                function callback3 (err, savedOrgEvents) {
                    if(err) throw err;
                    searchDb(collEvents, queryEventsFromSavedTags, callback4);

                    function callback4 (err, savedTagEvents) {
                        if(err) throw err;
                        var allevents = [].concat(savedEvents,
                                                  savedOrgEvents,
                                                  savedTagEvents);
                        var sorted = allevents.sort(function (date1, date2) {
                            if (date1.timeStart > date2.timeStart) return 1;
                            if (date1.timeStart < date2.timeStart) return -1;
                            return 0;
                        });
                        response.send(success('events', sorted));
                    };
                };
            };
        };
    }


    //return all starred events for request.user
    function listStarredEventsAction(request, response, data) {
        var savedEvents = request.user.savedEvents.map(function(elem){
            return ObjectID(elem);
        });
        var query = {'_id': {'$in': savedEvents}};
        searchDb(collEvents, query, finalCallback);

        function finalCallback(err, results){
            if(err){ throw err;}
            response.send(success('results', results));
        }
    }

    //list events for request.org.id
    function listOrgEventsAction(request, response, data){
        var scope = this;

        var orgName = data.user.name;


        var query = {'hostOrg': orgName};
        searchDb(collEvents, query, finalCallback);

        function finalCallback(err, results){
            if(err){ throw err;}
            response.send(success('events', results));
        }
    }

    //given an event in data.event
    function createEventAction(request, response, data) {
        console.log("stuff");
        var dStart = new Date(data.event.timeStart);
        var dEnd = new Date(data.event.timeEnd);
        var tags = [];
        if(data.event.tags){
            tags = data.event.tags;
        }
        createEvent(data.event.name, data.event.location, data.event.description, dStart, dEnd, ObjectID(data.event.hostOrgId), tags, cb);

        function cb(err, result) {
            if(err) throw err;
            //console.log(result);
            response.send(success('_id', result));
        }

        //console.log(data.event);
        response.send(success('dummy', 42));
    }

    //given an event in data.event and a data.event_id
    function editEventAction(request, response, data) {
        var event_id = ObjectID(data.event_id);
        searchDb(collEvents, {'_id': event_id}, cb);
        function cb(err, result) {
            if(err) throw err;
            //console.log(result);
            var dStart = new Date(data.event.timeStart);
            var dEnd = new Date(data.event.timeEnd);
            var tags = [];
            if(data.event.tags){
                tags = data.event.tags
            }

            data.event.timeStart = dStart;
            data.event.timeEnd = new Date();
            delete data.event._id;


            var not = createNotification(event_id, result[0].name, new Date());

            var query = {};
            query['_id'] = {'$in': result[0].followers};

            addToArrayField(collUsers, query, 'notifications', [not], cb2);

            function cb2(err, result){
                if(err) throw err;
                addTagsToDb(tags,cb3);
            }
            function cb3(err, result){
                if(err) throw err;
                updateFields(collEvents, {'_id' : event_id}, data.event, cb4);
            }
            function cb4(err, result) {
                if(err) throw err;
                response.send(success('event', {'event_id': event_id,
                                                'result': result,
                                                'notification': not
                                               }
                                     ));
            }
        }

    }

    //list all events
    function listEventsAction(request, response, data) {
        function sendResults(err,listOfDocs){
            var sorted = listOfDocs.sort(function (date1, date2) {
                if (date1.timeStart > date2.timeStart) return 1;
                if (date1.timeStart < date2.timeStart) return -1;
                return 0;
            });

            response.send( { 'success': true,
                             'events': sorted });
        }

        searchDb(collEvents, {}, sendResults);
    };

    //list all organizations
    function listOrganizationAction(request, response, data) {
        function sendResults(err,listOfDocs){
            var sorted = listOfDocs.sort(function (event1, event2) {
                return event1.name.localeCompare(event2.name);
            });

            response.send( { 'success': true,
                             'organizations': sorted });
        }

        searchDb(collOrgs, {}, sendResults);
    }


    //list all tags
    function listTagsAction(request, response, data) {
        function sendResults(err,listOfDocs){
            response.send( { 'success': true,
                             'tags': listOfDocs });
        }

        searchDb(collTags, {}, sendResults);
    }


    //given data.name, data.password, data.description
    function organizationCreateAction(request, response, data) {
        function cb(err, result) {
            if (err) throw err;

            response.send( { 'success': true,
                             'organization': result });
        }

        createOrganization(data.name, data.password, data.description, cb);
    }


    function loginAction(request, response, data) {
        console.log("stuff");
        response.send(success('dummy', 42));
    }

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
    return utils.exportFunctions([defaultAction,
                                  nameAction,
                                  postAction,
                                  searchAction,
                                  clearNotificationAction,
                                  getNotificationsAction,
                                  subscribeAction,
                                  unsubscribeAction,
                                  searchSubscriptionsAction,
                                  eventDetailAction,
                                  starEventAction,
                                  unstarEventAction,
                                  listMyEventsAction,
                                  listStarredEventsAction,
                                  listOrgEventsAction,
                                  createEventAction,
                                  editEventAction,
                                  listEventsAction,
                                  listOrganizationAction,
                                  listTagsAction,
                                  loginAction,
                                  facebookLoginAction,
                                  organizationLoginAction,


                                  createUser,
                                  createOrganization,
                                  createEvent,
                                  createTag,
                                  searchDb,
                                  updateStringField,
                                  addToArrayField,
                                  removeFromArrayField,
                                  addEventsToUser,
                                  addEventsToOrg,
                                  addOrganizationsToUser,
                                  addTagsToUser,
                                 ]);
}

module.exports.Application = Application;
