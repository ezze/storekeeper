define([
    'lodash',
    './box',
    './movable',
    './wall'
], function(
    _,
    Box,
    Movable,
    Wall
) {
    'use strict';

    var Box = function(level, row, column) {
        Movable.apply(this, arguments);
        this._name = 'Box';
        this._sprite.gotoAndStop(['box']);
    };

    Box.prototype = Object.create(Movable.prototype);

    Box.prototype.detectCollision = function(direction) {
        var collision = {
            detected: false,
            target: null
        };

        var targetObjects = this.getMoveTargetObjects(direction);
        _.forEach(targetObjects, function(object) {
            if (object instanceof Wall || object instanceof Box) {
                // Wall or another box don't allow the box being moved
                collision = {
                    detected: true,
                    target: object
                };
                return false;
            }
        });

        return collision;
    };

    Box.prototype.startAnimation = function() {
        // Doing nothing with a box during its movement
    };

    return Box;
});