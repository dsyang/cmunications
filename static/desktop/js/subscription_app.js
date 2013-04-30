var Subscription_app = function() {

    this.ui = new Subscription_UI({
        searchSubscriptions: this.searchSubscriptions
    });

};


Subscription_app.prototype = {

    searchSubscriptions: function(text) {
        window.subscription_API.searchSubscriptions(text, function(err, results) {
            if(err) throw err;
            console.log("got search results", results);
        });
    }


};
