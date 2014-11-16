define([
     './scene-object'
], function(
    SceneObject
) {
    'use strict';

    var Wall = function(level, row, column) {
        SceneObject.apply(this, arguments);

        this._name = 'Wall';
        this._sprite.gotoAndStop('wall');
    };

    Wall.prototype = Object.create(SceneObject.prototype);

    return Wall;
});