/*=============================================
     self loading login manager

=============================================*/
var Login_app = function() {
    (function(){

        var g = {
            onLoginSuccess: function(){
                org_app.ui.dom.loginOverlay.hide();
                org_app.showEvents();
            },
            onRegisterSuccess: function(){
                var username = usernameInput.val();
                var password = passwordInput.val();

                login(username, password);
            },
            onRegisterFail: function(msg){
                console.log(msg);
                alert(msg.message);
            },
            onLoginFail: function(msg){
                console.log(msg);
                alert(msg.message);
            }
        }

        //==================
        //  API
        //==================

        window.LoginManager = {
            setLoginSuccess: function(callback){
                g.onLoginSuccess = callback;
            },
            setRegisterSuccess: function(callback){
                g.onRegisterSuccess = callback;
            },
            setRegisterFail: function(callback){
                g.onRegisterFail = callback;
            },
            setLoginFail: function(callback){
                g.onLoginFail = callback;
            }
        }

        //==================
        //  DOM
        //==================

        var loginButton = $('#login_button');
        var registerButton = $('#register_button');

        var usernameInput = $('#username');
        var passwordInput = $('#password');

        loginButton.onButtonTap(function(){
            var username = usernameInput.val();
            var password = passwordInput.val();

            if( username === "") {
                ui.showMessage("Username cannot be empty!");
            } else if (password === "") {
                ui.showMessage("Password field cannot be empty!");
            } else {
                login(username, password);
            }

        });

        registerButton.onButtonTap(function(){
            var username = usernameInput.val();
            var password = passwordInput.val();

            if( username === "") {
                ui.showMessage("Username cannot be empty!");
            } else if (password === "") {
                ui.showMessage("Password field cannot be empty!");
            } else {
                register(username, password);
            }


        });

        //==================
        //  server API
        //==================

        function login(username, password, done){
            var request = $.ajax({
                type: 'post',
                url: '/auth/login',
                data: {
                    username: username,
                    password: password
                }
            });
            setupCallback(request, handleLoginResult);
        }

        function register(username, password, done){
            var request = $.ajax({
                type: 'post',
                url: '/auth/register',
                data: {
                    username: username,
                    password: password
                }
            });
            setupCallback(request, handleRegisterResult);
        }

        function handleRegisterResult(err, result){
            if (err)
                throw err;
            if (result.success === true){
                g.onRegisterSuccess();
            }
            else
                g.onRegisterFail(result);
        }

        function handleLoginResult(err, result){
            if (err)
                throw err;
            if (result.success === true)
                g.onLoginSuccess();
            else
                g.onLoginFail(result);
        }

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


    (function(){

        var g = {
            handleLogoutResult: function(err, result){
                window.location = '/index.html';
            }
        }

        //==================
        //  API
        //==================

        window.LogoutManager = {
            setHangleLogoutResult: function(callback){
                g.handleLogoutResult = callback;
            },
        }

        //==================
        //  DOM
        //==================

        Login_UI.prototype.logoutAction = function(){
            var request = $.ajax({ type: 'post', url: '/auth/logout'});
            setupCallback(request, g.handleLogoutResult);
        };

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

    this.ui = new Login_UI();


}
