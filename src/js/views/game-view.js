'use strict';

import Marionette from 'backbone.marionette';

import Game from '../game';
import BasicRenderer from '../level/render/basic-renderer';

var GameView = Marionette.ItemView.extend({
    className: 'game',
    template: require('../templates/game.mustache'),
    ui: {
        field: '.game-field'
    },
    initialize: function(options) {
        this._app = options.app;
    },
    onShow: function() {
        this._app.game = new Game({
            app: this._app,
            renderer: new BasicRenderer({
                container: this.ui.field.get(0)
            })
        });
    },
    onDestroy: function() {
        this._app.game.destroy();
    }
});

export default GameView;