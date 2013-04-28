var Notification_app = function() {

    this.ui = new Notification_UI({
        events: {
            getNotifications: this.getNotifications.bind(this)
        }
    });

};

Notification_app.prototype = {
    getNotifications: function() {
        window.notification_API.getNotifications(function(err, results) {
            this.ui.showNotifications(results);
        }.bind(this));
    }

};
