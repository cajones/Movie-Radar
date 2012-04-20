var root = window;

root.MovieRadar = root.MovieRadar || {};
root.MovieRadar.App = (function ($, _, Backbone, Handlebars, logger) {

    var dispatcher = _.clone(Backbone.Events);

    var TemplatedView = {
        makeVisible: function(selector) {
            logger.log('scroll');

            if(selector === undefined)
                selector = this.el;

            var offset = $(selector).offset();

            $('html:not(:animated), body').animate({
                scrollTop: offset.top -20,
                scrollLeft: offset.left
            });
        },
    
        render: function() {
            var template = Handlebars.compile($(this.options.templateSelector).html());
            $(this.el).html(template({}));
        }        
    };

    var WelcomeView = Backbone.View.extend(_.extend(TemplatedView, {
        events: {
            'click  .btn'   :   'requestList'
        },

        requestList: function() {

            dispatcher.trigger('list:show');
        }
    }));
    var ListView = Backbone.View.extend(_.extend(TemplatedView, {
        initialize: function() {
            
            var view = this;
            dispatcher.on("list:show", function() {

                view.makeVisible(view.el)
            });
        }
    }));
    var RadarView = Backbone.View.extend(_.extend(TemplatedView, {
        initialize: function() {
            
            var view = this;
            dispatcher.on("radar:show", function() {

                view.makeVisible(view.el)
            });
        }
    }));

    var Navigation = Backbone.Router.extend({
        initialize: function() {
            
            dispatcher.on("app:ready", function() {

                Backbone.history.start();    
            })
        },

        routes: {
            'welcome':  'welcome',
            'list':     'list',
            'radar':    'radar',
        },

        welcome: function() {

        },

        list: function() {

        },

        radar: function(){

        }
    });
    var nav = new Navigation();

    return {
        start: function() {
            
            logger.log('Movie Radar App started.');

            var welcomeView = new WelcomeView({
                templateSelector: '#welcome-view-template'
            });
            welcomeView.render();
            $('#welcome-view').html(welcomeView.el);
            logger.log('Welcome rendered.');

            var listView = new ListView({
                templateSelector: '#movie-list-view-template'
            });
            listView.render();
            $('#movie-list-view').html(listView.el);
            logger.log('Movie List rendered.');

            var radarView = new RadarView({
                templateSelector: '#movie-radar-view-template'
            });
            radarView.render();
            $('#movie-radar-view').html(radarView.el);
            logger.log('Movie Radar rendered.');
            
            channel.trigger("app:ready");
        }
    };
})(jQuery, _, Backbone, Handlebars, console);
