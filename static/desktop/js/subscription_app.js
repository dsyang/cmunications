var Subscription_app = function() {

    this.ui = new Subscription_UI({
        events: {
            searchSubscriptions: this.searchSubscriptions.bind(this),
            subscribe : this.subscribe.bind(this),
            unsubscribe: this.unsubscribe.bind(this)
        }
    });

};


Subscription_app.prototype = {

    searchSubscriptions: function(text) {
        window.subscription_API.searchSubscriptions(text, function(err, results) {
            if(err) throw err;
            console.log("got results", results);
            this.ui.showSubscriptions(results.results);
        }.bind(this));
    },

    subscribe: function(thing, text) {
        window.subscription_API.subscribe(thing, function(err, results) {
            if(err) throw err;
            console.log('subscribed', results);
            window.app_API.refreshAccountObject(function(err, results) {
                if(err) throw err;
                this.searchSubscriptions(text);
            }.bind(this));
        }.bind(this));
    },

    unsubscribe: function(thing, text) {
        window.subscription_API.unsubscribe(thing, function(err, results) {
            if(err) throw err;
            console.log('unsubscribed', results);
            window.app_API.refreshAccountObject(function(err, results) {
                if(err) throw err;
                this.searchSubscriptions(text);
            }.bind(this));
        }.bind(this));
    },


};
