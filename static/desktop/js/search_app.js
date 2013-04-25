var Search_app = function() {

    this.ui = new Search_UI({
        events: {
            doSearch: this.doSearch.bind(this)
        }
    });

}

Search_app.prototype = {
    doSearch: function(query) {
        window.search_API.doSearch(query, function (err, results) {
            this.ui.showResults(results);
        }.bind(this));
    }
}
