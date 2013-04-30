(function() {

    window.notification_API = {

        getNotifications: function(done) {
            window.app_API.refreshAccountObject(function(err, result) {
                console.log("getting notifications");
                if(err) throw err;
                if(result.success === true) {
                    done(null,  window.app_API.getAccountObject().notifications);
                } else {
                    done(result.message, []);
                }
            });
        },

        clearNotification: function(notification, done) {
            var request = $.ajax({type: 'post',
                                  url: '/notifications/clear',
                                  data: { notification: notification }
                                 });
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
