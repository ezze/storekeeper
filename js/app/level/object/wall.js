define([
     './object'
], function(
    object
) {
    "use strict";

    var Wall = function(level, row, column) {
        object.apply(this, arguments);
        this._name = 'Wall';
        this._sprite.gotoAndStop('wall');
    };
    Wall.prototype = Object.create(object.prototype);
    return Wall;
    });