(function() {

    window.subscription_API = {

        searchSubscriptions: function(text,done) {
            console.log("searching for "+text);
            var request = $.ajax({ type: 'post',
                                   url: '/subscriptions/search',
                                   data: { text: text} });
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
