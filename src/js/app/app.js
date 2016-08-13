'use strict';

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';

import AppController from './app-controller';
import AppRouter from './app-router';

var App = Marionette.Application.extend({
    initialize: function(options) {
        this.addRegions({
            'app': '.application'
        });

        new AppRouter({
            app: this,
            controller: new AppController({
                app: this
            })
        });

        this.addInitializer(function () {
            Backbone.history.start();
        });
    }
});

export default App;