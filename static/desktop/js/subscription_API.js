(function() {

    window.subscription_API = {

        searchSubscriptions: function(text,done) {
            console.log("searching for "+text);
            var request = $.ajax({ type: 'post',
                                   url: '/subscriptions/search',
                                   data: { text: text} });
            setupCallback(request, done);
        },

        subscribe: function(thing, done) {
            console.log("subscribing to ", thing);
            var data = {};
            if(thing.password !== undefined) {
                data.orgids = [thing._id];
                data.tags = [];
            } else {
                data.orgids = [];
                data.tags = [thing.name];
            }
            var request = $.ajax({ type: 'post',
                                  url: '/subscribe',
                                  data: data });
            setupCallback(request, done);
        }

    }

    /* on success call done */
    function setupCallback(request, done){
        request.done(function(data) {
            if (data.err !== undefined)
                done(data.err, null);
            else
                done(null, data);
        });
        request.fail(function(jqXHR, textStatus, err){
            done(err, null);
        });
    }
})();
