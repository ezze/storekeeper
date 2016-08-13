'use strict';

import Easel from 'easel';
import $ from 'jquery';
import _ from 'lodash';
import Tween from 'tween';

import Box from './object/box';
import Goal from './object/goal';
import SceneObject from './object/scene-object';
import Wall from './object/wall';
import Worker from './object/worker';

var Level = function(options) {
    if (!_.isObject(options.app)) {
        throw new Error('Application is invalid or not specified.');
    }

    this._app = options.app;

    this._canvas = document.createElement('canvas');
    this._stage = new Easel.Stage(this._canvas);

    this._camera = new Easel.Container();
    this._stage.addChild(this._camera);

    this._name = '';
    this._description = '';
    this._items = [];

    this._rows = 0;
    this._columns = 0;

    this._worker = null;
    this._walls = [];
    this._goals = [];
    this._boxes = [];

    this._boxesOnGoalCount = 0;

    this._isTouchEnabled = false;

    if (_.isString(options.name) && !_.isEmpty(options.name)) {
        this.name = options.name;
    }

    if (_.isString(options.description) && !_.isEmpty(options.description)) {
        this.description = options.description;
    }

    if (!_.isArray(options.items)) {
        throw new Error('Level\'s items are invalid or not specified.');
    }

    this._items = options.items;
    this.reset();
};

Level.prototype.resize = function(smooth) {
    var jqContainer = $(this.canvas).parent();

    $(this.canvas)
        .attr('width', jqContainer.width())
        .attr('height', jqContainer.height());

    this.adjustCamera({
        smooth: smooth
    });
};

Level.prototype.onCameraMoved = function() {
    this._cameraTween = null;
};

Level.prototype.onBoxOnGoal = function() {
    this._boxesOnGoalCount += 1;
};

Level.prototype.onBoxOutOfGoal = function() {
    this._boxesOnGoalCount -= 1;
};

Level.prototype.isCompleted = function() {
    return this.boxesOnGoalCount === this.boxesCount;
};

Level.prototype.enableTouch = function() {
    Easel.Touch.enable(this._stage);
    this._isTouchEnabled = true;
};

Level.prototype.disableTouch = function() {
    if (!this._isTouchEnabled) {
        return;
    }
    Easel.Touch.disable(this._stage);
    this._isTouchEnabled = false;
};

Level.prototype.destroy = function() {
    this.disableTouch();
    $(this.canvas).remove();
};

Object.defineProperties(Level.prototype, {
    name: {
        get: function() {
            return this._name;
        },
        set: function(name) {
            this._name = name;
        }
    },
    description: {
        get: function() {
            return this._description;
        },
        set: function(description) {
            this._description = description;
        }
    },
    canvas: {
        get: function() {
            return this._canvas;
        }
    },
    stage: {
        get: function() {
            return this._stage;
        }
    },
    camera: {
        get: function() {
            return this._camera;
        }
    },
    size: {
        get: function() {
            var frames = SceneObject.spriteSheet.data.frames;
            return {
                rows: this.rows,
                columns: this.columns,
                width: frames.width * this.columns,
                height: frames.height * this.rows,
                objectWidth: frames.width,
                objectHeight: frames.height
            };
        }
    },
    rows: {
        get: function() {
            return this._rows;
        }
    },
    columns: {
        get: function() {
            return this._columns;
        }
    },
    worker: {
        get: function() {
            return this._worker;
        }
    },
    boxes: {
        get: function() {
            return this._boxes;
        }
    },
    boxesCount: {
        get: function() {
            return this._boxes.length;
        }
    },
    boxesOnGoalCount: {
        get: function() {
            return this._boxesOnGoalCount;
        }
    },
    walls: {
        get: function() {
            return this._walls;
        }
    },
    goals: {
        get: function() {
            return this._goals;
        }
    }
});

export default Level;