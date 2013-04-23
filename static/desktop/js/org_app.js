/* Use org_API, mainatain local data, handle calls to DOM edits from org_UI.js */

var org_app = function(){

    this.myEvents = [];

    this.ui = new UI({
        events: {
            showEvents: this.showEvents.bind(this),
            showEvent: this.showEvent.bind(this),
            edit: this.editEvent.bind(this),
            create: this.createEvent.bind(this),
        }
    });

    this.showEvents();
}


/* the "done" functions take in error, data */

org_app.prototype = {
	// on refreshing, or going to myEvents tab, callback function below
    showEvents: function(){
        window.org_API.getAll(function (err, data_array) {
        	if (err)
             throw err;
        	//data returned in array form, store locally
        	this.myEvents = data_array;
        	this.ui.showEvents(data_array);
        }.bind(this));
    },

    showEvent: function(_id) {
        console.log("grabbing event details");
        window.org_API.get(_id, function(err, result) {
            console.log("grabbed", err, result);
            if (err)
                throw err;
            this.ui.showEvent(result.event);
        }.bind(this));
    },


    createEvent: function(content){
        window.org_API.create(content, function(err, _id){
            if (err)
                throw err;
            var newEvent = {
                content: content,
                _id: _id
            }
        }.bind(this));
    },

    editEvent: function(_id,content) {
    	window.org_API.update(_id,content, function (err, _id) {
    		if (err)
    			throw err;
    		//take the content object and edit the respective fields with the data
    	}.bind(this));
    },
    /*
    deleteEvent: function(_id){
        window.org_API.delete(_id, function(err, result){
            if (err)
                throw err;
            // show all events now, once that's deleted
            this.showEvents();

        }.bind(this));
    } */
}
