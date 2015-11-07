/**
 * @module Movable
 */
define([
    'lodash',
    './scene-object',
    '../direction'
], function(
    _,
    SceneObject,
    Direction
) {
    'use strict';

    /**
     * Represents a movable scene object of a level.
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {module:Level} options.level
     * Level this object will be added to.
     *
     * @param {Number} options.row
     * Zero-based row of the level this object will be placed in.
     *
     * @param {Number} options.column
     * Zero-based column of the level this object will be placed in.
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.0
     * @alias module:Movable
     * @class
     * @augments module:SceneObject
     */
    var Movable = function (options) {
        SceneObject.apply(this, arguments);

        this._name = 'Movable';
        this._movesCount = 0;
        this._moveDirection = Direction.NONE;
        this._moveStep = 1 / 8;
        this._moveCollisionTarget = null;
    };

    /**
     * Name of an event raised when movable scene object is animated.
     *
     * @type {String}
     */
    Movable.EVENT_ANIMATE = 'movable:animate';

    /**
     * Name of an event raised just before movable scene object starts atomic move.
     *
     * @type {String}
     */
    Movable.EVENT_BEFORE_MOVE = 'movable:before-move';

    /**
     * Name of an event raised when movable scene object's atomic move is over.
     *
     * @type {String}
     */
    Movable.EVENT_MOVE = 'movable:move';

    /**
     * Name of an event raised when movable scene object is collided with another scene object.
     *
     * @type {String}
     */
    Movable.EVENT_COLLIDE = 'movable:collide';

    /**
     * Name of an event raised when movable scene object is stopped.
     *
     * @type {String}
     */
    Movable.EVENT_STOP = 'movable:stop';

    Movable.prototype = Object.create(SceneObject.prototype);

    /**
     * Checks whether object's atomic move is in progress.
     *
     * @returns {Boolean}
     */
    Movable.prototype.isMoving = function() {
        return this.row % 1 !== 0 || this.column % 1 !== 0;
    };

    /**
     * Starts an atomic move in a given direction or produces the next step
     * of previously started but not finished atomic move.
     *
     * @param {String} direction
     * Desired direction to move this object to. If atomic move is already
     * [in progess]{@link module:Movable#isMoving} then this direction will
     * be overriden by the direction of this move and the method will
     * produce the next step of this move.
     *
     * @returns {Boolean}
     * <code>true</code> if scene object is moved by the step of atomic move,
     * <code>false</code> if scene object is collided with another object or
     * if new atomic move is not started.
     *
     * @see module:Movable#isMoving
     * @see module:Direction
     */
    Movable.prototype.move = function(direction) {
        var vent = this._app.vent,
            row = this.row,
            column = this.column;

        // Checking whether object's atomic move is in progress
        if (this.isMoving()) {
            // We can't affect a direction of currently animated atomic move
            direction = this._moveDirection;
        }
        else {
            // Forget affected object just before new atomic move
            this._moveCollisionTarget = null;
        }

        if (direction === Direction.NONE) {
            this.stop(direction);
            return false;
        }

        // If atomic move of the object is not in progress
        // we will detect possible collision with some other object located relative this object
        // in a given direction
        var collision;
        if (!this.isMoving() && (collision = this.detectCollision(direction)).detected) {
            var collideParams = {
                object: this,
                direction: direction,
                target: collision.target
            };

            vent.trigger(Movable.EVENT_COLLIDE, collideParams);
            this.onCollide(collideParams);

            this.stop(direction);
            return false;
        }

        if (!this.isMoving()) {
            // A chance to prevent atomic move's start through event handlers
            var beforeMoveParams = {
                object: this,
                direction: direction,
                movesCount: this._movesCount
            };

            if (!vent.trigger(Movable.EVENT_BEFORE_MOVE, beforeMoveParams)) {
                this.stop(direction);
                return false;
            }

            if (!this.onBeforeMove(beforeMoveParams)) {
                this.stop(direction);
                return false;
            }
        }

        // If some object is found during collision detection
        // but doesn't prevent a move of this object, then it will be also moved
        if (collision && !collision.detected && (collision.target instanceof Movable)) {
            this._moveCollisionTarget = collision.target;
        }

        // Calculating new coordinates of the object
        switch (direction) {
            case Direction.LEFT: this.column = column - this._moveStep; break;
            case Direction.RIGHT: this.column = column + this._moveStep; break;
            case Direction.UP: this.row = row - this._moveStep; break;
            case Direction.DOWN: this.row = row + this._moveStep; break;
        }

        // Checking whether atomic move of the object is finished
        if (!this.isMoving()) {
            this._movesCount += 1;

            var moveParams = {
                object: this,
                direction: direction,
                movesCount: this._movesCount
            };

            vent.trigger(Movable.EVENT_MOVE, moveParams);
            this.onMove(moveParams);
        }

        // Animating recent calculations - both the object and a target object (if present) affected by collision
        if (this._moveCollisionTarget !== null) {
            this._moveCollisionTarget.move(direction);
        }
        this.play(direction);

        // Raising an event on each animation frame
        var animateParams = {
            object: this,
            direction: direction
        };

        vent.trigger(Movable.EVENT_ANIMATE, animateParams);
        this.onAnimate(animateParams);

        return true;
    };

    /**
     * Gets an array of scene objects located next to this object in a given direction.
     *
     * @param {String} direction
     * Direction to get neighboring scene objects in.
     *
     * @returns {Array}
     *
     * @see module:Direction
     * @see module:Level#getObjects
     */
    Movable.prototype.getMoveTargetObjects = function(direction) {
        var row = this.row;
        var column = this.column;

        switch (direction) {
            case Direction.LEFT: column -= 1; break;
            case Direction.RIGHT: column += 1; break;
            case Direction.UP: row -= 1; break;
            case Direction.DOWN: row += 1; break;
            default: throw new Error('Direction is invalid.');
        }

        return this.level.getObjects(row, column);
    };

    /**
     * Starts object's animation accompanying its move in a given direction
     * (if this animation is not started yet) and updates scene coordinates of the object
     * forced by {@link module:Movable#move} method.
     *
     * @protected
     *
     * @param {String} direction
     * Direction of object's move.
     *
     * @see module:Movable#stop
     */
    Movable.prototype.play = function(direction) {
        if (this._moveDirection !== direction) {
            this.startAnimation(direction);
        }

        this.updatePixels();

        this._moveDirection = direction;
    };

    /**
     * Stops object's animation.
     *
     * @protected
     *
     * @param {String} direction
     * Direction of object's move.
     *
     * @see module:Movable#play
     */
    Movable.prototype.stop = function(direction) {
        if (this._moveDirection !== Direction.NONE || direction !== Direction.NONE) {
            this.stopAnimation();
        }

        this._moveDirection = Direction.NONE;

        var stopParams = {
            object: this,
            direction: direction
        };

        this._app.vent.trigger(Movable.EVENT_STOP, stopParams);
        this.onStop(stopParams);
    };

    /**
     * Checks whether this scene object will collide with another scene object
     * if it will be moved in a given direction.
     *
     * @abstract
     *
     * @param {String} direction
     * Direction of object's possible move.
     *
     * @see module:Direction
     *
     * @returns {Object}
     * Object with the following properties:
     * <ul>
     * <li><code>detected</code> &ndash; shows whether move will be prevented by another scene object;</li>
     * <li><code>target</code> &ndash; reference to scene object located in the given direction; if
     * <code>detected</code> is <code>true</code> then this object prevents the move, if <code>detected</code>
     * is <code>false</code> then this object is also movable and will be moved in the given direction.</li>
     * </ul>
     */
    Movable.prototype.detectCollision = function(direction) {
        throw new Error('Method "detectCollision" is not implemented for object "' + this.name + '".');
    };

    /**
     * Starts object's animation corresponding to direction of its move.
     *
     * @abstract
     * @protected
     *
     * @param {String} direction
     * Direction of object's move.
     */
    Movable.prototype.startAnimation = function(direction) {
        throw new Error('Method "startAnimation" is not implemented for object "' + this.name + '".');
    };

    /**
     * Stops object's animation.
     *
     * @protected
     */
    Movable.prototype.stopAnimation = function() {
        this._sprite.stop();
    };

    /**
     * This method will be called just before start of atomic move caused
     * by {@link module:Movable#move} method.
     *
     * <p>If it returns <code>false</code> then the move will be prevented.</p>
     *
     * @param {Object} params
     * Object with the following properties:
     *
     * @param {module:Movable} params.object
     * Reference to this object.
     *
     * @param {String} params.direction
     * Direction of coming move.
     *
     * @param {Number} params.movesCount
     * Count of moves performed by this object.
     *
     * @returns {Boolean}
     *
     * @see module:Movable#move
     */
    Movable.prototype.onBeforeMove = function(params) {
        return true;
    };

    /**
     * This method will be called when scene object's atomic move caused
     * by {@link module:Movable#move} method is over.
     *
     * @param {Object} params
     * Object with the following properties:
     *
     * @param {module:Movable} params.object
     * Reference to this object.
     *
     * @param {String} params.direction
     * Direction of performed move.
     *
     * @param {Number} params.movesCount
     * Count of moves performed by this object.
     *
     * @see module:Movable#move
     */
    Movable.prototype.onMove = function(params) {};

    /**
     * This method will be called when each next step of scene object's
     * atomic move is performed by {@link module:Movable#move} method.
     *
     * @param {Object} params
     * Object with the following properties:
     *
     * @param {module:Movable} params.object
     * Reference to this object.
     *
     * @param {String} params.direction
     * Direction of performed move.
     *
     * @see module:Movable#move
     */
    Movable.prototype.onAnimate = function(params) {};

    /**
     * This method will be called when scene object is collided with another scene object
     * during recent call of {@link module:Movable#move} method.
     *
     * @param {Object} params
     * Object with the following properties:
     *
     * @param {module:Movable} params.object
     * Reference to this object.
     *
     * @param {String} params.direction
     * Direction of prevented move.
     *
     * @param {module:SceneObject} params.target
     * Reference to scene object prevented the move.
     *
     * @see module:Movable#move
     */
    Movable.prototype.onCollide = function(params) {};

    /**
     * This method will be called when sequential atomic moves of
     * scene object performed by {@link module:Movable#move} method are over.
     *
     * @param {Object} params
     * Object with the following properties:
     *
     * @param {module:Movable} params.object
     * Reference to this object.
     *
     * @param {String} params.direction
     * Direction of last performed atomic move.
     *
     * @see module:Movable#move
     */
    Movable.prototype.onStop = function(params) {};

    Object.defineProperties(Movable.prototype, {
        /**
         * Gets count of moves performed by this scene object.
         */
        movesCount: {
            get: function() {
                return this._movesCount;
            }
        }
    });

    return Movable;
});