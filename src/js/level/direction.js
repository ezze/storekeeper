import _ from 'underscore';

let Direction = {
    NONE: 'none',
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
};

_.extend(Direction, {
    isValid: function(direction) {
        return _.contains([
            Direction.NONE,
            Direction.LEFT,
            Direction.RIGHT,
            Direction.UP,
            Direction.DOWN
        ], direction);
    },
    isValidHorizontal: function(direction) {
        return _.contains([
            Direction.LEFT,
            Direction.RIGHT
        ], direction);
    },
    isValidVertical: function(direction) {
        return _.contains([
            Direction.UP,
            Direction.DOWN
        ], direction);
    },
    getOppositeDirection: function(direction) {
        switch (direction) {
            case Direction.LEFT: return Direction.RIGHT;
            case Direction.RIGHT: return Direction.LEFT;
            case Direction.UP: return Direction.DOWN;
            case Direction.DOWN: return Direction.UP;
            default: return Direction.NONE;
        }
    },
    getShift: function(direction) {
        let x = 0,
            y= 0;

        switch (direction) {
            case Direction.LEFT: x = -1; y = 0; break;
            case Direction.RIGHT: x = 1; y = 0; break;
            case Direction.UP: x = 0; y = -1; break;
            case Direction.DOWN: x = 0; y = 1; break;
        }

        return {
            x: x,
            y: y
        };
    }
});

export default Direction;