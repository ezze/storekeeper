define([
    'lodash',
    './scene-object',
    '../../exception'
], function(
    _,
    SceneObject,
    Exception
) {
    'use strict';

    var Movable = function (level, row, column) {
        SceneObject.apply(this, arguments);

        this.previousState = 'stand';
        this.currentState = 'stand';
        this._animationStarted = false;
        this._hasCollision = false;
        this.isMoving = false;
        this._nearbyBox = false;
    };

    Movable.prototype = Object.create(SceneObject.prototype);

    Movable.prototype._getState = function(state) {
        if (typeof state !== 'string') {
            // TODO: throw an exception
            return;
        }

        switch(state) {
            case 'left': return this.moveLeft;
            case 'right': return this.moveRight;
            case 'up': return this.moveUp;
            case 'down': return this.moveDown;
            case 'stand': return this.stand;
            default: throw new Exception('Incorrect state!');
        }
    };

    Movable.prototype.getCurrentState = function() {
        return this._getState(this.currentState);
    };

    Movable.prototype.setCurrentState = function(state) {
        this.currentState = state;
    };

    Movable.prototype.getPreviousState = function() {
        return this._getState(this.previousState);
    };

    Movable.prototype.setPreviousState = function(state) {
        this.previousState = state;
    };

    Movable.prototype.swapStates = function() {
        this.previousState = this.currentState;
    };

    Movable.prototype.stopAnimation = function() {
        this.setCurrentState('stand');
        this.setPreviousState('stand');
        this.isMoving = false;
        this._animationStarted = false;
    };

    Movable.prototype.checkCollision = function() {
        this._hasCollision = false;
        var equalToRow = (this._sprite.x % this._width === 0);
        var equalToColumn = (this._sprite.y % this._height === 0);
        if (equalToRow && equalToColumn) {
            if(this._nearbyBox) {
                this._nearbyBox.transformToLocal();
                this._nearbyBox = false;
            }
            this.isMoving = true;
            this._hasCollision = this.collisionWithObject(this.currentState, this);
            if (this._hasCollision) {
                this.stopAnimation();
            }

            // TODO: remove storekeeper reference
            /*
            if (!this._hasCollision && !this.level._storekeeper._userAction.isKeyDown) {
                this.stopAnimation();
                this._hasCollision = true;
            }
            */
        }
        return this._hasCollision;
    };

    Movable.prototype.collisionWithObject = function(direction, object) {
        object.transformToLocal();

        var col = object.column;
        var row = object.row;

        var walls = object.level.walls;
        var boxes = object.level.boxes;
        var nearbyWall;
        var nearbyBox;
        switch(direction) {
            case 'left':
                nearbyWall =
                _.find(walls, function(wall) {
                    return ((wall._row === row) && (wall._column + 1 === col));
                });
                if (!nearbyWall) {
                    nearbyBox =
                    _.find(boxes, function(box) {
                        return ((box._row === row) && (box._column + 1 === col));
                    });
                }
                if (nearbyBox && object.name !== 'Box') {
                    this._nearbyBox = nearbyBox;
                    nearbyBox = undefined;
                    nearbyBox = Movable.prototype.collisionWithObject('left', this._nearbyBox);
                }
                break;
            case 'right':
                nearbyWall =
                    _.find(walls, function(wall) {
                        return ((wall._row === row) && (wall._column - 1 === col));
                    });
                if (!nearbyWall) {
                    nearbyBox =
                        _.find(boxes, function(box) {
                            return ((box._row === row) && (box._column - 1 === col));
                        });
                }
                if (nearbyBox && object.name !== 'Box') {
                    this._nearbyBox = nearbyBox;
                    nearbyBox = undefined;
                    nearbyBox = Movable.prototype.collisionWithObject('right', this._nearbyBox);
                }
                break;
            case 'up':
                nearbyWall =
                    _.find(walls, function(wall) {
                        return ((wall._row + 1 === row) && (wall._column === col));
                    });
                if (!nearbyWall) {
                    nearbyBox =
                        _.find(boxes, function(box) {
                            return ((box._row + 1 === row) && (box._column === col));
                        });
                }
                if (nearbyBox && object.name !== 'Box') {
                    this._nearbyBox = nearbyBox;
                    nearbyBox = undefined;
                    nearbyBox = Movable.prototype.collisionWithObject('up', this._nearbyBox);
                }
                break;
            case 'down':
                nearbyWall =
                    _.find(walls, function(wall) {
                        return ((wall._row - 1 === row) && (wall._column === col));
                    });
                if (!nearbyWall) {
                    nearbyBox =
                        _.find(boxes, function(box) {
                            return ((box._row - 1 === row) && (box._column === col));
                        });
                }
                if (nearbyBox && object.name !== 'Box') {
                    this._nearbyBox = nearbyBox;
                    nearbyBox = undefined;
                    nearbyBox = Movable.prototype.collisionWithObject('down', this._nearbyBox);
                }
                break;
        }
        return (nearbyWall || nearbyBox);
    };

    return Movable;
});