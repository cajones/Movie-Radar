var root = window;

root.MovieRadar = root.MovieRadar || {};
root.MovieRadar.App = (function ($, _, Backbone, Handlebars, logger) {

    var dispatcher = _.clone(Backbone.Events);

    var TemplatedView = {
        makeVisible: function(selector) {

            if(selector === undefined)
                selector = this.el;

            var offset = $(selector).offset();

            $('html:not(:animated), body').animate({
                scrollTop: offset.top -50,
                scrollLeft: offset.left
            });
        },
    
        render: function() {
            
            var template = Handlebars.compile($(this.options.templateSelector).html());
            $(this.el).html(template(this.model||{}));
        }        
    };

    var WelcomeView = Backbone.View.extend(TemplatedView);
    var ListView = Backbone.View.extend(_.extend(TemplatedView, {
        initialize: function() {
            
            var view = this;
            dispatcher.on("list:show", function(index) {

                view.makeVisible(index ? '#movie-'+index : view.el);
            });
            dispatcher.on('movies:dataready', function(data) {

                view.model = data;
                view.render();
            });
        }
    }));
    var RadarView = Backbone.View.extend(_.extend(TemplatedView, {
        initialize: function() {
            
            var view = this;
            dispatcher.on("radar:show", function() {

                view.makeVisible(view.el);
            });
            dispatcher.on('movies:dataready', function(data) {

                view.model = data;
                view.render();
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
            'list/:index'   :  'list',
            'radar/:index'  :  'radar',
        },

        welcome: function() {

            dispatcher.trigger('welcome:show');
        },

        list: function(index) {

            dispatcher.trigger('list:show', index);
        },

        radar: function(index){

            dispatcher.trigger('radar:show', index);
        }
    });
    
    return {
        start: function() {
    
            logger.log('Movie Radar App started.');
            var nav = new Navigation();

            this.initialiseWelcome();
    
            this.initialiseRadar();

            this.initialiseList();

            this.getMovies();

            dispatcher.trigger("app:ready");
        },

        initialiseWelcome: function() {

            var welcomeView = new WelcomeView({
                templateSelector: '#welcome-view-template'
            });
            welcomeView.render();
            $('#welcome-view').html(welcomeView.el);
            logger.log('Welcome initialised.');
        },

        initialiseRadar: function() {

            var radarView = new RadarView({
                templateSelector : '#movie-radar-view-template'
            });
            radarView.render();
            $('#movie-radar-view').html(radarView.el);
            logger.log('Movie Radar initialised.');
        },

        initialiseList: function() {

            var listView = new ListView({
                templateSelector: '#movie-list-view-template'
            });
            listView.render();
            $('#movie-list-view').html(listView.el);
            logger.log('Movie List initialised.');
        },

        getMovies: function() {

            $.getJSON('Movies/all.json', function(data) {

                data.movies = _.chain(data.movies)
                    .map(function withCountdown(item) { return _.extend(item, { countdown : (new Date(item.release) - Date.now()) / (1000*60*60*24) }); })
                    .sortBy('countdown')
                    .value();

                dispatcher.trigger('movies:dataready', data);
            });
        }

    };
})(jQuery, _, Backbone, Handlebars, console);
