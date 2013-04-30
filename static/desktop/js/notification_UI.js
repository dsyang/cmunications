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
                page.append($('<ul id="notifications" class="myevents">'));
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


    showNotifications: function(results) {
        this.initDom();
        if(results.length === 0) {
            this.dom.notifications.html("No notifications");
        } else {
            this.dom.notifications.html("");
            results.forEach(function(elem) {
                var li = this.generate_notification(elem, function() {
                    this.showNotifications(results);
                }.bind(this));
                this.dom.notifications.append(li);
            }.bind(this));
        }
    },


    generate_notification: function(elem, backfn) {
        var li = $('<li>');
        var text = $('<p>').html(elem.text);
        var date = (new Date(elem.dateUpdated)).toDateString();
        var time = org_app.ui.generateTime(new Date(elem.dateUpdated));
        var updateTime = $('<p class="time">').html(date + ", " + time);
        var infoButton = $('<div class="more">').html("<a> </a>");
        var clearButton = $('<a class="close">').html('[x]');

        li.append(infoButton);
        li.append(text);
        li.append(updateTime);
        infoButton.click(function() {
            org_app.showEvent(elem.event_id, backfn);
        });
        clearButton.click(function() {

        });
        return li;
    }
}
