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
    this.dom.tab_myEvents.click(this.org_app.showEvents);
    this.dom.tab_create.click(this.createEvent.bind(this));


}

UI.prototype =
{
    initDom: function(){
        this.dom = {
            myEvents: $('.myevents'),
            tab_myEvents: $('.ME'),
            tab_create: $('.create'),
            topleft_button: $('#left_button'),
            topright_button: $('#right_button'),
            eventInfo: $("#eventInfo")
        };
    },

    //for events of a particular org
    showEvents: function(events){
        allEvents = events['events'];
        console.log(allEvents);
        this.dom.eventInfo.html("");
        this.dom.myEvents.html("");
        /* *************************
            gotta bind these click events
           ************************* */
        this.dom.topleft_button.html("Settings");
        this.dom.topright_button.html("Log Out");
        for (var i = 0; i < allEvents.length; i++) {
            var item = allEvents[i];
            var li = $("<li>");
            var name = $("<h3>").html(item.name);
            var location = $("<p>").html(item.location);
            var timeStart = $("<p>").html(item.timeStart);
            var infoButton = $("<a>").html("More");
            location.addClass("location");
            timeStart.addClass("time");
            li.append(name);
            li.append(timeStart);
            li.append(location);
            li.append(infoButton);
            infoButton.click (function () {
                console.log("hit");
                this.edit_mode = false;
                this.org_app.showEvent(item._id);
            }.bind(this));

            this.dom.myEvents.append(li);
            //this.allEvents.push(item);
        }
    },

    //show a particular event/edit it
    showEvent: function(event) {
        this.dom.topleft_button.html("Back");
        this.dom.topright_button.html("Edit");
        //get back to myevents on clicking "back"
        this.dom.topleft_button.click(this.org_app.showEvents.bind(this));
        // var image??? var tags?
        var name = $("<input>").val(event.name);
        var location = $("<input>").val(event.location);
        var timeStart = $("<input>").val(event.timeStart);
        var timeEnd = $("<input>").val(event.timeEnd);
        var description = $("<input>").val(event.description);

        name.addClass("name").attr({'id':"display_name", 'disabled':true});
        location.addClass("location").attr({'id':"display_location", 'disabled':true});
        timeStart.addClass("timeStart").attr({'id':"display_timeStart", 'disabled':true});
        timeEnd.addClass("timeEnd").attr({'id':"display_timeEnd", 'disabled':true});
        description.addClass("description").attr({'id':"display_description", 'disabled':true});
        //add to the eventInfo Div and clear myEvents
        this.dom.myEvents.html("");
        this.dom.eventInfo.append(name,location,timeStart,timeEnd,description);
        //insert everything in the event Info div
        this.set_edit_save(event);
    },

    set_edit_save: function(event) {
        this.dom.topright_button.click(function () {
            // does this refer to the same buttons now???
            this.edit_mode = !this.edit_mode;
            //just clicked on edit
            if (this.edit_mode) {
                $(".location").attr('id',"edit_location").removeAttr('disabled');
                $(".name").attr('id',"edit_name").removeAttr('disabled');
                $(".timeStart").attr('id',"edit_timeStart").removeAttr('disabled');
                $(".description").attr('id',"edit_description").removeAttr('disabled');

                this.dom.topright_button.html("Save");
            }
            // just clicked save
            else {
                var content = { "_id": _id,
                             "location": location.val(),
                             "timeStart": timeStart.val(),
                             "timeEnd": timeEnd.val(),
                             "name": name.val(),
                             "description": description.val()
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
            this.dom.myEvents.html("");
            this.dom.topleft_button.html("Cancel");
            this.dom.topright_button.html("Save");
            this.dom.topleft_button.click(this.org_app.showEvents.bind(this));

            var labelName = $("<label>").html("Name").addClass("name");
            var name = $("<input>").html(event.name).addClass("name");
            var labelLocation = $("<label>").html("Location").addClass("location");
            var location = $("<input>").html(event.location).addClass("location");
            var labelTimeStart = $("<label>").html("Time").addClass("timeStart");
            var timeStart = $("<input>").html(event.timeStart).addClass("timeStart");
            var timeEnd = $("<input>").html(event.timeEnd).addClass("timeEnd");
            var labelDescription = $("<label>").html("Description").addClass("description");
            var description = $("<input>").html(event.description).addClass("description");

            this.dom.eventInfo.append(labelName,name);
            this.dom.eventInfo.append(labelLocation,location);
            this.dom.eventInfo.append(labelTimeStart, timeStart,timeEnd);
            this.dom.eventInfo.append(labelDescription,description);
        }
        //Save
        this.dom.topright_button.click(function () {
            var content = { "_id": _id,
                             "location": location.val(),
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
            description.attr({'id':"display_description", 'disabled':true});
            //switch back to my Events?? *******
            this.create_mode = false;

        }.bind(this));
    }
}
