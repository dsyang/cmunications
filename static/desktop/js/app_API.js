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
        }
    }
})();
