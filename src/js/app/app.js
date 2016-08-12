'use strict';

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import BackboneBabysitter from 'backbone.babysitter';

import AppController from './app-controller';
import AppRouter from './app-router';

var App = Marionette.Application.extend({
    initialize: function(options) {
        this._isInitialized = false;

        this._viewsContainer = new BackboneBabysitter();

        this.addRegions({
            'app': '.application'
        });

        this.appRouter = new AppRouter({
            app: this,
            controller: new AppController({
                app: this
            })
        });

        this.addInitializer(function () {
            Backbone.history.start();
        });

        this._isInitialized = true;

        this.vent.trigger('initialize');
    },
    isInitialized: function () {
        return this._isInitialized;
    },
    addView: function(view, indexer) {
        this._viewsContainer.add(view, indexer);
    },
    removeView: function(view) {
        this._viewsContainer.remove(view);
    }
});

export default App;