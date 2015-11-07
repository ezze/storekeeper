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
    './object/worker'
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
    Worker
) {
    'use strict';

    /**
     * Represents game's level consisting [of scene objects]{@link module:SceneObject}.
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {String} [options.name]
     * Level's name.
     *
     * @param {String} [options.description]
     * Level's description.
     *
     * @param {Array} [options.items]
     * Array of level's rows defined as strings consisting of special characters:
     * <ul>
     * <li><code>@</code> &ndash; {@link module:Worker};</li>
     * <li><code>#</code> &ndash; {@link module:Wall};</li>
     * <li><code>.</code> &ndash; {@link module:Goal};</li>
     * <li><code>$</code> &ndash; {@link module:Box};</li>
     * <li><code>*</code> &ndash; box on goal.</li>
     * </ul>
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

    /**
     * Resets level's objects to their initial state and adds them to the stage.
     *
     * <p>This method can be used to restart the level.</p>
     *
     * @see module:Level#addObjectsToStage
     * @see module:Level#removeObjectsFromStage
     */
    Level.prototype.reset = function() {
        this.removeObjectsFromStage();

        this._worker = null;
        this._walls = [];
        this._goals = [];
        this._boxes = [];
        this._boxesOnGoalCount = 0;

        for (var row = 0; row < this._items.length; row += 1) {
            for (var column = 0; column < this._items[row].length; column += 1) {
                this.createObject(this._items[row][column], row, column);
            }
        }

        if (this._boxes.length !== this._goals.length || !(this._worker instanceof Worker)) {
            throw new Error('Incorrect ' + this._name + ' level');
        }

        this.addObjectsToStage();
    };

    /**
     * Creates an instance of scene object from its character and desired position
     * and adds it to level's scene objects.
     *
     * @param {String} character
     * Character representing the object being created, one of the following values:
     * <ul>
     * <li><code>@</code> &ndash; {@link module:Worker};</li>
     * <li><code>#</code> &ndash; {@link module:Wall};</li>
     * <li><code>.</code> &ndash; {@link module:Goal};</li>
     * <li><code>$</code> &ndash; {@link module:Box};</li>
     * <li><code>*</code> &ndash; box on goal.</li>
     * </ul>
     *
     * @param {Number} row
     * Zero-based initial row of the object.
     *
     * @param {Number} column
     * Zero-based initial column of the object.
     *
     * @see module:Level#addObject
     */
    Level.prototype.createObject = function(character, row, column) {
        var options = {
            level: this,
            row: row,
            column: column
        };

        switch (character) {
            case '@':
                this.addObject(new Worker(options));
                break;
            case '+':
                this.addObject(new Goal(options));
                this.addObject(new Worker(options));
                break;
            case '#':
                this.addObject(new Wall(options));
                break;
            case '.':
                this.addObject(new Goal(options));
                break;
            case '$':
                this.addObject(new Box(_.merge({}, options, {
                    onGoal: false
                })));
                break;
            case '*':
                this.addObject(new Goal(options));
                this.addObject(new Box(_.merge({}, options, {
                    onGoal: true
                })));
                this._boxesOnGoalCount += 1;
                break;
        }
    };

    /**
     * Adds a given scene object to level's scene objects.
     *
     * @protected
     *
     * @param {module:SceneObject} object
     * Scene object to add.
     *
     * @see module:Level#createObject
     */
    Level.prototype.addObject = function(object) {
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

    /**
     * Makes all scene objects added by {@link module:Level#addObject} method visible on the stage.
     *
     * @protected
     *
     * @see module:Level#addObjectToStage
     * @see module:Level#reset
     */
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

    /**
     * Makes a given scene object of level visible on the stage.
     *
     * @protected
     *
     * @param {module:SceneObject} object
     *
     * @see module:Level#addObjectsToStage
     * @see module:Level#reset
     */
    Level.prototype.addObjectToStage = function(object) {
        var sprite = object.sprite;
        if (this._camera.contains(sprite)) {
            throw new Error('Level\'s stage already contains the object.');
        }
        this._camera.addChild(sprite);
    };

    /**
     * Makes all scene objects added by {@link module:Level#addObject} method unvisible on the stage.
     *
     * @protected
     */
    Level.prototype.removeObjectsFromStage = function() {
        this._camera.removeAllChildren();
    };

    /**
     * Gets instances of all level's scene objects located in a given position.
     *
     * @param {Number} row
     * Zero-based row.
     *
     * @param {Number} column
     * Zero-based column.
     *
     * @returns {Array}
     */
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

    /**
     * Redraws level's stage.
     */
    Level.prototype.update = function() {
        this._stage.update();
    };

    /**
     * Resizes level's canvas so that it fits its container and adjusts camera's position.
     *
     * <p>This method should be called each time then canvas' container is resized.</p>
     *
     * @param {Boolean} [smooth=true]
     * Specifies whether camera's adjustment should be smooth. If it's set to <code>false</code>
     * then camera's position will be changed immediately after the resize.
     *
     * @see module:Level#adjustCamera
     */
    Level.prototype.resize = function(smooth) {
        var jqContainer = $(this.canvas).parent();

        $(this.canvas)
            .attr('width', jqContainer.width())
            .attr('height', jqContainer.height());

        this.adjustCamera({
            smooth: smooth
        });
    };

    /**
     * Adjusts camera's position to make worker visible and best fit to current canvas' dimensions.
     *
     * @param {Object} options
     * Object of the following properties influencing the way of position's adjustment:
     *
     * @param {Boolean} [options.cancel=true]
     * Specifies whether previously scheduled adjustment can be cancelled to start the new one.
     * If it's set to <code>false</code> and another adjustment is scheduled or in progress then
     * this method will do nothing.
     *
     * @param {Boolean} [options.smooth=true]
     * Specifies whether changing of camera's position should be smooth. If it's set to <code>false</code>
     * then camera's position will be changed immediately.
     *
     * @param {Number} [options.delay=500]
     * Delay of camera's movement measured in milliseconds. This will make sense only if <code>smooth</code> is
     * set to <code>true</code>.
     *
     * @param {Number} [options.duration=300]
     * Duration of camera's movement measured in milliseconds. This will make sense only if <code>smooth</code>
     * is set to <code>true</code>.
     *
     * @see module:Level#resize
     * @see module:Level#onCameraMoved
     */
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

    /**
     * Method that will be called at the end of each smooth movement of the camera
     * caused by {@link module:Level#adjustCamera} method.
     *
     * <p>It signals that there is no active movements of the camera
     * for further {@link module:Level#adjustCamera} method's calls.</p>
     *
     * @protected
     *
     * @see module:Level#adjustCamera
     */
    Level.prototype.onCameraMoved = function() {
        this._cameraTween = null;
    };

    /**
     * This method should be called each time when a box is moved on a goal
     * from a non-goal location.
     *
     * <p>It increases a number of boxes located on goals that used to detect
     * level's completion by {@link module:Level#isCompleted} method.</p>
     *
     * @see module:Level#onBoxOutOfGoal
     * @see module:Level#isCompleted
     */
    Level.prototype.onBoxOnGoal = function() {
        this._boxesOnGoalCount += 1;
    };

    /**
     * This method should be called each time when a box is moved out of a goal
     * to a non-goal location.
     *
     * <p>It decreases a number of boxes located on goals that used to detect
     * level's completion by {@link module:Level#isCompleted} method.</p>
     *
     * @see module:Level#onBoxOnGoal
     * @see module:Level#isCompleted
     */
    Level.prototype.onBoxOutOfGoal = function() {
        this._boxesOnGoalCount -= 1;
    };

    /**
     * Tests whether all boxes are on goals and level is completed.
     *
     * @returns {Boolean}
     *
     * @see module:Level#onBoxOnGoal
     * @see module:Level#onBoxOutOfGoal
     */
    Level.prototype.isCompleted = function() {
        return this.boxesOnGoalCount === this.boxesCount;
    };

    /**
     * Enables raising touch events on level's canvas.
     *
     * @see module:Level#disableTouch
     * @see http://www.createjs.com/Docs/EaselJS/classes/Touch.html
     */
    Level.prototype.enableTouch = function() {
        Easel.Touch.enable(this._stage);
        this._isTouchEnabled = true;
    };

    /**
     * Disables raising touch events on level's canvas.
     *
     * <p>This method must be called when level becomes inactive
     * and if raising touch events was enabled before by {@link module:Level#enableTouch} method.</p>
     *
     * @see module:Level#enableTouch
     * @see http://www.createjs.com/Docs/EaselJS/classes/Touch.html
     */
    Level.prototype.disableTouch = function() {
        if (!this._isTouchEnabled) {
            return;
        }
        Easel.Touch.disable(this._stage);
        this._isTouchEnabled = false;
    };

    /**
     * Destroys level's canvas and and disables touch controls.
     *
     * @see module Level#disableTouch
     */
    Level.prototype.destroy = function() {
        this.disableTouch();
        $(this.canvas).remove();
    };

    Object.defineProperties(Level.prototype, {
        /**
         * Gets or sets level's name.
         *
         * @type {String}
         * @memberof module:Level.prototype
         */
        name: {
            get: function() {
                return this._name;
            },
            set: function(name) {
                this._name = name;
            }
        },
        /**
         * Gets or sets level's description.
         *
         * @type {String}
         * @memberof module:Level.prototype
         */
        description: {
            get: function() {
                return this._description;
            },
            set: function(description) {
                this._description = description;
            }
        },
        /**
         * Gets level's HTML canvas.
         *
         * @type {HTMLCanvasElement}
         * @memberof module:Level.prototype
         */
        canvas: {
            get: function() {
                return this._canvas;
            }
        },
        /**
         * Gets level's stage.
         *
         * @type {Object}
         * @memberof module:Level.prototype
         * @see http://www.createjs.com/Docs/EaselJS/classes/Stage.html
         */
        stage: {
            get: function() {
                return this._stage;
            }
        },
        /**
         * Gets level's camera.
         *
         * @type {Object}
         * @memberof module:Level.prototype
         * @see http://www.createjs.com/Docs/EaselJS/classes/Container.html
         */
        camera: {
            get: function() {
                return this._camera;
            }
        },
        /**
         * Gets level's dimensions as an object consisting of the following properties:
         *
         * <ul>
         * <li><code>rows</code> - rows' count;</li>
         * <li><code>columns</code> - columns' count;</li>
         * <li><code>width</code> - width in pixels;</li>
         * <li><code>height</code> - height in pixels;</li>
         * <li><code>objectWidth</code> - width of a single scene object in pixels;</li>
         * <li><code>objectHeight</code> - height of a single scene object in pixels.</li>
         * </ul>
         *
         * @type {Object}
         * @memberof module:Level.prototype
         * @see module:Level#rows
         * @see module:Level#columns
         */
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
        /**
         * Gets rows' count.
         *
         * @type {Number}
         * @memberof module:Level.prototype
         * @see module:Level#size
         * @see module:Level#columns
         */
        rows: {
            get: function() {
                return this._rows;
            }
        },
        /**
         * Gets columns' count.
         *
         * @type {Number}
         * @memberof module:Level.prototype
         * @see module:Level#size
         * @see module:Level#rows
         */
        columns: {
            get: function() {
                return this._columns;
            }
        },
        /**
         * Gets worker's instance.
         *
         * @type {module:Worker}
         * @memberof module:Level.prototype
         */
        worker: {
            get: function() {
                return this._worker;
            }
        },
        /**
         * Gets array of level's [boxes]{@link module:Box}.
         *
         * @type {Array}
         * @memberof module:Level.prototype
         * @see module:Level#boxesCount
         * @see module:Level#boxesOnGoalCount
         */
        boxes: {
            get: function() {
                return this._boxes;
            }
        },
        /**
         * Gets overall count of level's boxes.
         *
         * @type {Number}
         * @memberof module:Level.prototype
         * @see module:Level#boxes
         * @see module:Level#boxesOnGoalCount
         */
        boxesCount: {
            get: function() {
                return this._boxes.length;
            }
        },
        /**
         * Gets count of level's boxes located on goals.
         *
         * @type {Number}
         * @memberof module:Level.prototype
         * @see module:Level#boxes
         * @see module:Level#boxesCount
         */
        boxesOnGoalCount: {
            get: function() {
                return this._boxesOnGoalCount;
            }
        },
        /**
         * Gets array of level's [walls]{@link module:Wall}.
         *
         * @type {Array}
         * @memberof module:Level.prototype
         */
        walls: {
            get: function() {
                return this._walls;
            }
        },
        /**
         * Gets array of level's [goals]{@link module:Goal}.
         *
         * @type {Array}
         * @memberof module:Level.prototype
         */
        goals: {
            get: function() {
                return this._goals;
            }
        }
    });

    return Level;
});