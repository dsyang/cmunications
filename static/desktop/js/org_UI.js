/* handle all DOM manipulation, using org_app.js */


var UI = function(config){

	//get all the needed DOM elements
    this.initDom();
    this.allEvents = [];
    this.edit_mode = false;
    this.create_mode = false;

    //used in org_app.js
    this.org_app = config.events;

    //on clicking the tab show all events BIND THIS?
    this.bindTabs();
}

UI.prototype =
{
    hashtags: function (tags) {
        var tagList = tags.split(",").map(function (s) { return s.trim();});
        tagList = tagList.map(function(s) { if(s[0] === "#") return s.split('#')[1];
                                            return s;
                                          });

        return tagList;
    },

    initDom: function(){
        //create necessary dom elements and append into $('#app') if they
        //don't exist:
        if($('#starredEventsPage').length === 0) { // just entering star page
            var page = $('<div id="starredEventsPage">');
            console.log('app');
            $('#app').html("").append(page);

            page.append($('<ul class="myevents">'));
            if($('#eventInfo').length === 0)
                page.append($('<div id="eventInfo">'));
            console.log("creating elements");
        }
        this.dom = {
            myEvents: $('.myevents'),
            tab_myEvents: $('.ME'),
            tab_search: $('.search'),
            tab_create: $('.create'),
            topleft_button: $('#left_button'),
            topright_button: $('#right_button'),
            eventInfo: $("#eventInfo"),
            loginOverlay: $("#loginOverlay")
        };

    },

    bindTabs: function() {
        //Bind all the tabs relavent to show/create/edit events.
        this.dom.tab_myEvents.unbind('click');
        this.dom.tab_myEvents.click(this.org_app.showEvents);

        this.dom.tab_create.unbind('click');
        this.dom.tab_create.click(function() {
            if(window.app_API.getAccountObject() === null ||
               window.app_API.getAccountObject().accountType !== "organizations") {
                alert('You can only create an event if you login as an organzation.'+
                      ' Contact cmunications@andrew.cmu.edu to receive organization'+
                      ' account credentials.');
            } else {
                this.createEvent();
            }
        }.bind(this));

    },

    //for events of a particular org
    showEvents: function(events){
        this.dom.loginOverlay.addClass("login_hidden");
        //initiate DOM in case it was over written
        this.initDom();
        //bind left/right buttons
        this.dom.topleft_button.unbind('click');
        this.dom.topleft_button.html('settings');
        subscription_app.ui.bindTabs();


        this.dom.topright_button.unbind('click');
        if(window.app_API.isLoggedIn() === false) {
            this.dom.topright_button.html("Login");
        } else {
            this.dom.topright_button.html("Logout");
        }
        this.dom.topright_button.click(this.loginPage.bind(this));

        allEvents = events['events'];
        console.log(allEvents);
        this.dom.eventInfo.html("");
        this.dom.myEvents.html("");
        this.dom.eventInfo.css({"visibility": "hidden"});
        /* *************************
            gotta bind these click events
           ************************* */
        this.dom.topleft_button.html("Settings");
        for (var i = 0; i < allEvents.length; i++) {
            var item = allEvents[i];
            var li = this.generate_listing(
                item, function() {
                    console.log("back");
                    this.org_app.showEvents();
                }.bind(this));
            this.dom.myEvents.append(li);
        }



    },

    generate_listing: function(event, backfn) {
        var account = window.app_API.getAccountObject();
        var star = false;
        if(account !== null && account.accountType === 'users') {
            if(account.savedEvents.indexOf(event._id) !== -1)
                star = true;
        }
        var li = $("<li>");
        if(star === true) {
            var starred = $("<div>").addClass('starred');
        } else {
            var starred = $("<div>").addClass('star');
        }
        var name = $("<h3>").html(event.name);
        var infoButton = $("<div>").addClass('more').html("<a> </a>");
        var location = $("<p>").html(event.location);
        var date = (new Date(event.timeStart)).toDateString();
        var time = this.generateTime(event.timeStart);
        var timeStart = $("<p>").html(date + ", " + time);
        location.addClass("location");
        timeStart.addClass("time");
        li.append(starred);
        li.append(infoButton);
        li.append(name);
        li.append(location);
        li.append(timeStart);

        (function() {
            var that = this;
            infoButton.click(function () {
                that.edit_mode = false;
                that.org_app.showEvent(event._id, backfn);
            });
            starred.click(function() {
                that.org_app.starEvent(event._id);
            });
        }.bind(this))();


        return li;
    },

    generateTime: function(dateObj) {
        var date = new Date(dateObj);
        var timeHours = date.getHours();
        var timeMin = date.getMinutes();
        var strTimeMin = String(timeMin);
        var zone;
        if (timeHours > 12) {
            zone = " PM";
            timeHours = timeHours % 12;
        }
        else
            zone = " AM";
        if (timeHours == 0)
            timeHours = 12;
        if(timeMin === 0) {
            strTimeMin = '00';
        }
        var time = String(timeHours) + ":" + strTimeMin + zone;
        return time;
    },

    //show a particular event/edit it
    showEvent: function(event, backfn) {
        this.dom.loginOverlay.addClass("login_hidden");
        this.initDom();
        this.dom.topleft_button.html("Back");
        this.dom.topright_button.html("Edit");

        //get back to myevents on clicking "back"
        this.dom.topleft_button.unbind('click');
        this.dom.topleft_button.click(backfn);

        // var image??? var tags?
        var name = $("<input>").val(event.name);
        var location = $("<input>").val(event.location);
        var host = $("<input>").val("Hosted by: " + event.hostOrg);
        var date = (new Date(event.timeStart)).toDateString();
        var time = this.generateTime(event.timeStart);
        var timeStart = $("<input>").val(date + ", " + time);
        var tags = $('<input>').val(event.tags.toString());
        var description = $("<textarea>").html(event.description);
        var location_icon = $("<img>").attr({"src": "css/img/final/location_icon.png", "id": "location_icon"});
        var time_icon = $("<img>").attr({"src": "css/img/final/time_icon.png", "id": "time_icon"});
       /*  var desc_icon = $("<img>").attr({"src": "css/img/final/desc_icon.png", "id": "desc_icon"}); */

        name.addClass("name display").attr({'id':"display_name", 'disabled':true});
        location.addClass("location display").attr({'id':"display_location", 'disabled':true});
        host.addClass("host display").attr({'id': "display_host", 'disabled': true});
        timeStart.addClass("timeStart display").attr({'id':"display_timeStart", 'disabled':true});
        tags.addClass("tags display").attr({'id': 'display_tags', 'disabled': true});
        description.addClass("description display").attr({'id':"display_description", 'disabled':true});
        var all = [ [location_icon, location], [host], [time_icon, timeStart], [tags]];
        //add to the eventInfo Div and clear myEvents
        this.dom.myEvents.html("");
        this.dom.eventInfo.html("");
        this.dom.eventInfo.append($("<li>").append(name));

        all.forEach (function (each) {
            this.dom.eventInfo.append($("<li>").append(each[0], each[1]));
        }.bind(this));
        this.dom.eventInfo.append($("<li>").attr({"id": "li_desc"}).append(description));
        this.dom.eventInfo.css({"visibility": "visible"});
        //insert everything in the event Info div
        this.set_edit_save(event, backfn);
    },

    set_edit_save: function(event, backfn) {
        this.dom.loginOverlay.addClass("login_hidden");
        console.log("this was clicked");
        this.dom.topright_button.unbind('click');
        this.dom.topright_button.click(function () {
            var user = window.app_API.getAccountObject();
            if(user === null) {
                alert("you must login as the host organization to edit this event!");
                this.showEvent(event, backfn);
            } else if(user.name !== event.hostOrg) {
                alert("You are not the host organization!");
                this.showEvent(event, backfn);
            } else {
                // does this refer to the same buttons now???
                this.edit_mode = !this.edit_mode;
                //just clicked on edit
                var displaylocation = $('.location');
                var displayname = $('.name');
                var displayhost = $('.host');
                var displaytag = $('.tags');
                var displaytimeStart = $('.timeStart');
                var displaydescription = $('.description');
                if (this.edit_mode) {

                    var labelName = $("<label>").html("Name").attr({"for": "name"});
                    var name = $("<input>").html(event.name).addClass("info");
                    name.attr({"type": "text", "id": "name", "placeholder": "Hey Marseilles", "value": displayname.val()});
                    var labelLocation = $("<label>").html("Location").attr({"for": "info"});
                    var location = $("<input>").html(event.location).addClass("info");
                    location.attr({"type": "text", "id": "location", "value": displaylocation.val()});

                    var labelHost = $("<label>").html("Host Org").attr({"for": "host"});
                    var host = $("<input>").html(event.hostOrg).addClass("host");
                    host.attr({"type": "text", "id": "host", "value": displayhost.val().slice(displayhost.val().indexOf(': ')+2),
                               "disabled": true
                              });

                    var labelTimeStart = $("<label>").html("Time").attr({"for": "timeStart"});
                    var timeStart = $("<input>").html(displaytimeStart.val()).addClass("info");
                    //hack date by subtracting offset from actual date, then removing 'Z' from the end to get valid string for datetime-local
                    var date = new Date(event.timeStart);
                    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                    timeStart.attr({"type": "datetime-local", "id": "timeStart", "value": date.toISOString().slice(0,-1)});

                    var labelTags = $('<label for="tags">').html("Tags");
                    var tags = $('<input>').val(event.tags.toString()).addClass("info");
                    tags.attr({"type": "text", "id": "tags", "placeholder": "ex: #free_food, #lecture"});

                    var labelDescription = $("<label>").html("Description").attr({"for": "description"});
                    var description = $("<textarea>").text(event.description).addClass("info");
                    description.attr({"id": "description"});
                    this.dom.eventInfo.html("");

                    this.dom.eventInfo.append($("<li>").append(labelName, name));
                    this.dom.eventInfo.append($("<li>").append(labelLocation, location));
                    this.dom.eventInfo.append($("<li>").append(labelHost, host));
                    this.dom.eventInfo.append($("<li>").append(labelTimeStart, timeStart));
                    this.dom.eventInfo.append($("<li>").append(labelTags, tags));
                    this.dom.eventInfo.append($("<li>").append(labelDescription,description));
                    this.dom.eventInfo.css({"visibility": "visible"});

                    this.dom.topright_button.html("Save");
                } else {
                    var _id = event._id;
                    var location = $("#location");
                    var timeStart = $("#timeStart");
                    var host = $('#host');
                    var name = $("#name");
                    var tags = $('#tags');
                    var description = $("#description");
                    //unhack the datetime hack
                    var date = new Date(timeStart.val());
                    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                    var content = { "_id": _id,
                                    "location": location.val(),
                                    "timeStart": date.toISOString(),
                                    "tags": this.hashtags(tags.val()),
                                    "hostOrg": host.val(),
                                    "name": name.val(),
                                    "description": description.val()
                                  };
                    //update in database
                    this.org_app.editEvent(_id, content);
                    // set to view mode
                    location.attr({'id':"display_location", 'disabled':true});
                    host.attr({'id': 'display_host', 'disabled': true});
                    name.attr({'id':"display_name", 'disabled':true});
                    tags.attr({'id': 'display_tags', 'disabled': true});
                    timeStart.attr({'id':"display_timeStart", 'disabled':true});
                    description.attr({'id':"display_description", 'disabled':true});
                    /*
                    //change the text in the topright button
                    this.dom.topright_button.html("Edit"); */
                    //Get back to my event page
                    this.org_app.showEvents();
                }
            }
        }.bind(this));
    },

    createEvent: function () {
        this.dom.loginOverlay.addClass("login_hidden");
        if (this.create_mode == false) {
            this.create_mode = true;
            this.dom.tab_create.addClass("selected_tab");
            this.dom.myEvents.html("");
            this.dom.eventInfo.html("");
            this.dom.topleft_button.html("Cancel");
            this.dom.topleft_button.click(this.org_app.showEvents.bind(this));

            this.dom.topright_button.unbind('click');
            this.dom.topright_button.html("Save");

            var labelName = $('<label for="name">').html("Name")
            var name = $("<input>").html(event.name).addClass("info").attr({"type": "text", "id": "name", "placeholder": "ex: Hey Marseilles"});
            var labelLocation = $('<label for="info">').html("Location");
            var location = $("<input>").html(event.location).addClass("info").attr({"type": "text", "id": "location", "placeholder": "ex: UC Rangos"});
            var labelTimeStart = $('<label for="timeStart">').html("Time");
            var timeStart = $("<input>").html(event.timeStart).addClass("info").attr({"type": "datetime-local", "id": "timeStart"});
            var labelTags = $('<label for="tags">').html("Tags");
            var tags = $('<input>').val(event.tags.toString()).addClass("info").attr({"type": "text", "id": "tags", "placeholder": "ex: #free_food, #lecture"});
            var labelDescription = $("<label>").html("Description").attr({"for": "description"});
            var description = $("<textarea></textarea>").html(event.description).addClass("info").attr({"id": "description", "placeholder": "Add more info"});

            this.dom.eventInfo.append($("<li>").append(labelName, name));
            this.dom.eventInfo.append($("<li>").append(labelLocation,location));
            this.dom.eventInfo.append($("<li>").append(labelTimeStart, timeStart));
            this.dom.eventInfo.append($("<li>").append(labelTags, tags));
            this.dom.eventInfo.append($("<li>").append(labelDescription,description));

            this.dom.eventInfo.css({"visibility": "visible"});
            this.dom.eventInfo.attr({"class": "on"});
        }
        //Save
        this.dom.topright_button.click(function () {
            var content = {  "location": location.val(),
                             "timeStart": timeStart.val(),
                             "tags": this.hashtags(tags.val()),
                             "name": name.val(),
                             "description": description.val()
                             };
            //create event in database
            this.org_app.createEvent(content);
            // set to view mode
            location.attr({'id':"display_location", 'disabled':true});
            name.attr({'id':"display_name", 'disabled':true});
            timeStart.attr({'id':"display_timeStart", 'disabled':true});
            description.attr({'id':"display_description", 'disabled':true});
            //switch back to my Events?? *******
            this.create_mode = false;
            this.org_app.showEvents();

        }.bind(this));
    },

    loginPage: function() {
            if (this.dom.loginOverlay.is(":hidden")) {
                console.log("it's 4 AM #cmulyfeeeee");
                (this.dom.loginOverlay).slideDown("slow");
                $("#app").html("");
                } else {
                (this.dom.loginOverlay).hide();
                }
        this.dom.loginOverlay.removeClass("login_hidden");
        //window.location = 'login.html';
    }
}
