var Login_UI = function(config){

	//get all the needed DOM elements
    this.initDom();

    this.dom.back.click(this.return_to_home);
}

Login_UI.prototype =
{
    initDom: function(){
        this.dom = {
            login_form: $('#login_form'),
            submit: $('#submit'),
            facebook: $('#facebook'),
            username: $('#username'),
            password: $('#password'),
            message: $('#message'),
            back: $('#left_button')
        };

        if(window.app_API.isLoggedIn() !== false) {
            var app = $('#app');
            var logout = $('<button>').html("Logout").attr({id: 'logout_button'});
            app.html("Are you sure?");
            app.append(logout);
        }
    },

    showMessage: function(message) {
        this.dom.message.html(message);

    },

    return_to_home: function() {
        window.location = 'index.html';
    }

}
