var Notification_UI = function(config) {


    this.initDom();
    this.notification_app = config.events;


    this.bindTabs();


}


Notification_UI.prototype = {
    initDom: function() {
        if($('#notificationsPage').length === 0) { //just entering search page
            var page = $('<div id="notificationsPage">');
            // $('#eventInfo').html("");
            // $('.myevents').html("");
            // $('#searchEventsPage').html(""); 
            $('#app').html("").append(page);
            if($('#notifications').length === 0)
                page.append($('<ul id="notifications" class="myevents">'));
            console.log("creating elements");
        }

        this.dom = {
            notifications: $('#notifications'),
            tab_notify: $('.tab.notify'),
            tab1_contain: $('.contain.tab1'),
            tab2_contain: $('.contain.tab2'),
            tab3_contain: $('.contain.tab3'),
            tab4_contain: $('.contain.tab4'),
            topleft_button: $('#left_button'),
            topright_button: $('#right_button'),         
        };

    },

    bindTabs: function() {
        this.dom.tab_notify.click(this.notification_app.getNotifications);
    },


    showNotifications: function(results) {
        this.initDom();
        this.dom.tab3_contain.attr({"id":"selected"});
        this.dom.tab2_contain.attr({"id":""});
        this.dom.tab1_contain.attr({"id":""});
        this.dom.tab4_contain.attr({"id":""});
        this.dom.topleft_button.html("Settings");
        console.log("results");
        console.log(results);
        if(results === undefined || results.length === 0) {
            this.dom.notifications.html("No notifications");
        } else {
            this.dom.notifications.html("");
            results.forEach(function(elem) {
                var li = this.generate_notification(elem, results);
                this.dom.notifications.append(li);
            }.bind(this));
        }
    },


    generate_notification: function(elem, results) {
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
        li.append(clearButton);
        var that = this;
        infoButton.click(function() {
            function backfn() {
                that.showNotifications(results);
            }
            org_app.showEvent(elem.event_id, backfn);
        });
        clearButton.click(function() {
            window.notification_API.clearNotification(
                elem, function(err, result) {
                    if (err !== null) throw err;
                    console.log(result);
                    console.log("easy",results.indexOf(elem));
                    if(result.success === true) {
                        window.app_API.refreshAccountObject(function(err, result) {
                            if(err !== null) throw err;
                            var idx = results.indexOf(elem);
                            if(idx === -1) {
                                that.showNotifications(results);
                            } else {
                                results.splice(idx,1);
                                that.showNotifications(results);
                            }
                        });
                    }
                });
        });

        return li;
    }
}
