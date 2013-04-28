var Search_UI = function(config) {


    this.initDom();

    //used in org_app.js
    this.search_app = config.events;

    //on clicking the tab show all events BIND THIS?

    //Bind all the tabs relavent to events.
    this.bindTabs();
    org_app.ui.bindTabs();


}


Search_UI.prototype = {
    initDom: function() {
        //create necessary dom elements and append into $('#app') if they
        //don't exist:
        if($('#searchEventsPage').length === 0) { //just entering search page
            var page = $('<div id="searchEventsPage">');
            $('#app').html("").append(page);
            if($('#searchbar').length === 0)
                page.append($('<input type="text" id="searchbar">'));
            if($('#searchbarDate').length === 0)
                page.append($('<input type="datetime-local" id="searchbarDate">'));
            if($('#searchSubmit').length === 0)
                page.append($('<button id="searchSubmit">Search</button>'));
            if($('#searchResults').length === 0)
                page.append($('<ul class="myevents" id="searchResults">'));
            console.log("creating elements");
        }

        this.dom = {
            searchbar: $('#searchbar'),
            searchbarDate: $('#searchbarDate'),
            searchResults: $('#searchResults'),
            submit: $('#searchSubmit'),
            tab_search: $('.tab.search')
        }

    },

    bindTabs: function() {
        this.dom.tab_search.unbind('click');
        this.dom.tab_search.click(this.showResults.bind(this));
    },

    showResults: function(results, doRender) {
        console.log("show events!");
        this.initDom();


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
        }
        console.log(results);
        console.log("Showing search results");
    }

}
