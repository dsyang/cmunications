var Subscription_app = function() {

    this.ui = new Subscription_UI({
        events: {
            searchSubscriptions: this.searchSubscriptions.bind(this)
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
    }


};
