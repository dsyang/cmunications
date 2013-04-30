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
            this.searchSubscriptions(text);
        });
    },

    unsubscribe: function(thing, text) {
        window.subscription_API.unsubscribe(thing, function(err, results) {
            if(err) throw err;
            console.log('unsubscribed', results);
            this.searchSubscriptions(text);
        });
    },


};
