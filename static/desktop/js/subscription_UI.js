var Subscription_UI = function(config) {

    this.C = {};
    this.initTransitionEnd();
    this.initDom();

    this.subscription_app = config.events;


    this.bindTabs();
}


function indexWhere(array, fn) {
    for(var i = 0; i < array.length; i++) {
        if(fn(array[i]) === true) return i;
    }
    return -1;
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
        var overlay_content = $('#overlay_content');
        var search = $('#subscription_search');
        var submit = $('#subscription_submit');
        var results = $('#subscription_results');

        var left_button = $('#left_button');
//        var right_button = $('#right_button');
        var headline = $('#topbar');
        var tags = $('#subscription_tags');
        var orgs = $('#subscription_orgs');

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
            topright_button: org_app.ui.dom.topright_button,
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
        this.dom.settings_button.unbind('click');
        this.dom.settings_button.click(function() {
            var account = window.app_API.getAccountObject();
            console.log(account);
            if(account !== null && account.accountType === 'users') {
                this.showOverlay(this.dom.overlay_content);
            } else {
                alert("You must login as a user to access your "+
                      "subscription settings");
            }
        }.bind(this));

    },

    showSubscriptions: function(results) {

        var matchedOrgs = results.orgs;
        var matchedTags = results.tags;
        console.log(matchedOrgs, matchedTags);
        var render = [];
        if(this.dom.tags.attr('checked') === 'checked')
            render = render.concat(matchedTags);
        if(this.dom.orgs.attr('checked') === 'checked')
            render = render.concat(matchedOrgs);

        this.dom.results.html("");
        var account = window.app_API.getAccountObject();

        render.forEach(function(elem) {
            var li = this.generate_subscription_html(elem, account);
            this.dom.results.append(li);
        }.bind(this));

    },

    generate_subscription_html: function(elem, account) {
        var li = $("<li>");
        var name = $("<h3>").html(elem.name);
        var subscribed = false;
        var subscribedToggle = $('<a class="is_subscribed">');
        if(elem.password !== undefined) {
            var idx =  indexWhere(account.orgs, function(org) {
                return elem._id === org._id;
            });
            if(idx !== -1) subscribed = true;
        } else {
            var idx = indexWhere(account.tags, function(tag) {
                return elem.name === tag;
            });
            console.log(elem.name);
            name.html('#'+elem.name);
            if(idx !== -1) subscribed = true;
        }
        if(subscribed) {
            subscribedToggle.html("[unsubscribe]");
            subscribedToggle.click(function() {
                console.log("unsubscribe user");
            });
        } else {
            subscribedToggle.html("[subscribe]");
            subscribedToggle.click(function() {
                console.log("subscribe user");
            });
        }
        li.append(name);
        li.append(subscribedToggle);
        return li;
    },

    showOverlay: function(overlay) {

        console.log('Showing Overlay');
//        this.dom.append($('<div class = "search_container"> <input type="text" id="searchbar"> </div>'));

        this.dom.overlay.append(overlay);
        this.dom.rest.css('overflow', 'hidden');
        this.dom.overlay.removeClass('hidden');


        //toggling of showing overlay
        this.dom.settings_button.unbind('click');
        this.dom.settings_button.html('Back');
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
        this.dom.settings_button.html('Settings');
        this.dom.settings_button.click(function() {
            this.showOverlay(overlay);
        }.bind(this));

    }


}
