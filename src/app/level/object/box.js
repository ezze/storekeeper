define([
    'lodash',
    './goal',
    './movable',
    './wall'
], function(
    _,
    Goal,
    Movable,
    Wall
) {
    'use strict';

    var Box = function(options) {
        Movable.apply(this, arguments);
        this._name = 'Box';

        var isOnGoal = _.isBoolean(options.onGoal) ? options.onGoal : false;
        this._sprite.gotoAndStop(isOnGoal ? 'boxOnGoal' : 'box');
    };

    Box.EVENT_ON_GOAL = 'box:onGoal';
    Box.EVENT_OFF_GOAL = 'box:offGoal';

    Box.prototype = Object.create(Movable.prototype);

    Box.prototype.detectCollision = function(direction) {
        var collision = {
            detected: false,
            target: null
        };

        var targetObjects = this.getMoveTargetObjects(direction);
        _.forEach(targetObjects, function(object) {
            if (object instanceof Wall || object instanceof Box) {
                // Wall or another box don't allow the box being moved
                collision = {
                    detected: true,
                    target: object
                };
                return false;
            }
        });

        return collision;
    };

    Box.prototype.startAnimation = function() {
        // Doing nothing with a box during its movement
    };

    Box.prototype.onBeforeMoved = function(params) {
        var isOffGoal = true;

        var targetObject = params.object.getMoveTargetObjects(params.direction);
        _.forEach(targetObject, function(object) {
            if (object instanceof Goal) {
                isOffGoal = false;
                return false;
            }
        });

        if (isOffGoal) {
            this._sprite.gotoAndStop('box');
        }

        return Movable.prototype.onBeforeMoved.apply(this, arguments);
    };

    Box.prototype.onMoved = function(params) {
        var targetObjects = this.level.getObjects(this.row, this.column);
        _.forEach(targetObjects, function(object) {
            if (object instanceof Goal) {
                this._sprite.gotoAndStop('boxOnGoal');

                if (this.level.eventManager) {
                    this.level.eventManager.raiseEvent(Box.EVENT_ON_GOAL, {
                        box: this
                    });
                }

                return false;
            }
        }, this);
    };

    return Box;
});