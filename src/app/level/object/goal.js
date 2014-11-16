define([
    './scene-object'
], function(
    SceneObject
) {
    'use strict';

    var Goal = function(options) {
        SceneObject.apply(this, arguments);
        this._name = 'Goal';
        this._sprite.gotoAndStop(['goal']);
    };

    Goal.prototype = Object.create(SceneObject.prototype);

    return Goal;
});