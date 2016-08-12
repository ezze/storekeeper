'use strict';

import _ from 'lodash';

var Direction = {
    NONE: 'none',
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
};

Direction.isValid = function(direction) {
    return _.includes([
        Direction.NONE,
        Direction.LEFT,
        Direction.RIGHT,
        Direction.UP,
        Direction.DOWN
    ], direction);
};

Direction.isValidHorizontal = function(direction) {
    return _.includes([
        Direction.LEFT,
        Direction.RIGHT
    ], direction);
};

Direction.isValidVertical = function(direction) {
    return _.includes([
        Direction.UP,
        Direction.DOWN
    ], direction);
};

Direction.getCounterDirection = function(direction) {
    switch (direction) {
        case Direction.LEFT: return Direction.RIGHT;
        case Direction.RIGHT: return Direction.LEFT;
        case Direction.UP: return Direction.DOWN;
        case Direction.DOWN: return Direction.UP;
        default: return Direction.NONE;
    }
};

export default Direction;