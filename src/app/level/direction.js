define([
    'lodash'
], function(
    _
) {
    'use strict';

    var Direction = {
        NONE: 'none',
        LEFT: 'left',
        RIGHT: 'right',
        UP: 'up',
        DOWN: 'down'
    };

    Direction.isValid = function(direction) {
        return _.contains([
            Direction.NONE,
            Direction.LEFT,
            Direction.RIGHT,
            Direction.UP,
            Direction.DOWN
        ], direction);
    };

    Direction.isValidHorizontal = function(direction) {
        return _.contains([
            Direction.LEFT,
            Direction.RIGHT
        ], direction);
    };

    Direction.isValidVertical = function(direction) {
        return _.contains([
            Direction.UP,
            Direction.DOWN
        ], direction);
    };

    return Direction;
});