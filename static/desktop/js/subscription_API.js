(function() {

    window.subscription_API = {

        getSubscriptions: function(done) {
            console.log("getting notifications");
            done(null, []);
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
