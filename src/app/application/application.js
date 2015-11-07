define([
    'backbone',
    'backbone-babysitter',
    'bootstrap',
    'jquery',
    'lodash',
    'marionette',
    './application-controller',
    './application-router'
], function(
    Backbone,
    BackboneBabysitter,
    Bootstrap,
    $,
    _,
    Marionette,
    ApplicationController,
    ApplicationRouter
) {
    'use strict';

    var Application = Marionette.Application.extend({
        initialize: function() {
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
            this.trigger('initialize');
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

    return Application;
});