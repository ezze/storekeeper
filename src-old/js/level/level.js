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

Level.prototype.adjustCamera = function(options) {
    var cancel = _.isBoolean(options.cancel) ? options.cancel : true;
    if (!cancel && this._cameraTween) {
        return;
    }

    var smooth = _.isBoolean(options.smooth) ? options.smooth : true;
    var delay = _.isNumber(options.delay) && options.delay % 1 === 0 ? options.delay : 500;
    var duration = _.isNumber(options.duration) && options.duration % 1 === 0 ? options.duration: 300;

    var jqCanvas = $(this.canvas);

    var size = this.size;

    // If the whole level can't be placed within the canvas
    // we will move the camera to grant worker is visible at each moment of time

    var isWorkerInRectX = true;
    var cameraOffsetLeft = Math.round((jqCanvas.width() - size.width) / 2);
    if (size.width > jqCanvas.width()) {
        var workerWidth = SceneObject.spriteSheet.data.frames.width;

        // Calculating left point of the worker relative to the canvas
        var workerCanvasX = this.worker.sprite.x + this.camera.x;

        // Checking whether worker is within visible rectangle
        // that is 5/8 of the canvas and placed in the center of the canvas
        var workerRectCanvasLeft = Math.round(jqCanvas.width() * 3 / 16);
        var workerRectCanvasRight = jqCanvas.width() - Math.round(jqCanvas.width() * 3 / 16);

        if (this.camera.x === jqCanvas.width() - size.width) {
            workerRectCanvasRight = jqCanvas.width();
        }
        else if (this.camera.x === 0) {
            workerRectCanvasLeft = 0;
        }

        isWorkerInRectX = workerCanvasX >= workerRectCanvasLeft &&
            workerCanvasX + workerWidth <= workerRectCanvasRight;

        if (!isWorkerInRectX) {
            // We have to recalculate camera's left position to place the worker in the center
            var workerCanvasCenterX = Math.round((jqCanvas.width() - workerWidth) / 2);
            cameraOffsetLeft = this.camera.x + workerCanvasCenterX - workerCanvasX;
        }
        else {
            cameraOffsetLeft = this.camera.x;
        }

        if (cameraOffsetLeft > 0) {
            cameraOffsetLeft = 0;
        }
        else if (cameraOffsetLeft < jqCanvas.width() - size.width) {
            cameraOffsetLeft = jqCanvas.width() - size.width;
        }
    }

    var isWorkerInRectY = true;
    var cameraOffsetTop = Math.round((jqCanvas.height() - size.height) / 2);
    if (size.height > jqCanvas.height()) {
        var workerHeight = SceneObject.spriteSheet.data.frames.height;

        // Calculating top point of the worker relative to the canvas
        var workerCanvasY = this.worker.sprite.y + this.camera.y;

        // Checking whether worker is within visible rectangle
        // that is 5/8 of the canvas and placed in the center of the canvas
        var workerRectCanvasTop = Math.round(jqCanvas.height() * 3 / 16);
        var workerRectCanvasBottom = jqCanvas.height() - Math.round(jqCanvas.height() * 3 / 16);

        if (this.camera.y === jqCanvas.height() - size.height) {
            workerRectCanvasBottom = jqCanvas.height();
        }
        else if (this.camera.y === 0) {
            workerRectCanvasTop = 0;
        }

        isWorkerInRectY = workerCanvasY >= workerRectCanvasTop &&
            workerCanvasY + workerHeight <= workerRectCanvasBottom;

        if (!isWorkerInRectY) {
            // We have to recalculate camera's top position to place the worker in the center
            var workerCanvasCenterY = Math.round((jqCanvas.height() - workerHeight) / 2);
            cameraOffsetTop = this.camera.y + workerCanvasCenterY - workerCanvasY;
        }
        else {
            cameraOffsetTop = this.camera.y;
        }

        if (cameraOffsetTop > 0) {
            cameraOffsetTop = 0;
        }
        else if (cameraOffsetTop < jqCanvas.height() - size.height) {
            cameraOffsetTop = jqCanvas.height() - size.height;
        }
    }

    // Checking whether camera's calculated position differs from the current one
    if (this.camera.x === cameraOffsetLeft && this.camera.y === cameraOffsetTop) {
        return;
    }

    if (!smooth) {
        this.camera.x = cameraOffsetLeft;
        this.camera.y = cameraOffsetTop;
        return;
    }

    this._cameraTween = Tween.Tween.get(this.camera, {
        override: true
    })
    .wait(delay)
    .to({
        x: cameraOffsetLeft,
        y: cameraOffsetTop
    }, duration, Tween.Ease.quadIn)
    .call(this.onCameraMoved.bind(this));
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