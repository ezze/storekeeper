/**
 * @module Level
 */
define([
    'easel',
    'jquery',
    'lodash',
    'tween',
    './object/box',
    './object/goal',
    './object/movable',
    './object/scene-object',
    './object/wall',
    './object/worker',
    '../event-manager',
    '../exception'
], function(
    Easel,
    $,
    _,
    Tween,
    Box,
    Goal,
    Movable,
    SceneObject,
    Wall,
    Worker,
    EventManager,
    Exception
) {
    'use strict';

    /**
     * @param {Object} options
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.0
     * @alias module:Level
     * @class
     */
    var Level = function(options) {
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

        this._eventManager = options.eventManager instanceof EventManager ? options.eventManager : null;

        if (_.isString(options.name) && !_.isEmpty(options.name)) {
            this.name = options.name;
        }

        if (_.isString(options.description) && !_.isEmpty(options.description)) {
            this.description = options.description;
        }

        if (!_.isArray(options.items)) {
            throw new Exception('Level\'s items are invalid or not specified.');
        }

        this._items = options.items;
        this.reset();
    };

    Level.prototype.reset = function() {
        this.removeObjectsFromStage();

        this._worker = null;
        this._walls = [];
        this._goals = [];
        this._boxes = [];
        this._boxesOnGoalCount = 0;

        for (var row = 0; row < this._items.length; row += 1) {
            for (var column = 0; column < this._items[row].length; column += 1) {
                this.createObjectFromPosition(this._items[row][column], row, column);
            }
        }

        if (this._boxes.length !== this._goals.length || !(this._worker instanceof Worker)) {
            throw new Exception('Incorrect ' + this._name + ' level');
        }

        this.addObjectsToStage();
    };

    Level.prototype.createObjectFromPosition = function(character, row, column) {
        var options = {
            level: this,
            row: row,
            column: column
        };

        switch (character) {
            case '@':
                this.createObject(new Worker(options));
                break;
            case '+':
                this.createObject(new Goal(options));
                this.createObject(new Worker(options));
                break;
            case '#':
                this.createObject(new Wall(options));
                break;
            case '.':
                this.createObject(new Goal(options));
                break;
            case '$':
                this.createObject(new Box(_.merge({}, options, {
                    onGoal: false
                })));
                break;
            case '*':
                this.createObject(new Goal(options));
                this.createObject(new Box(_.merge({}, options, {
                    onGoal: true
                })));
                this._boxesOnGoalCount += 1;
                break;
        }
    };

    Level.prototype.createObject = function(object) {
        var row = object.row;
        if (row + 1 > this._rows) {
            this._rows = row + 1;
        }

        var column = object.column;
        if (column + 1 > this._columns) {
            this._columns = column + 1;
        }

        // TODO: check whether we can insert object on this position

        if (object instanceof Worker) {
            this._worker = object;
        }
        else if (object instanceof Wall) {
            this._walls.push(object);
        }
        else if (object instanceof Goal) {
            this._goals.push(object);
        }
        else if (object instanceof Box) {
            this._boxes.push(object);
        }
    };

    Level.prototype.addObjectsToStage = function() {
        _.forEach(this._walls, function(wall) {
            this.addObjectToStage(wall);
        }, this);

        _.forEach(this._goals, function(goal) {
            this.addObjectToStage(goal);
        }, this);

        _.forEach(this._boxes, function(box) {
            this.addObjectToStage(box);
        }, this);

        this.addObjectToStage(this._worker);
    };

    Level.prototype.addObjectToStage = function(object) {
        var sprite = object.sprite;
        if (this._camera.contains(sprite)) {
            throw new Exception('Level\'s stage already contains the object.');
        }
        this._camera.addChild(sprite);
    };

    Level.prototype.removeObjectsFromStage = function() {
        this._camera.removeAllChildren();
    };

    Level.prototype.getObjects = function(row, column) {
        var objects = [];

        if (this._worker.row === row && this._worker.column === column) {
            objects.push(this._worker);
        }

        _.forEach([
            this._walls,
            this._goals,
            this._boxes
        ], function(objectsStack) {
            _.forEach(objectsStack, function(object) {
                if (object.row === row && object.column === column) {
                    objects.push(object);
                    return false;
                }
                return true;
            });
        });

        return objects;
    };

    Level.prototype.update = function() {
        this._stage.update();
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
        .call(this.onCameraAdjusted.bind(this));
    };

    Level.prototype.onCameraAdjusted = function() {
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
    };

    Level.prototype.disableTouch = function() {
        Easel.Touch.disable(this._stage);
    };

    Level.prototype.clone = function() {
        return new Level({
            eventManager: this.eventManager,
            name: this.name,
            description: this.description,
            items: this._items
        });
    };

    Object.defineProperties(Level.prototype, {
        eventManager: {
            get: function() {
                return this._eventManager;
            }
        },
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

    return Level;
});