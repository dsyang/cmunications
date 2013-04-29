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

        star: function(event_id, done) {
            var request = $.ajax({
                type: 'post',
                url: '/events/'+event_id+'/star/'
            });
            setupCallback(request, done);
        },

        unstar: function(event_id, done) {
            var request = $.ajax({
                type: 'post',
                url: '/events/'+event_id+'/unstar/'
            });
            setupCallback(request, done);
            console.log("unstarring Event: "+event_id);
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
