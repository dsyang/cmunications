(function() {
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
