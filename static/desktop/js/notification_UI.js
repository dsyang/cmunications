var Notification_UI = function(config) {


    this.initDom();
    this.notification_app = config.events;


    this.bindTabs();
    search_app.ui.bindTabs();
    org_app.ui.bindTabs();


}


Notification_UI.prototype = {
    initDom: function() {
        if($('#notificationsPage').length === 0) { //just entering search page
            var page = $('<div id="notificationsPage">');
            $('#app').html("").append(page);
            if($('#notifications').length === 0)
                page.append($('<ul id="notifications">'));
            console.log("creating elements");
        }

        this.dom = {
            notifications: $('#notifications'),
            tab_notify: $('.tab.notify')
        }

    },

    bindTabs: function() {
        this.dom.tab_notify.click(this.notification_app.getNotifications)
    },


    showNotifications: function() {
        this.initDom();
        this.dom.notifications.html("No notifications");
    }
}
