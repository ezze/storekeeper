'use strict';

import SceneObject from './scene-object';
import Direction from '../direction';

var Movable = function (options) {
    SceneObject.apply(this, arguments);

    this._name = 'Movable';
    this._movesCount = 0;
    this._direction = Direction.NONE;
    this._moveStep = 1 / 8;
    this._moveCollisionTarget = null;
};

Movable.EVENT_ANIMATE = 'movable:animate';
Movable.EVENT_BEFORE_MOVE = 'movable:before-move';
Movable.EVENT_MOVE = 'movable:move';
Movable.EVENT_COLLIDE = 'movable:collide';
Movable.EVENT_STOP = 'movable:stop';

Movable.prototype = Object.create(SceneObject.prototype);

Movable.prototype.isMoving = function() {
    return this.row % 1 !== 0 || this.column % 1 !== 0;
};

Movable.prototype.move = function(direction) {
    var vent = this._app.vent,
        row = this.row,
        column = this.column;

    // Checking whether object's atomic move is in progress
    if (this.isMoving()) {
        // We can't affect a direction of currently animated atomic move
        direction = this._direction;
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

Movable.prototype.play = function(direction) {
    if (this._direction !== direction) {
        this.startAnimation(direction);
    }

    this.updatePixels();

    this._direction = direction;
};

Movable.prototype.stop = function(direction) {
    if (this._direction !== Direction.NONE || direction !== Direction.NONE) {
        this.stopAnimation();
    }

    this._direction = Direction.NONE;

    var stopParams = {
        object: this,
        direction: direction
    };

    this._app.vent.trigger(Movable.EVENT_STOP, stopParams);
    this.onStop(stopParams);
};

Movable.prototype.detectCollision = function(direction) {
    throw new Error('Method "detectCollision" is not implemented for object "' + this.name + '".');
};

Movable.prototype.startAnimation = function(direction) {
    throw new Error('Method "startAnimation" is not implemented for object "' + this.name + '".');
};

Movable.prototype.stopAnimation = function() {
    this._sprite.stop();
};

Movable.prototype.onBeforeMove = function(params) {
    return true;
};

Movable.prototype.onMove = function(params) {};

Movable.prototype.onAnimate = function(params) {};

Movable.prototype.onCollide = function(params) {};

Movable.prototype.onStop = function(params) {};

Object.defineProperties(Movable.prototype, {
    movesCount: {
        get: function() {
            return this._movesCount;
        }
    }
});

export default Movable;