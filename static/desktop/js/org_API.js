/* client side wrapper functions for ajax requests */

(function(){
    window.org_API = {
    	/* get all events */
        getAll: function(done){
            var request = $.ajax({ type: "get", url: "/events/all/"});
            setupCallback(request, done);
        },

        /* get a particular event with given id */
        get: function(id, done){
            var request = $.ajax({ type: "get", url: "/events/" + id + "/details/"});
            setupCallback(request, done);
        },

        /* create a new event */
        create: function(content, done){
            var request = $.ajax({
                type: "post",
                url: "/events/create",
                data: { event: content }
            });
            setupCallback(request, done);
        },

        /* search for an event (case insensitive through all fields) */
        /* 
            content.text = '' to get everything, or "searchString"
            content.startDate = new Date() or undefined;
            content.endDate = new Date() or undefined;
           
            if undefined, means that you ignore search parameter.
            
            Try it in console!
                >content = {text:'hall', endDate: new Date()};
                >window.org_API.search(content,function(err, log){ console.log(log);})
        */       
        
        search: function(content, done){
            var request = $.ajax({
                type: "post",
                url: "/events/search",
                data: { 'text': content.text,
                        'startDate': content.startDate,
                        'endDate': content.endDate
                      }
            });
            setupCallback(request, done);
        },
        
        /* editing an event with given id */
        update: function(id, content, done){
            var request = $.ajax({
                type: "put",
                url: "/events/" + id + "/edit",
                data: { event: content }
            });
            setupCallback(request, done);
        },


        /* delete an event */
        delete: function(id, done){
            var request = $.ajax({ type: "delete", url: "/myevents/" + id });
            setupCallback(request, done);
        },

        isLoggedIn: function(){
            var cookies = document.cookie.split('; ');
            for (var i = 0; i < cookies.length; i++){
                var key = cookies[i].substring(0, cookies[i].indexOf('='));
                var value = cookies[i].substring(cookies[i].indexOf('=')+1);
                if (key === 'username')
                    return true;
            }
            return false;
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
