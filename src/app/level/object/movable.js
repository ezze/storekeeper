/**
 * @module Movable
 */
define([
    'lodash',
    './scene-object',
    '../direction',
    '../../exception'
], function(
    _,
    SceneObject,
    Direction,
    Exception
) {
    'use strict';

    /**
     * Represents a movable object of a level.
     *
     * @author Dmitriy Pushkov
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

    Movable.EVENT_BEFORE_MOVED = 'movable:beforeMoved';
    Movable.EVENT_MOVED = 'movable:moved';

    Movable.prototype = Object.create(SceneObject.prototype);

    Movable.prototype.isMoving = function() {
        return this.row % 1 !== 0 || this.column % 1 !== 0;
    };

    Movable.prototype.move = function(direction, updateLevel) {
        var row = this.row;
        var column = this.column;

        // Checking whether object's atomic movement is in progress
        if (this.isMoving()) {
            // We can't affect a direction of currently animated atomic movement
            direction = this._moveDirection;
        }
        else {
            // Forget affected object just before new atomic movement
            this._moveCollisionTarget = null;
        }

        // If atomic movement of the object is not in progress
        // we will detect possible collision with some other object located relative this object
        // in a given direction
        var collision;
        if (direction === Direction.NONE ||
            (!this.isMoving() && (collision = this.detectCollision(direction)).detected)
        ) {
            this.stop(direction, updateLevel);
            return false;
        }

        if (!this.isMoving()) {
            // A chance to prevent atomic movement's start through event handlers
            var onBeforeMovedParams = {
                object: this,
                movesCount: this._movesCount,
                direction: direction
            };

            if (this.level.eventManager && !this.level.eventManager.raiseEvent(
                Movable.EVENT_BEFORE_MOVED, onBeforeMovedParams)
            ) {
                this.stop(direction, updateLevel);
                return false;
            }

            if (!this.onBeforeMoved(onBeforeMovedParams)) {
                this.stop(direction, updateLevel);
                return false;
            }
        }

        // If some object is found during collision detection
        // but doesn't prevent a movement of this object, then it will be also moved
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

        // Checking whether atomic movement of the object is finished
        if (!this.isMoving()) {
            this._movesCount += 1;

            var onMovedParams = {
                object: this,
                movesCount: this._movesCount,
                direction: direction
            };

            if (this.level.eventManager) {
                this.level.eventManager.raiseEvent(Movable.EVENT_MOVED, onMovedParams);
            }
            this.onMoved(onMovedParams);
        }

        // Animating recent calculations - both the object and a target object (if present) affected by collision
        if (this._moveCollisionTarget !== null) {
            this._moveCollisionTarget.move(direction, false);
        }
        this.play(direction, updateLevel);

        return true;
    };

    Movable.prototype.getMoveTargetObjects = function(direction) {
        var row = this.row;
        var column = this.column;

        switch (direction) {
            case Direction.LEFT: column -= 1; break;
            case Direction.RIGHT: column += 1; break;
            case Direction.UP: row -= 1; break;
            case Direction.DOWN: row += 1; break;
            default: throw new Exception('Direction is invalid.');
        }

        return this.level.getObjects(row, column);
    };

    Movable.prototype.play = function(direction, updateLevel) {
        updateLevel = _.isBoolean(updateLevel) ? updateLevel : false;

        if (this._moveDirection !== direction) {
            this.startAnimation(direction);
        }

        this.updatePixels();
        if (updateLevel) {
            this.level.update();
        }

        this._moveDirection = direction;
    };

    Movable.prototype.stop = function(direction, updateLevel) {
        updateLevel = _.isBoolean(updateLevel) ? updateLevel : false;

        if (this._moveDirection !== Direction.NONE || direction !== Direction.NONE) {
            this.stopAnimation();
            if (updateLevel) {
                this.level.update();
            }
        }

        this._moveDirection = Direction.NONE;
    };

    Movable.prototype.detectCollision = function(direction) {
        throw new Exception('Method "detectCollision" is not implemented for object "' + this.name + '".');
    };

    Movable.prototype.startAnimation = function(direction) {
        throw new Exception('Method "startAnimation" is not implemented for object "' + this.name + '".');
    };

    Movable.prototype.stopAnimation = function() {
        this._sprite.stop();
    };

    Movable.prototype.onBeforeMoved = function(params) {
        return true;
    };

    Movable.prototype.onMoved = function(params) {};

    Object.defineProperties(Movable.prototype, {
        movesCount: {
            get: function() {
                return this._movesCount;
            }
        }
    });

    return Movable;
});