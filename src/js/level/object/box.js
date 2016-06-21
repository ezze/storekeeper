'use strict';

import _ from 'lodash';

import Goal from './goal';
import Movable from './movable';
import Wall from './wall';
import Direction from '../direction';

var Box = function(options) {
    Movable.apply(this, arguments);
    this._name = 'Box';

    var isOnGoal = _.isBoolean(options.onGoal) ? options.onGoal : false;
    this._sprite.gotoAndStop(isOnGoal ? 'boxOnGoal' : 'box');
};

Box.EVENT_MOVE_ON_GOAL = 'box:move-on-goal';
Box.EVENT_MOVE_OUT_OF_GOAL = 'box:move-out-of-goal';

Box.prototype = Object.create(Movable.prototype);

Box.prototype.detectCollision = function(direction) {
    var collision = {
        detected: false,
        target: null
    };

    var targetObjects = this.getMoveTargetObjects(direction);
    _.each(targetObjects, function(object) {
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

Box.prototype.onBeforeMove = function(params) {
    var isOutOfGoal = false;

    var sourceObjects = this.level.getObjects(this.row, this.column);
    _.each(sourceObjects, function(object) {
        if (object instanceof Goal) {
            // Box is on goal just before moving
            isOutOfGoal = true;
            return false;
        }
    });

    if (isOutOfGoal) {
        var targetObjects = this.getMoveTargetObjects(params.direction);
        _.each(targetObjects, function(object) {
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

    return Movable.prototype.onBeforeMove.apply(this, arguments);
};

Box.prototype.onMove = function(params) {
    var isSourceGoal = false,
        isTargetGoal = false;

    var sourceOjbects = this.getMoveTargetObjects(Direction.getCounterDirection(params.direction));
    _.each(sourceOjbects, function(object) {
        if (object instanceof Goal) {
            // Box is moved from goal
            isSourceGoal = true;
            return false;
        }
    });

    var targetObjects = this.level.getObjects(this.row, this.column);
    _.each(targetObjects, function(object) {
        if (object instanceof Goal) {
            // Box is moved on goal
            isTargetGoal = true;
            return false;
        }
    }, this);

    var vent = this._app.vent;
    if (!isSourceGoal && isTargetGoal) {
        this.sprite.gotoAndStop('boxOnGoal');
        this.level.onBoxOnGoal();
        vent.trigger(Box.EVENT_MOVE_ON_GOAL, {
            box: this
        });
    }
    else if (isSourceGoal && !isTargetGoal) {
        this.level.onBoxOutOfGoal();
        vent.trigger(Box.EVENT_MOVE_OUT_OF_GOAL, {
            box: this
        });
    }
};

export default Box;