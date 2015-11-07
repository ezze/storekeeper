/**
 * @module Storekeeper
 */
define([
    'bootstrap',
    'easel',
    'jquery',
    'lodash',
    './event-manager',
    './show-modal',
    './level/direction',
    './level/level',
    './level/level-set',
    './level/object/box',
    './level/object/movable',
    './level/object/worker'
], function(
    Bootstrap,
    Easel,
    $,
    _,
    EventManager,
    showModal,
    Direction,
    Level,
    LevelSet,
    Box,
    Movable,
    Worker
) {
    'use strict';

    /**
     * Creates Storekeeper game's instance.
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {String|HTMLElement} options.container
     * HTML container of game canvas or its CSS selector.
     *
     * @param {String} options.levelSetSource
     * URL to default level set.
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @author Ivan Lobanov <arkhemlol@gmail.com>
     * @since 0.1.0
     * @alias module:Storekeeper
     * @class
     */
    var Storekeeper = function(options) {
        _.bindAll(this);

        $(document).ready(function() {
            if (!_.isObject(options.app)) {
                throw new Error('Application is not defined or invalid.');
            }

            if ((!_.isString(options.container) || _.isEmpty(options.container)) &&
                !(options.container instanceof HTMLElement)
            ) {
                throw new Error('Game container is not defined or invalid.');
            }

            if (!_.isString(options.levelSetSource) || _.isEmpty(options.levelSetSource)) {
                throw new Error('Level set source is not defined or invalid.');
            }

            var $container = $(options.container);
            if ($container.length === 0) {
                throw new Error('Container "' + options.container + '" doesn\'t exist.');
            }

            this._app = options.app;
            this._container = $container.get(0);

            this.init();
            this.loadLevelSet(options.levelSetSource);
        }.bind(this));

        $(window).on('resize', this.onWindowResize);
    };

    /**
     * Initializes the game.
     *
     * @protected
     */
    Storekeeper.prototype.init = function() {
        this.initCommands();
        this.initEvents();
        this.enableUserControls();
        this.initTicker();
    };

    /**
     * Initializes rendering ticker.
     */
    Storekeeper.prototype.initTicker = function() {
        Easel.Ticker.setFPS(30);
        Easel.Ticker.addEventListener('tick', this.onAnimationFrame.bind(this));
    };

    Storekeeper.prototype.initCommands = function() {
        var handlerOptions = {},
            commands = this._app.commands,
            methodName;

        _.each([
            'browse-level-set',
            'load-level-set',
            'next-level',
            'previous-level',
            'restart-level'
        ], function(command) {
            methodName = _.camelCase(command);
            if (!_.isFunction(this[methodName])) {
                return;
            }

            handlerOptions[command] = _.bind(function(methodName) {
                return {
                    context: this,
                    callback: function (options) {
                        if (command === 'load-level-set') {
                            this[methodName](options.link);
                        }
                        else {
                            this[methodName]();
                        }
                    }
                };
            }, this)(methodName);
        }, this);

        commands.setHandlers(handlerOptions);
    };

    /**
     * Initializes events' handlers.
     *
     * @protected
     */
    Storekeeper.prototype.initEvents = function() {
        var eventManager = EventManager.instance;

        eventManager.on([
            LevelSet.EVENT_LEVEL_CHANGED,
            LevelSet.EVENT_LEVEL_RESTARTED
        ], function(eventName, params) {
            var level = params.level;

            this.updateInfo({
                levelNumber: params.index + 1,
                boxesCount: level.boxesCount,
                boxesOnGoalCount: level.boxesOnGoalCount,
                pushesCount: 0,
                movesCount: level.worker.movesCount
            });

            level.resize(false);
            level.update();
        }.bind(this));

        eventManager.on(LevelSet.EVENT_LEVEL_COMPLETED, function(eventName, params) {
            params.level.update();
            setTimeout(function() {
                var deferred = showModal({
                    title: 'Congratulations!',
                    html: '<p>' + 'Level ' + (params.levelIndex + 1) + ' is completed!' + '</p>',
                    closeButton: true
                });
                deferred.done(function() {
                    params.level.reset();
                    this.nextLevel();
                }.bind(this));
            }.bind(this), 50);
        }.bind(this));

        eventManager.on([
            Box.EVENT_MOVED_ON_GOAL,
            Box.EVENT_MOVED_OUT_OF_GOAL
        ], function(eventName, params) {
            var level = params.box.level;
            this.updateInfo({
                boxesCount: level.boxesCount,
                boxesOnGoalCount: level.boxesOnGoalCount
            });
        }.bind(this));

        eventManager.on(Movable.EVENT_MOVED, function(eventName, params) {
            if (params.object instanceof Box) {
                // TODO: optimize if possible
                var pushesCount = 0;
                _.forEach(params.object.level.boxes, function(box) {
                    pushesCount += box.movesCount;
                });
                this.updateInfo({
                    pushesCount: pushesCount
                });
            }
            else if (params.object instanceof Worker) {
                this.updateInfo({
                    movesCount: params.object.movesCount
                });
                this.levelSet.level.adjustCamera({
                    cancel: false,
                    smooth: true,
                    delay: 50
                });
            }
        }.bind(this));

        eventManager.on([
            Movable.EVENT_ANIMATED,
            Movable.EVENT_STOPPED
        ], function(eventName, params) {
            if (!(params.object instanceof Worker)) {
                return;
            }
            params.object.level.update();
        });
    };

    /**
     * Enables user's controls.
     *
     * @protected
     */
    Storekeeper.prototype.enableUserControls = function() {
        this._moveDirection = Direction.NONE;
        $(window).on('keydown', this.onKeyDown);
        $(window).on('keyup', this.onKeyUp);
        $(window).on('touchstart', this.onTouchStart);
        $(window).on('touchend', this.onTouchEnd);
    };

    /**
     * Disables user's controls.
     *
     * @protected
     */
    Storekeeper.prototype.disableUserControls = function() {
        this._moveDirection = Direction.NONE;
        $(window).off('keydown', this.onKeyDown);
        $(window).off('keyup', this.onKeyUp);
        $(window).off('touchstart', this.onTouchStart);
        $(window).off('touchend', this.onTouchEnd);
    };

    /**
     * Loads levels' set by a given source.
     *
     * @param {String} source
     * URL of levels' set to load.
     *
     * @see module:Storekeeper#browseLevelSet
     * @see module:Storekeeper#onLevelSetLoad
     */
    Storekeeper.prototype.loadLevelSet = function(source) {
        var levelSet = new LevelSet({
            container: this.container
        });

        levelSet.load({
            source: source,
            onSucceed: function(params) {
                if (this._levelSet instanceof LevelSet) {
                    this._levelSet.destroy();
                }
                this._levelSet = levelSet;

                this.onLevelSetLoad(source);

                this._app.vent.trigger('level-set-load', source);
            }.bind(this)
        });
    };

    /**
     * A method to invoke when levels' set is loaded.
     *
     * <p>Starts playing a first level of loaded set.</p>
     *
     * @protected
     *
     * @param {String} source
     * Source levels' set was loaded by.
     */
    Storekeeper.prototype.onLevelSetLoad = function(source) {
        this.levelSet.level = 0;
    };

    /**
     * Restarts currently active level.
     *
     * @see module:Storekeeper#previousLevel
     * @see module:Storekeeper#nextLevel
     * @see module:LevelSet#restart
     * @see module:Level#reset
     */
    Storekeeper.prototype.restartLevel = function() {
        if (!(this.levelSet instanceof LevelSet)) {
            throw new Error('Level set is not loaded.');
        }
        this.levelSet.restart();
    };

    /**
     * Switches to the previous level of current levels' set.
     *
     * @see module:Storekeeper#nextLevel
     * @see module:Storekeeper#restartLevel
     */
    Storekeeper.prototype.previousLevel = function() {
        if (!(this.levelSet instanceof LevelSet)) {
            throw new Error('Level set is not loaded.');
        }

        var levelIndex = this.levelSet.levelIndex;
        levelIndex -= 1;
        if (levelIndex < 0) {
            levelIndex = this.levelSet.count - 1;
        }

        this.levelSet.level = levelIndex;
    };

    /**
     * Switches to the next level of current levels' set.
     *
     * @see module:Storekeeper#previousLevel
     * @see module:Storekeeper#restartLevel
     */
    Storekeeper.prototype.nextLevel = function() {
        if (!(this.levelSet instanceof LevelSet)) {
            throw new Error('Level set is not loaded.');
        }

        var levelIndex = this.levelSet.levelIndex;
        levelIndex += 1;
        if (levelIndex >= this.levelSet.count) {
            levelIndex = 0;
        }

        this.levelSet.level = levelIndex;
    };

    /**
     * This method will be invoked on each animation frame of the game.
     *
     * <p>It checks where some direction is set by the user and tries to cause
     * worker's move in this direction.</p>
     *
     * @protected
     *
     * @param {Object} event
     */
    Storekeeper.prototype.onAnimationFrame = function(event) {
        if (!(this.levelSet instanceof LevelSet)) {
            return;
        }

        var level = this.levelSet.level;
        if (!(level instanceof Level) || level.isCompleted()) {
            return;
        }

        var worker = level.worker;
        worker.move(this._moveDirection);
    };

    /**
     * Updates current game information in navigation bar.
     *
     * @param {Object} info
     * Object consisting of values to update:
     *
     * @param {Number} [info.levelNumber]
     * Order number of current active level.
     *
     * @param {Number} [info.boxesCount]
     * Overall count of boxes belonging to current level.
     *
     * @param {Number} [info.boxesOnGoalCount]
     * Count of boxes belonging to current level and already placed on goals.
     *
     * @param {Number} [info.pushesCount]
     * Count of boxes' pushes caused by the worker.
     *
     * @param {Number} [info.movesCount]
     * Count of moves performed by the worker.
     */
    Storekeeper.prototype.updateInfo = function(info) {
        info = info || {};
        this._app.vent.trigger('level-info-update', info);
    };

    Storekeeper.prototype.onWindowResize = function() {
        if (this.levelSet instanceof LevelSet && this.levelSet.level instanceof Level) {
            this.levelSet.level.resize();
        }
    };

    Storekeeper.prototype.onKeyDown = function(event) {
        if (event.ctrlKey && event.which === 79) {
            // Ctrl + O
            event.preventDefault();     // preventing a browser from showing open file dialog
            this.browseLevelSet();
            return;
        }

        if (event.ctrlKey && event.altKey && event.which === 82) {
            // Ctrl + Alt + R
            this.restartLevel();
            return;
        }

        if (event.altKey && event.which === 90) {
            // Alt + Z
            this.previousLevel();
            return;
        }

        if (event.altKey && event.which === 88) {
            // Alt + X
            this.nextLevel();
            return;
        }

        var direction = Storekeeper.getDirectionByKeyCode(event.which);
        if (direction === Direction.NONE) {
            return;
        }

        event.preventDefault();
        this._moveDirection = direction;
    };

    Storekeeper.prototype.onKeyUp = function(event) {
        var direction = Storekeeper.getDirectionByKeyCode(event.which);
        if (direction === this._moveDirection) {
            this._moveDirection = Direction.NONE;
        }
    };

    Storekeeper.prototype.onTouchStart = function(event) {
        if (!(event.target instanceof HTMLCanvasElement)) {
            return;
        }

        var canvas = event.target;
        var jqCanvas = $(canvas);

        var originalEvent = event.originalEvent;
        var touch = originalEvent.touches.item(0);

        var touchCanvasX = touch.clientX - jqCanvas.offset().left;
        var touchCanvasY = touch.clientY - jqCanvas.offset().top;

        this._moveDirection = Storekeeper.getDirectionByTouchPoint(canvas, touchCanvasX, touchCanvasY);
    };

    Storekeeper.prototype.onTouchEnd = function(event) {
        this._moveDirection = Direction.NONE;
    };

    /**
     * Gets worker's desired direction by key code.
     *
     * @param {Number} code
     * Code of a key.
     *
     * @returns {String}
     *
     * @see module:Storekeeper.getDirectionByTouchPoint
     */
    Storekeeper.getDirectionByKeyCode = function(code) {
        switch (code) {
            case 37: case 65: return Direction.LEFT;        // arrow left or A
            case 38: case 87: return Direction.UP;          // arrow up or W
            case 39: case 68: return Direction.RIGHT;       // arrow right or D
            case 40: case 83: return Direction.DOWN;        // arrow down or S
            default: return Direction.NONE;
        }
    };

    /**
     * Gets worker's desired direction by pixel coordinates of a touch
     * relative to top left corner of touched HTML element.
     *
     * <p>In order to determine a direction the touched HTML element (generally, a canvas)
     * is splitted by two diagonals into four sections, each corresponding to possible
     * worker's direction. The result direction depends on which section touch point belongs to.</p>
     *
     * @param {HTMLElement} target
     * HTML element where touch event is occurred.
     *
     * @param {Number} x
     * Horizontal coordinate of touch point relative to <code>target</code>.
     *
     * @param {Number} y
     * Vertical coordinate of touch point relative to <code>target</code>.
     *
     * @returns {String}
     *
     * @see module:Storekeeper.getDirectionByKeyCode
     */
    Storekeeper.getDirectionByTouchPoint = function(target, x, y) {
        var jqTarget = $(target);
        var targetWidth = jqTarget.width();
        var targetHeight = jqTarget.height();

        var targetRatio = targetHeight / targetWidth;

        if (y < targetRatio * x && y < targetHeight - targetRatio * x) {
            return Direction.UP;
        }

        if (y > targetRatio * x && y > targetHeight - targetRatio * x) {
            return Direction.DOWN;
        }

        if (y > targetRatio * x && y < targetHeight - targetRatio * x) {
            return Direction.LEFT;
        }

        if (y < targetRatio * x && y > targetHeight - targetRatio * x) {
            return Direction.RIGHT;
        }

        return Direction.NONE;
    };

    Object.defineProperties(Storekeeper.prototype, {
        /**
         * Gets game's container HTML element.
         *
         * @type HTMLElement
         * @memberof module:Storekeeper.prototype
         */
        container: {
            get: function() {
                return this._container;
            }
        },
        /**
         * Gets or sets loaded levels' set.
         *
         * @type {module:LevelSet}
         * @memberof module:Storekeeper.prototype
         */
        levelSet: {
            get: function() {
                return this._levelSet;
            },
            set: function(source) {
                if (!(source instanceof LevelSet)) {
                    throw new Error('Level set is not specified or invalid.');
                }
                this._levelSet = source;
            }
        }
    });

    return Storekeeper;
});