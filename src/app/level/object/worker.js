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

    Worker.prototype.moveLeft = function() {
        if (!this._animationStarted) {
            this.lookDirection = Direction.LEFT;
            this._sprite.gotoAndPlay('workerLeftWalk');
            this._animationStarted = true;
        }

        if (!this.checkCollision()) {
            if (this._nearbyBox) {
                this._nearbyBox.moveLeft();
            }
            this.swapStates();
            this._sprite.x -= this._sprite.vX;
        }
    };

    Worker.prototype.moveRight = function () {
        if (!this._animationStarted) {
            this.lookDirection = Direction.RIGHT;
            this._sprite.gotoAndPlay('workerRightWalk');
            this._animationStarted = true;
        }

        if (!this.checkCollision()) {
            if (this._nearbyBox) {
                this._nearbyBox.moveRight();
            }
            this.swapStates();
            this._sprite.x += this._sprite.vX;
        }
    };

    Worker.prototype.moveUp = function() {
        if (!this._animationStarted) {
            switch (this.lookDirection) {
                case Direction.LEFT: this._sprite.gotoAndPlay('workerLeftWalk'); break;
                case Direction.RIGHT: this._sprite.gotoAndPlay('workerRightWalk'); break;
            }
            this._animationStarted = true;
        }

        if (!this.checkCollision()) {
            if (this._nearbyBox) {
                this._nearbyBox.moveUp();
            }
            this.swapStates();
            this._sprite.y -= this._sprite.vY;
        }
    };

    Worker.prototype.moveDown = function() {
        if (!this._animationStarted) {
            switch (this.lookDirection) {
                case 'left':
                    this._sprite.gotoAndPlay('workerLeftWalk');
                    break;
                case 'right':
                    this._sprite.gotoAndPlay('workerRightWalk');
                    break;
            }
            this._animationStarted = true;
        }
        if (!this.checkCollision()) {
            if (this._nearbyBox) {
                this._nearbyBox.moveDown();
            }
            this.swapStates();
            this._sprite.y += this._sprite.vY;
        }
    };

    Worker.prototype.stand = {};

    // @override
    var stopAnimation = Worker.prototype.stopAnimation;

    Worker.prototype.stopAnimation = function() {
        this.lookDirection = this._lookDirection;
        stopAnimation.call(this);
    };

    Object.defineProperties(Worker.prototype, {
        lookDirection: {
            get: function() {
                return this._lookDirection;
            },
            set: function(lookDirection) {
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