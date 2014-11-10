define([
    './sprite'
], function(
    Sprite
) {
    'use strict';

    var Goal = function(level, row, column) {
        Sprite.apply(this, arguments);
        this._name = 'Goal';
        this._sprite.gotoAndStop(['goal']);
    };

    Goal.prototype = Object.create(Sprite.prototype);

    return Goal;
});