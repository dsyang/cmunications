var Search_UI = function(config) {

    this.dom = {
        tab_search: $('.tab.search')
    };

    //used in org_app.js
    this.search_app = config.events;

    //on clicking the tab show all events BIND THIS?

    //Bind all the tabs relavent to events.
    this.dom.tab_search.click(this.showResults.bind(this));


}


Search_UI.prototype = {
    initDom: function() {
        //blow away $('#app') to make room for search DOM
        console.log("blowin");
        var app = $('#app');
        app.html('');
        //create necessary dom elements and append into $('#app') if they
        //don't exist:
        if($('#searchbar').length === 0) { // .myevents does not exist
            app.append($('<input type="text" id="searchbar">'));
            if($('#searchbarDate').length === 0)
                app.append($('<input type="datetime-local" id="searchbarDate">'));
            if($('#searchResults').length === 0)
                app.append($('<div id="searchResults">'));
            console.log("creating elements");
        }

        this.dom = {
            searchbar: $('#searchbar'),
            searchbarDate: $('#searchbarDate'),
            searchResults: $('#searchResults'),
            tab_search: $('.tab.search')
        }

    },

    showResults: function(results) {
        this.initDom();
        console.log(results);
        console.log("Showing search results");
    }

}
