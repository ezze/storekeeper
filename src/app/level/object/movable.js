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

    var Movable = function (level, row, column) {
        SceneObject.apply(this, arguments);

        this._moveDirection = Direction.NONE;
        this._moveStep = 1 / 8;
    };

    Movable.prototype = Object.create(SceneObject.prototype);

    Movable.prototype.isMoving = function() {
        return this.row % 1 !== 0 || this.column % 1 !== 0;
    };

    Movable.prototype.move = function(direction) {
        var row = this.row;
        var column = this.column;

        if (this.isMoving()) {
            direction = this._moveDirection;
        }

        if (direction === Direction.NONE || (!this.isMoving() && this.detectCollision(direction))) {
            this.stop(direction);
            return false;
        }

        switch (direction) {
            case Direction.LEFT: this.column = column - this._moveStep; break;
            case Direction.RIGHT: this.column = column + this._moveStep; break;
            case Direction.UP: this.row = row - this._moveStep; break;
            case Direction.DOWN: this.row = row + this._moveStep; break;
        }

        this.play(direction);
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

    Movable.prototype.play = function(direction) {
        if (this._moveDirection !== direction) {
            this.startAnimation(direction);
        }

        this.updatePixels();
        this.level.update();
        this._moveDirection = direction;
    };

    Movable.prototype.stop = function(direction) {
        if (this._moveDirection !== Direction.NONE || direction !== Direction.NONE) {
            this.stopAnimation();
            this.level.update();
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

    return Movable;
});