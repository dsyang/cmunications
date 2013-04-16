var utils = require('../js/utils.js');
var mongo = require('mongodb');

function MockResponse() {
    this.sent = false;
    this.things_sent = undefined;
}

MockResponse.prototype.send = function(obj) {
    if(this.sent === false) {
        this.things_sent = obj;
        this.sent = true;
    }
}

function MockRequest(body) {
    this.body = body;
}

function MockDb() {	
	var scope = this;

	var host = 'localhost';
	var port = mongo.Connection.DEFAULT_PORT;

	var optionsWithEnableWriteAccess = { w: 1 };
	var dbName = 'testDb';
	
	this.client = new mongo.Db(
					dbName,
					new mongo.Server(host, port),
					optionsWithEnableWriteAccess
				);
				
	// Runs the test function! Only call this once per test.
	this.client.runTest = function(testFunction, arrayCollsToClear){
			
		if(arrayCollsToClear === undefined){
			arrayCollsToClear = [];
		}
		
		// Meant to clear the collection before starting the test.
		function clearDbs(error){
			if(error)
				error;

			var index = 0;

			// Clears the collections in collsToClear
			function clearCol(){	
				if(index >=0 && index >= arrayCollsToClear.length){
					testFunction();
				}
				else{
					scope.client.collection(arrayCollsToClear[index], function(error, collection){
						if(error)
							error;
						
						//console.log("Cleared Collection: " + index);
						index++;
						
						collection.remove({},{},clearCol);
					});	
				}
			}
			
			clearCol();
		}
		
		function onDbReady(error){
			if(error)
				error;
				
			testFunction();
		}
	
		scope.client.open(clearDbs);	
	}	
	
	this.client.closeDb = function(){
		scope.client.close();
	}
}

module.exports = utils.exportFunctions([MockRequest, MockResponse, MockDb]);
