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

    //Bind all the tabs relavent to show/create/edit events.
    this.dom.tab_myEvents.click(this.org_app.showEvents);
    this.dom.tab_create.click(function() { 
        if(window.app_API.getAccountObject() !== null &&
           window.app_API.getAccountObject().accountType !== "organizations") {
            alert('You can only create an event if you login as an organzation.'+
                  ' Contact cmunications@andrew.cmu.edu to receive organization'+
                  ' account credentials.');
        } 
        else { 
        this.createEvent();

        } 
    }.bind(this));

}

UI.prototype =
{
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
            tab_search: $('.search'),
            topleft_button: $('#left_button'),
            topright_button: $('#right_button'),
            eventInfo: $("#eventInfo"),
            esearch: $(".esearch")
        };

    },


    searchEvents: function(events) {
        this.dom.esearch.html("");
        this.dom.myEvents.html("");
        this.dom.eventInfo.html("");
        console.log("search");
        var searchfield = $("<input>").addClass("searchfield").attr({"type": "text", "placeholder": "Search cmunications"});
        this.dom.esearch.append(searchfield);
        var searchButton = $("<button>").addClass("searchButton").html("search");
        this.dom.esearch.append(searchButton);
        searchButton.click(function (){
            var content = { text: searchfield.val() };
            this.org_app.searchEvents(content);
        }.bind(this));
    },


    //for events of a particular org
    showEvents: function(events){
        //initiate DOM in case it was over written
        this.initDom();
        //bind left/right buttons
        this.dom.topleft_button.unbind('click');
        this.dom.topleft_button.html('settings');
        this.dom.topleft_button.click(function() {
            alert("to be implemented");
        });

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

            var li = this.generate_listing(item);

            this.dom.myEvents.append(li);
        }
    },

    generate_listing: function(event) {
        var li = $("<li>");
        var starred = $("<div>").addClass('starred');
        var name = $("<h3>").html(event.name);
        var infoButton = $("<div>").addClass('more').html("<a> </a>");
        var location = $("<p>").html(event.location);
        var timeStart = $("<p>").html(this.generateTime(event.timeStart));
        location.addClass("location");
        timeStart.addClass("time");
        li.append(starred);
        li.append(infoButton);
        li.append(name);
        li.append(location);
        li.append(timeStart);

        (function() {
            var that = this;
            infoButton.click (function () {
                that.edit_mode = false;
                that.org_app.showEvent(event._id);
            });
        }.bind(this))();

        return li;
    },

    generateTime: function(dateObj) {
        var date = new Date(dateObj);
        var day = date.toDateString();
        var timeHours = date.getHours();
        var timeMin = date.getMinutes();
        var zone;
        if (timeHours > 12) {
            zone = " PM";
            timeHours = timeHours % 12;
        }
        else
            zone = " AM";
        var time = day + ", " + String(timeHours) + ":" + String(timeMin) + zone;
        return time;
    },
    //show a particular event/edit it
    showEvent: function(event) {
        this.initDom();
        this.dom.topleft_button.html("Back");
        this.dom.topright_button.html("Edit");
        //get back to myevents on clicking "back"
        this.dom.topleft_button.unbind('click');
        this.dom.topleft_button.click(this.org_app.showEvents.bind(this));
        // var image??? var tags?
        var name = $("<input>").val(event.name);
        var location = $("<input>").val(event.location);
        var timeStart = $("<input>").val((new Date(event.timeStart)).toDateString());
        var description = $("<textarea>").val(event.description);

        name.addClass("name display info").attr({'id':"display_name", 'disabled':true});
        location.addClass("location display info").attr({'id':"display_location", 'disabled':true});
        timeStart.addClass("timeStart display info").attr({'id':"display_timeStart", 'disabled':true});
        description.addClass("description display info").attr({'id':"display_description", 'disabled':true});


        //add to the eventInfo Div and clear myEvents
        this.dom.myEvents.html("");
        this.dom.eventInfo.append(name,location,timeStart,description);
        this.dom.eventInfo.css({"visibility": "visible"});
        //insert everything in the event Info div
        this.set_edit_save(event);
    },

    set_edit_save: function(event) {
        console.log("this was clicked");
        this.dom.topright_button.unbind('click');
        this.dom.topright_button.click(function () {
            console.log("this was clicked!!");
            // does this refer to the same buttons now???
            this.edit_mode = !this.edit_mode;
            //just clicked on edit
            var displaylocation = $('.location');
            var displayname = $('.name');
            var displaytimeStart = $('.timeStart');
            var displaydescription = $('.description');
            if (this.edit_mode) {

                var labelName = $("<label>").html("Name").attr({"for": "name"});
                var name = $("<input>").html(event.name).addClass("info");
                name.attr({"type": "text", "id": "name", "placeholder": "Hey Marseilles", "value": displayname.val()});
                var labelLocation = $("<label>").html("Location").attr({"for": "info"});
                var location = $("<input>").html(event.location).addClass("info");
                location.attr({"type": "text", "id": "location", "value": displaylocation.val()});
                var labelTimeStart = $("<label>").html("Time").attr({"for": "timeStart"});
                var timeStart = $("<input>").html(displaytimeStart.val()).addClass("info");
                timeStart.attr({"type": "datetime-local", "id": "timeStart", "value": timeStart.val()});
                var labelDescription = $("<label>").html("Description").attr({"for": "description"});
                var test = $("<textarea>").text("hello test"); 
                var description = $("<textarea>").html(event.description).addClass("info");
                description.attr({"id": "description", "value": displaydescription.val()});

                this.dom.eventInfo.html("");
                /*this.dom.eventInfo.append($("<li>").append(test)); */
                this.dom.eventInfo.append($("<li>").append(labelName, name));
                this.dom.eventInfo.append($("<li>").append(labelLocation,location));
                this.dom.eventInfo.append($("<li>").append(labelTimeStart, timeStart));
                this.dom.eventInfo.append($("<li>").append(labelDescription,description));
                this.dom.eventInfo.css({"visibility": "visible"});

                this.dom.topright_button.html("Save");
            }
            // just clicked save
            else {
                var _id = event._id;
                var location = $("#location");
                var timeStart = $("#timeStart");
                var name = $("#name");
                var description = $("#description");
                var content = { "_id": _id,
                             "location": location.val(),
                             "timeStart": timeStart.val(),
                             "name": name.val(),
                             "description": description.text()
                             };
                //update in database
                this.org_app.editEvent(_id, content);
                // set to view mode
                location.attr({'id':"display_location", 'disabled':true});
                name.attr({'id':"display_name", 'disabled':true});
                timeStart.attr({'id':"display_timeStart", 'disabled':true});
                description.attr({'id':"display_description", 'disabled':true});
                /*
                //change the text in the topright button
                this.dom.topright_button.html("Edit"); */
                //Get back to my event page
                this.org_app.showEvents();
            }
        }.bind(this));
    },

    createEvent: function () {
        if (this.create_mode == false) {
            this.create_mode = true;
            this.dom.tab_create.addClass("selected_tab");
            this.dom.myEvents.html("");
            this.dom.eventInfo.html("");
            this.dom.topleft_button.html("Cancel");
            this.dom.topright_button.html("Save");
            this.dom.topleft_button.click(this.org_app.showEvents.bind(this));

            var labelName = $("<label>").html("Name").attr({"for": "name"});
            var name = $("<input>").html(event.name).addClass("info").attr({"type": "text", "id": "name", "placeholder": "ex: Hey Marseilles"});
            var labelLocation = $("<label>").html("Location").attr({"for": "info"});
            var location = $("<input>").html(event.location).addClass("info").attr({"type": "text", "id": "location"});
            var labelTimeStart = $("<label>").html("Time").attr({"for": "timeStart"});
            var timeStart = $("<input>").html(event.timeStart).addClass("info").attr({"type": "datetime-local", "id": "timeStart"});
            var timeEnd = $("<input>").html(event.timeEnd).addClass("info").attr({"type": "date", "id": "timeEnd"});
            var labelDescription = $("<label>").html("Description").attr({"for": "description"});
            var description = $("<textarea></textarea>").html(event.description).addClass("info").attr({"id": "description"});

            this.dom.eventInfo.append($("<li>").append(labelName, name));
            this.dom.eventInfo.append($("<li>").append(labelLocation,location));
            this.dom.eventInfo.append($("<li>").append(labelTimeStart, timeStart));
            this.dom.eventInfo.append($("<li>").append(labelDescription,description));
            this.dom.eventInfo.css({"visibility": "visible"}); 
            this.dom.eventInfo.attr({"class": "on"});
        }
        //Save
        this.dom.topright_button.click(function () {
            var content = {  "location": location.val(),
                             "timeStart": timeStart.val(),
                             "timeEnd": timeEnd.val(),
                             "name": name.val(),
                             "description": description.val()
                             };
            //create event in database
            this.org_app.createEvent(content);
            // set to view mode
            location.attr({'id':"display_location", 'disabled':true});
            name.attr({'id':"display_name", 'disabled':true});
            timeStart.attr({'id':"display_timeStart", 'disabled':true});

            timeEnd.attr({'id':"display_timeEnd", 'disabled':true});
            description.attr({'id':"display_description", 'disabled':true});
            //switch back to my Events?? *******
            this.create_mode = false;

        }.bind(this));
    },

    loginPage: function() {
        window.location = 'login.html';
    }
}
