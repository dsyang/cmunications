/*=============================================
     MongoDB Account Manager
     modified to accept database and multiple account collections by dsyang
=============================================*/

var passwordTools = require('./passwordTools.js');
var async = require('async');

var g = {
    mongoClient: null,
    mongoCollections: {}
}

//===========================
//  API
//===========================

exports.init = function(config, done){
    initMongo(config, onMongoReady);

    function onMongoReady(err){
        if (err)
            throw err;
        done();
    }
}

exports.getAccount = function(username, password, done){
    var collections = [];
    for(k in g.mongoCollections) {
        collections.push({
            name: k,
            col: g.mongoCollections[k]
        })
    };
    async.map(collections,
              mapfn,
              function (err, functions) {
                  if(err) done(err, null);
                  async.parallel(functions, function(err, results) {
                      if(err) done(err, null);
                      var count = 0;
                      var account = null;
                      results.forEach(function(elem) {
                          if(elem !== null) {
                              count++;
                              account = elem;
                          }
                      });

                      if(count === 0) {
                          done("user doesn't exist", null);
                      } else if (count === 1) {
                          if(!passwordTools.validatePassword(password,
                                                            account.password)) {
                              done('bad password', null);
                          } else {
                              done(err, account);
                          }
                      } else if (count > 1) {
                          done("non-unique user: exists organization with same username"
                               , null);
                      }
                  });
              });

    function mapfn(item, callback) {
        callback(null, function(cb) {
            item.col.findOne(
                {name: username} ,
                function(err, result) {
                    if(err) {
                        cb(err);
                    } else if( result === null) {
                        cb(null, null);
                    } else {
                        result.accountType = item.name;
                        cb(err, result);
                    }
                });
        });

    }

}

exports.createAccount = function(username, password, done, collection){
    if(collection !== 'users' && collection !== 'organizations')
        done('invalid collection');
    g.mongoCollections[collection].insert(
        {
            name: username,
            password: passwordTools.saltAndHash(password),
            savedEvents : [ ],
            tags : [ ],
            orgs : [ ],
            subscriptions : [ ],
            notifications : [ ],
        },
        function(err, result){
            if (err && err.err.indexOf('duplicate key error') !== -1)
                done('username already exists', null);
            else if (err)
                done(err, null);
            else
                done(err, result);
        }
    );
}

exports.hashPassword = function(password) {
    return passwordTools.saltAndHash(password);
}

//===========================
//  MONGO INIT
//===========================

function initMongo(mongoConfig, done){

    g.mongoClient = mongoConfig.db;
    openCollections(mongoConfig.collections, done);
}

function openCollections(collections, done){
    async.map(collections,
              transform,
              function(err, functions) {
                  if(err) done(err);
                  async.parallel(
                      functions,
                      function(err, results) {
                          if(err) done(err);
                          done();
                      }
                  );
              });


    function transform(name, done) {
        done(null, function(cb) {
            g.mongoClient.collection(name, onCollectionReady);

            function onCollectionReady(error, collection){
                if (error)
                    cb(error)

                g.mongoCollections[name] = collection;
                g.mongoCollections[name].ensureIndex(
                    'name',
                    { 'unique': true },
                    onUniquenessEnsured
                );
            }

            function onUniquenessEnsured(err){
                cb(err);
            }
        });

    };
}
