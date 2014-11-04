define([
    'jquery',
    'underscore',
    './object'
], function(
    $,
    _,
    object
) {
    "use strict";

    var Worker = function(level, row, column) {
        object.apply(this, arguments);
        this._state = {
            current: 'stand',
            previous: 'stand',
            _animationStarted: false
        };

        this.setLookDirection('left');
    };
    Worker.prototype = Object.create(object.prototype);

    _.extend(Worker.prototype, {

        getCurrentState: function() {
            return this._state.current;
        },
        setCurrentState: function (state) {
            this._state.current = state;
        },
        getPreviousState: function() {
            return this._state.previous;
        },
        getLookDirection: function() {
            return this._lookDirection;
        },

        setLookDirection: function(direction) {
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
        },

        moveLeft: function() {
            if (!this._state._animationStarted) {
                this.setLookDirection('left');
                this._sprite.gotoAndPlay('workerLeftWalk');
                this._state._animationStarted = true;
            }
            if (this._state.previous === 'stand') {
                this._state.previous = this._state.current;
            }
            this._sprite.x -= this._sprite.vX;
        },

        moveRight: function(){
            if (!this._state._animationStarted) {
                this.setLookDirection('right');
                this._sprite.gotoAndPlay('workerRightWalk');
                this._state._animationStarted = true;
            }
            if (this._state.previous === 'stand') {
                this._state.previous = this._state.current;
            }
            this._sprite.x += this._sprite.vX;
        },

        moveUp: function() {
            if (!this._state._animationStarted) {
                switch (this.getLookDirection()) {
                    case 'left':
                        this._sprite.gotoAndPlay('workerLeftWalk');
                        break;
                    case 'right':
                        this._sprite.gotoAndPlay('workerRightWalk');
                        break;
                }
                this._state._animationStarted = true;
            }
            if (this._state.previous === 'stand') {
                this._state.previous = this._state.current;
            }
            this._sprite.y -= this._sprite.vY;
        },

        moveDown: function() {
            if (!this._state._animationStarted) {
                switch (this.getLookDirection()) {
                    case 'left':
                        this._sprite.gotoAndPlay('workerLeftWalk');
                        break;
                    case 'right':
                        this._sprite.gotoAndPlay('workerRightWalk');
                        break;
                }
                this._state._animationStarted = true;
            }
            if (this._state.previous === 'stand') {
                this._state.previous = this._state.current;
            }
            this._sprite.y += this._sprite.vY;
        },
        // @override
        stopAnimation: function() {
            this.setCurrentState('stand');
            this.setLookDirection(this._lookDirection);
            this._state._animationStarted = false;
        }
    });
    return Worker;
    });