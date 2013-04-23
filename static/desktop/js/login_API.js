(function() {
    window.login_API = {
        send: function(data, done) {
            var request = $.ajax({type: "post",
                                  url: "/auth/login",
                                  data: data
                                 });
            setupCallback(request, done);

        }


        /* on success call done */
    }

    function setupCallback(request, done){
        request.done(function(data) {
            //            console.log("asdfasdf",data);
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
