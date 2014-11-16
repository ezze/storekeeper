define([
    'jquery',
    './movable',
    '../direction',
    '../../exception'
], function(
    $,
    Movable,
    Direction,
    Exception
) {
    'use strict';

    var Worker = function(level, row, column) {
        Movable.apply(this, arguments);
        this._name = 'Worker';

        this.lookDirection = Direction.LEFT;
    };

    Worker.prototype = Object.create(Movable.prototype);

    Worker.prototype.detectCollision = function(direction) {
        if (Direction.isValidHorizontal(direction)) {
            this.lookDirection = direction;
        }

        return false;
    };

    Worker.prototype.startAnimation = function(direction) {
        switch (this.lookDirection) {
            case Direction.LEFT: this._sprite.gotoAndPlay('workerLeftWalk'); break;
            case Direction.RIGHT: this._sprite.gotoAndPlay('workerRightWalk'); break;
        }
    };

    Worker.prototype.stopAnimation = function() {
        switch (this.lookDirection) {
            case Direction.LEFT: this._sprite.gotoAndStop('workerLeftStand'); break;
            case Direction.RIGHT: this._sprite.gotoAndStop('workerRightStand'); break;
        }
    };

    Object.defineProperties(Worker.prototype, {
        lookDirection: {
            get: function() {
                return this._lookDirection;
            },
            set: function(lookDirection) {
                if (lookDirection === this._lookDirection) {
                    return;
                }

                if (!Direction.isValidHorizontal(lookDirection)) {
                    throw new Exception('Look direction is invalid.');
                }
                this._lookDirection = lookDirection;

                switch (this._lookDirection) {
                    case Direction.LEFT: this._sprite.gotoAndStop('workerLeftStand'); break;
                    case Direction.RIGHT: this._sprite.gotoAndStop('workerRightStand'); break;
                }
            }
        }
    });

    return Worker;
});