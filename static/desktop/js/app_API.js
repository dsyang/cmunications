(function() {

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


    window.app_API = {
        isLoggedIn: function(){
            var cookies = document.cookie.split('; ');
            for (var i = 0; i < cookies.length; i++){
                var key = cookies[i].substring(0, cookies[i].indexOf('='));
                var value = cookies[i].substring(cookies[i].indexOf('=')+1);
                if (key === 'username') {
                    return value;
                }
            }
            return false;
        },
        getAccountObject: function() {
            if(window.app_API.isLoggedIn() === false) {
                return null;
            } else {
                var cookies = document.cookie.split('; ');
                for (var i = 0; i < cookies.length; i++){
                    var key = cookies[i].substring(0, cookies[i].indexOf('='));
                    var value = cookies[i].substring(cookies[i].indexOf('=')+1);
                    if (key === 'account') {
                        return JSON.parse(unescape(value));
                    }
                }
            }
        },
        refreshAccountObject: function(done) {
            var request = $.ajax({type:'get',
                                  url: '/auth/refresh'});
            setupCallback(request, done);
        },

        getCurrentApp: function () {
            var notification =  { app: notification_app,
                                  action: notification_app.getNotifications.bind(notification_app) };
            var search = { app: search_app,
                           action:
                           search_app.ui.showResults.bind(search_app.ui) };
            var org = { app: org_app,
                        action: org_app.showEvents.bind(org_app) };


            if($("#notificationsPage").length !== 0) {
                console.log($("#notificationsPage"));
                return { current: notification,
                         left: search,
                         right: null };
            } else if($("#searchEventsPage").length !== 0) {
                console.log($("#searchEventsPage"));
                return { current: search,
                         left: org,
                         right: notification
                       };
            } else if($("#starredEventsPage").length !== 0) {
                console.log($("#starredEventsPage"));
                return { current: org,
                         left: null,
                         right: search };
            } else {
                return null;
            }
        },

        setup_swipe_gestures: function() {

            $('#app').swipe( {
                swipeLeft: function() {
                    var app = window.app_API.getCurrentApp();
                    if(app.right !== null) {
                        app.right.action();
                    }
                },
                swipeRight: function() {
                    var app = window.app_API.getCurrentApp();
                    if(app.left !== null) app.left.action();
                },
                threshold: 50,
                allowPageScroll:"vertical"
            });
        }
    };
})();
