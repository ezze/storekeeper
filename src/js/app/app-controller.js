'use strict';

import Marionette from 'backbone.marionette';

import AppView from '../views/app-view';
import GameView from '../views/game-view';

var ApplicationController = Marionette.Controller.extend({
    initialize(options) {
        var app = options.app;

        this._appView = new AppView({
            app: app
        });
        this._gameView = new GameView({
            app: app
        });

        app.getRegion('app').show(this._appView);
    },
    game() {
        this._appView.getRegion('content').show(this._gameView);

    },
    editor() {
        alert('Editor is not implemented yet!');
    }
});

export default ApplicationController;