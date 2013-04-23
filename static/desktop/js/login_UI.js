var Login_UI = function(config){

	//get all the needed DOM elements
    this.initDom();

    //used in org_app.js
    this.login_app = config.events;

    this.dom.submit.click(this.login_app.submit);
    this.dom.facebook.click(this.login_app.facebook_login);

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
            message: $('#message')
        };
    },

    showMessage: function(message) {
        this.dom.message.html(message);

    }
}
