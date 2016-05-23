'use strict';

import Marionette from 'backbone.marionette';

import ApplicationView from '../views/application-view';
import GameView from '../views/game-view';

var ApplicationController = Marionette.Controller.extend({
    initialize: function(options) {
        var app = options.app;

        this._appView = new ApplicationView({
            app: app
        });
        this._gameView = new GameView({
            app: app
        });

        app.addView(this._appView, 'app');
        app.addView(this._gameView, 'game');

        app.getRegion('app').show(this._appView);
    },
    game: function() {
        this._appView.getRegion('content').show(this._gameView);
    },
    editor: function() {
        alert('Editor is not implemented yet!');
    }
});

module.exports = ApplicationController;
