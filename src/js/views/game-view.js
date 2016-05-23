'use strict';

import Marionette from 'backbone.marionette';
import Storekeeper from '../storekeeper';

var GameView = Marionette.LayoutView.extend({
    className: 'game',
    template: require('../templates/game.mustache'),
    ui: {
        field: '.game-field'
    },
    onShow: function() {
        var app = this.getOption('app');
        new Storekeeper({
            app: app,
            container: this.ui.field.get(0),
            levelSetSource: 'levels/classic.json'
        });
    }
});

module.exports = GameView;