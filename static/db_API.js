/* wrapper functions for all interactions with database */

var g = {
    mongoClient: null,
    orgCollection: null
}

exports.init = function(done){
    initMongo(done);
}

exports.getAll = function(orgname, done){
    g.orgCollection.find({ username: username }, { content: 1, _id: 1 }).toArray(done);
}

exports.get = function(orgname, _id, done){
    g.orgCollection.findOne({ orgname: orgsname, _id: new mongo.ObjectID(_id) }, { content: 1, _id: 1 }, done);
}

exports.create = function(orgname, content, done){
    g.todosCollection.insert(
        {    
            orgname: orgname,
            content: content
        },
        function(err, result){
            if (err)
                done(err, null);
            else
                done(null, result[0]._id);
        }
    );
}

exports.update = function(username, _id, content, done){
    g.orgCollection.find(
        { 
            username: username,
            _id: new mongo.ObjectID(_id)
        },
        {
            $set: {
                content: content
            }
        },
        { 
            multi: true 
        },
        done
    );
}

exports.delete = function(orgname, _id, done){
    g.todosCollection.remove({ 'orgname': orgname, _id: new mongo.ObjectID(_id) }, done);
}

//===========================
//  MONGO INIT
//===========================

var mongo = require('mongodb');

var mongoConfig = {
    host: global.mongoConfig.host,
    port: global.mongoConfig.port,
    dbName: global.mongoConfig.dbName,
    collectionName: 'todos'
};

function initMongo(done){

    var host = mongoConfig.host;
    var port = mongoConfig.port;

    var optionsWithEnableWriteAccess = { w: 1 };

    g.mongoClient = new mongo.Db(
        mongoConfig.dbName,
        new mongo.Server(host, port),
        optionsWithEnableWriteAccess
    );

    openCollection(mongoConfig.collectionName, done);
}

function openCollection(collectionName, done){
    g.mongoClient.open(onDbReady);

    function onDbReady(error){
        if (error)
            done(error)

        g.mongoClient.collection(collectionName, onCollectionReady);
    }

    function onCollectionReady(error, collection){
        if (error)
            done(error)

        g.orgCollection = collection;

        done();
    }
}
