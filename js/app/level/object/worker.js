define([
    'jquery',
    'underscore',
    './movable'
], function(
    $,
    _,
    Movable
) {
    "use strict";

    var Worker = function(level, row, column) {
        Movable.apply(this, arguments);
        this._name = 'Worker';
        this.setLookDirection('left');
    };

    Worker.prototype = Object.create(Movable.prototype);

    Worker.prototype.moveLeft = function() {
        if (!this._animationStarted) {
            this.setLookDirection('left');
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
            this.setLookDirection('right');
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
            switch (this.getLookDirection()) {
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
                this._nearbyBox.moveUp();
            }
            this.swapStates();
            this._sprite.y -= this._sprite.vY;
        }

    };

    Worker.prototype.moveDown = function() {
        if (!this._animationStarted) {
            switch (this.getLookDirection()) {
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

    Worker.prototype.getLookDirection = function() {
            return this._lookDirection;
    };

    Worker.prototype.setLookDirection = function(direction) {
            if ($.inArray(direction, ['left', 'right']) === -1)
                return;
            this._lookDirection = direction;
            switch (this._lookDirection) {
                case 'left':
                    this._sprite.gotoAndStop('workerLeftStand');
                    break;
                case 'right':
                    this._sprite.gotoAndStop('workerRightStand');
                    break;
            }
    };
    // @override
    var stopAnimation = Worker.prototype.stopAnimation;
    Worker.prototype.stopAnimation = function() {
        this.setLookDirection(this._lookDirection);
        stopAnimation.call(this);
    };
    return Worker;
    });