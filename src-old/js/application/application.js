'use strict';

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import BackboneBabysitter from 'backbone.babysitter';

import ApplicationController from './application-controller';
import ApplicationRouter from './application-router';

var Application = Marionette.Application.extend({
    initialize: function(options) {
        this._isInitialized = false;

        this._viewsContainer = new BackboneBabysitter();

        this.addRegions({
            'app': '.application'
        });

        this.appRouter = new ApplicationRouter({
            app: this,
            controller: new ApplicationController({
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

export default Application;