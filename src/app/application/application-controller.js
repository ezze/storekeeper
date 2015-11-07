define([
    'lodash',
    'marionette',
    '../views/application-view',
    '../views/game-view'
], function(
    _,
    Marionette,
    ApplicationView,
    GameView
) {
    'use strict';

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
        main: function() {
            this._appView.getRegion('content').show(this._gameView);
        }
    });

    return ApplicationController;
});