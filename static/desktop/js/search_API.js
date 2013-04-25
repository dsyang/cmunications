(function() {
    window.search_API = {
        /* get a particular event with given id */
        doSearch: function(query, done){
            console.log("doing search");
            var request = $.ajax({ type: "post",
                                   url: "/search",
                                   data: query
                                 });
            setupCallback(request, done);
        }
    };


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
