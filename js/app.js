var root = window;

root.MovieRadar = root.MovieRadar || {};
root.MovieRadar.App = (function ($, _, Backbone, Handlebars, logger) {

    var dispatcher = _.clone(Backbone.Events);

    var TemplatedView = Backbone.View.extend({
        makeVisible: function(selector) {

            if(selector === undefined)
                selector = this.el;

<<<<<<< HEAD
            var offset = $(selector).offset();

            logger.log('Offset T - ' + offset.top);
            $('body').animate({
                scrollTop: offset.top -85,
                scrollLeft: offset.left
            });
=======
            if($.scrollTo) $.scrollTo(selector, {duration:800, offset:{top:-85}});
            else {
                var offset = $(selector).offset();
            
                logger.log('Offset TL - ' + offset);
                $('html:not(:animated), body').animate({
                    scrollTop: offset.top -85,
                    scrollLeft: offset.left
                });    
            }
>>>>>>> master
        },
    
        render: function() {
            
            var template = Handlebars.compile($(this.options.templateSelector).html());
            $(this.el).html(template(this.model||{}));
        }        
    });

    var WelcomeView = TemplatedView.extend({
        initialize: function() {
            
            var view = this;
            dispatcher.on("welcome:show", function() {

                view.makeVisible(view.el);
            });
        }
    });
    var ListView = TemplatedView.extend({
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
    });
    var RadarView = TemplatedView.extend({
        initialize: function() {

            this.options = _.defaults(this.options, { itemSelector : 'li' });

            var view = this;
            dispatcher.on("radar:show", function() {

                view.makeVisible(view.el);
            });
            dispatcher.on("radar:scan", function() {

                view.makeVisible(view.el);
                view.render();
            });
            dispatcher.on('movies:dataready', function(data) {

                view.model = data;
            });
        },
        render: function() {

            var view = this;
            $(view.el).fadeOut(function() {

                TemplatedView.prototype.render.call(view);
                view.$('li').hide();
                $(view.el).show();

                view.renderItems();    
            });
            
        },

        renderItems: function() {
            _.chain(this.$(this.options.itemSelector))
                .shuffle()
                .each(function(item, i) {
                    $(item).delay(i * 600).fadeIn();
                });
        }
    });

    var Navigation = Backbone.Router.extend({
        initialize: function() {
            
            dispatcher.on("app:ready", function() {

                Backbone.history.start();    
            })
        },

        routes: {
            'welcome'       :  'welcome',
            'list'          :  'list',
            'list/:index'   :  'list',
            'scan'          :  'scan',
            'radar/:index'  :  'radar'
        },

        welcome: function() {

            dispatcher.trigger('welcome:show');
        },

        list: function(index) {

            dispatcher.trigger('list:show', index);
        },

        scan: function() {

            dispatcher.trigger('radar:scan');
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

                var twoWeeksAgo = -14;
                var millisecondsPerDay = 1000*60*60*24;

                data.movies = _.chain(data.movies)
                    .map(function withCountdown(item) { return _.extend(item, { countdown : (new Date(item.release) - Date.now()) / millisecondsPerDay }); })
                    .reject(function(item) { return item.countdown <= twoWeeksAgo; })
                    .sortBy('countdown')
                    .value();

                dispatcher.trigger('movies:dataready', data);
            });
        }

    };
})(jQuery, _, Backbone, Handlebars, console);
