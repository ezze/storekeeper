define([
    'marionette',
    '../storekeeper',
    'hgn!templates/game'
], function(
    Marionette,
    Storekeeper,
    template
) {
    'use strict';

    var GameView = Marionette.LayoutView.extend({
        className: 'game',
        template: template,
        ui: {
            field: '.game-field'
        },
        onShow: function() {
            new Storekeeper({
                container: this.ui.field.get(0),
                levelSetSource: 'levels/classic.json'
            });
        }
    });

    return GameView;
});