/**
 * @module Direction
 */
define([
    'lodash'
], function(
    _
) {
    'use strict';

    /**
     * Object defining [worker]{@link module:Worker}'s possible move directions
     * and containing few static methods to validate them.
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.0
     * @alias module:Direction
     * @namespace
     */
    var Direction = {
        /**
         * Means that no direction is set.
         *
         * @type {String}
         */
        NONE: 'none',

        /**
         * Represents direction to the left.
         *
         * @type {String}
         */
        LEFT: 'left',

        /**
         * Represents direction to the right.
         */
        RIGHT: 'right',

        /**
         * Represents direction to the up.
         */
        UP: 'up',

        /**
         * Represents direction to the down.
         */
        DOWN: 'down'
    };

    /**
     * Checks whether a given value is a valid direction.
     *
     * @param {String} direction
     * Value to test.
     *
     * @returns {Boolean}
     *
     * @see module:Direction.isValidHorizontal
     * @see module:Direction.isValidVertical
     */
    Direction.isValid = function(direction) {
        return _.contains([
            Direction.NONE,
            Direction.LEFT,
            Direction.RIGHT,
            Direction.UP,
            Direction.DOWN
        ], direction);
    };

    /**
     * Checks whether a given value is a valid horizontal direction.
     *
     * @param {String} direction
     * Value to test.
     *
     * @returns {Boolean}
     *
     * @see module:Direction.isValid
     * @see module:Direction.isValidVertical
     */
    Direction.isValidHorizontal = function(direction) {
        return _.contains([
            Direction.LEFT,
            Direction.RIGHT
        ], direction);
    };

    /**
     * Checks whether a given value is a valid vertical direction.
     *
     * @param {String} direction
     * Value to test.
     *
     * @returns {Boolean}
     *
     * @see module:Direction.isValid
     * @see module:Direction.isValidHorizontal
     */
    Direction.isValidVertical = function(direction) {
        return _.contains([
            Direction.UP,
            Direction.DOWN
        ], direction);
    };

    /**
     * Gets a direction counter to a given one.
     *
     * @param {String} direction
     * Direction to get counter direction for.
     *
     * @returns {String}
     */
    Direction.getCounterDirection = function(direction) {
        switch (direction) {
            case Direction.LEFT: return Direction.RIGHT;
            case Direction.RIGHT: return Direction.LEFT;
            case Direction.UP: return Direction.DOWN;
            case Direction.DOWN: return Direction.UP;
            default: return Direction.NONE;
        }
    };

    return Direction;
});