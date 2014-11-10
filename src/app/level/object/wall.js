define([
     './sprite'
], function(
    Sprite
) {
    'use strict';

    var Wall = function(level, row, column) {
        Sprite.apply(this, arguments);
        this._name = 'Wall';
        this._sprite.gotoAndStop('wall');
    };

    Wall.prototype = Object.create(Sprite.prototype);

    return Wall;
});