var Subscription_UI = function(config) {

    this.C = {};
    this.initTransitionEnd();
    this.initDom();

    this.subscription_app = config.events;

    notification_app.ui.bindTabs();
    search_app.ui.bindTabs();
    org_app.ui.bindTabs();
    this.bindTabs();
}


Subscription_UI.prototype = {


    initTransitionEnd: function(){
        if ($.browser.webkit){
            this.C.TRANSITION_END = "webkitTransitionEnd";
        }
        else if ($.browser.opera){
            this.C.TRANSITION_END = "oTransitionEnd";
        }
        else {
            this.C.TRANSITION_END = "transitionend";
        }
    },

    initDom: function() {

        var overlay = $('#overlay').addClass('hidden');
        var overlay_content = $('#overlay-content');
        var search = $('#subscription_search');
        var submit = $('#subscription_submit');
        var results = $('#subscription_results');

        var left_button = $('#left_button');
        var right_button = $('#right_button');
        var headline = $('#topbar');
        var tags = $('#subscription_tags');
        var orgs = $('#subscription_orgs');
        console.log(overlay)

        this.dom = {
            overlay: overlay,
            overlay_content: overlay_content,
            search: search,
            submit: submit,
            tags: tags,
            orgs: orgs,
            results: results,
            settings_button: org_app.ui.dom.topleft_button,
            rest: $('#rest'),
            topleft_button: left_button,
            topright_button: right_button,
        }

        this.dom.overlay_content.removeClass('initiallyHidden');
        this.dom.overlay_content.detach();

        this.dom.submit.click(function() {
            var text = this.dom.search.val();
            console.log(text);
            console.log(this);
            console.log(this.subscription_app);
            this.subscription_app.searchSubscriptions(text);

        }.bind(this));

    },

    bindTabs: function() {
        console.log(this.dom.settings_button);
        this.dom.settings_button.unbind('click');
        this.dom.settings_button.click(function() {
            this.showOverlay(this.dom.overlay_content);
        }.bind(this));
        console.log('binding tabs');
    },

    showSubscriptions: function(results) {

        var matchedOrgs = results.orgs;
        var matchedTags = results.tags;
        var render = [];
        if(this.dom.tags.attr('checked'))
            render.concat(matchedTags);
        if(this.dom.orgs.attr('checked'))
            render.concat(matchedOrgs);
//        this.dom.results.

    },

    showOverlay: function(overlay) {

        console.log('Showing Overlay');
        this.dom.topleft_button.html("Back");
        this.dom.topright_button.html("Edit");
        this.dom.append($('<div class = "search_container"> <input type="text" id="searchbar"> </div>'));

        this.dom.overlay.append(overlay);
        this.dom.rest.css('overflow', 'hidden');
        this.dom.overlay.removeClass('hidden');


        //toggling of showing overlay
        this.dom.settings_button.unbind('click');
        this.dom.settings_button.click(function() {
            this.hideOverlay(overlay);
        }.bind(this));

        this.dom.overlay_content.click(function(e) {
            e.stopPropagation();
        });

        this.dom.overlay.click(function() {
            this.hideOverlay(overlay);
        }.bind(this));
    },

    hideOverlay: function(overlay) {

        this.dom.overlay.addClass('hidden');
        this.dom.overlay.one(this.C.TRANSITION_END, function(e) {
            console.log('Hiding Overlay');
            console.log(e);
            overlay.detach();
            this.dom.rest.css('overflow', 'auto');
        });
        this.dom.settings_button.unbind('click');
        this.dom.settings_button.click(function() {
            this.showOverlay(overlay);
        }.bind(this));

    }


}