var Login_app = function(){

    this.ui = new Login_UI({
        events: {
            submit: this.submit.bind(this),
            facebook: this.facebook_login.bind(this),
        }
    });

}

Login_app.prototype =
{
    submit: function(data) {
        var username = this.ui.dom.username.val();
        var password = this.ui.dom.password.val();
        if( username === "") {
            this.ui.showMessage("Username cannot be empty!");
        } else if (password === "") {
            this.ui.showMessage("Password field cannot be empty!");
        } else {
            window.login_API.send(
                { username: username, password: password},
                function(err, data) {
                    if(err) throw err;
                    console.log("yay data");
                })
            console.log("sending code");
        }
    },

    facebook_login: function() {
        console.log("this shouldn't do anything");
    }


}
