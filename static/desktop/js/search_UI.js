var Search_UI = function(config) {


    this.initDom();

    //used in org_app.js
    this.search_app = config.events;

    //on clicking the tab show all events BIND THIS?

    //Bind all the tabs relavent to events.
    this.bindTabs();


}


Search_UI.prototype = {
    initDom: function() {
        //create necessary dom elements and append into $('#app') if they
        //don't exist:
        if($('#searchEventsPage').length === 0) { //just entering search page
            var page = $('<div id="searchEventsPage">');
            $('#app').html("").append(page);
            if($('#searchbar').length === 0)
                page.append($('<div class = "search_container"> <input type="text" id="searchbar"> </div>'));
            if($('#searchbarDate').length === 0)
                $('.search_container').append($('<input type="date" id="searchbarDate"> '));
            if($('#searchSubmit').length === 0)
                $(".search_container").append($('<button id="searchSubmit"> Go </button>'));
            if($('#searchResults').length === 0)
                page.append($('<ul class="myevents" id="searchResults">'));
            console.log("creating elements");
        }

        this.dom = {
            searchbar: $('#searchbar'),
            searchbarDate: $('#searchbarDate'),
            searchResults: $('#searchResults'),
            submit: $('#searchSubmit'),
            tab_search: $('.tab.search'),
            tab1_contain: $('.contain.tab1'),
            tab2_contain: $('.contain.tab2'),
            tab3_contain: $('.contain.tab3'),
            tab4_contain: $('.contain.tab4')
        };

    },

    bindTabs: function() {
        this.dom.tab_search.unbind('click');
        this.dom.tab_search.click(this.showResults.bind(this));
    },

    showResults: function(results, doRender) {
        console.log("show events!");
        this.initDom();
            this.dom.tab2_contain.attr({"id":"selected"});
            this.dom.tab3_contain.attr({"id":""});
            this.dom.tab1_contain.attr({"id":""});
            this.dom.tab4_contain.attr({"id":""});

        this.dom.submit.click(function() {
            window.search_API.doSearch(this.dom.searchbar.val(),
                                       function(err, results) {
                                           if(err) throw err;
                                           render(results.results);
                                       });
        }.bind(this));

        var render = function (events) {
            console.log("calling render with", events);
            if(events.length === 0) {
                this.dom.searchResults.html("No events found");
            } else {
                this.dom.searchResults.html('');
                for(var i= 0; i < events.length; i++) {
                    var li = org_app.ui.generate_listing(
                        events[i], function() {
                            this.showResults(events, true);
                        }.bind(this));
                    this.dom.searchResults.append(li);
                }
            }
        }.bind(this);

        if(doRender === true) {
            render(results);
        } else {
            window.search_API.doSearch("", function(err, results) {
                if(err) throw err;
                //check success
                render(results.results);
            });
        }

        console.log("Showing search results");
    }

}
