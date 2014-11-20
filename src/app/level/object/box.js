define([
    'lodash',
    './goal',
    './movable',
    './wall',
    '../direction',
    '../../event-manager'
], function(
    _,
    Goal,
    Movable,
    Wall,
    Direction,
    EventManager
) {
    'use strict';

    var Box = function(options) {
        Movable.apply(this, arguments);
        this._name = 'Box';

        var isOnGoal = _.isBoolean(options.onGoal) ? options.onGoal : false;
        this._sprite.gotoAndStop(isOnGoal ? 'boxOnGoal' : 'box');
    };

    Box.EVENT_MOVED_ON_GOAL = 'box:movedOnGoal';
    Box.EVENT_MOVED_OUT_OF_GOAL = 'box:movedOutOfGoal';

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
        var isOutOfGoal = false;

        var sourceObjects = this.level.getObjects(this.row, this.column);
        _.forEach(sourceObjects, function(object) {
            if (object instanceof Goal) {
                // Box is on goal just before moving
                isOutOfGoal = true;
                return false;
            }
        });

        if (isOutOfGoal) {
            var targetObjects = this.getMoveTargetObjects(params.direction);
            _.forEach(targetObjects, function(object) {
                if (object instanceof Goal) {
                    // Box will move on another goal
                    isOutOfGoal = false;
                    return false;
                }
            });
        }

        if (isOutOfGoal) {
            this.sprite.gotoAndStop('box');
        }

        return Movable.prototype.onBeforeMoved.apply(this, arguments);
    };

    Box.prototype.onMoved = function(params) {
        var isSourceGoal = false;
        var isTargetGoal = false;

        var sourceOjbects = this.getMoveTargetObjects(Direction.getCounterDirection(params.direction));
        _.forEach(sourceOjbects, function(object) {
            if (object instanceof Goal) {
                // Box is moved from goal
                isSourceGoal = true;
                return false;
            }
        });

        var targetObjects = this.level.getObjects(this.row, this.column);
        _.forEach(targetObjects, function(object) {
            if (object instanceof Goal) {
                // Box is moved on goal
                isTargetGoal = true;
                return false;
            }
        }, this);

        var eventManager = this.level.eventManager;

        if (!isSourceGoal && isTargetGoal) {
            this.sprite.gotoAndStop('boxOnGoal');

            this.level.onBoxOnGoal();
            if (eventManager instanceof EventManager) {
                eventManager.raiseEvent(Box.EVENT_MOVED_ON_GOAL, {
                    box: this
                });
            }
        }
        else if (isSourceGoal && !isTargetGoal) {
            this.level.onBoxOutOfGoal();
            if (eventManager instanceof EventManager) {
                eventManager.raiseEvent(Box.EVENT_MOVED_OUT_OF_GOAL, {
                    box: this
                });
            }
        }
    };

    return Box;
});