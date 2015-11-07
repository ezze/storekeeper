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
        $(document).ready(function() {
            if ((!_.isString(options.container) || _.isEmpty(options.container)) &&
                !(options.container instanceof HTMLElement)
            ) {
                throw new Error('Game container is not defined or invalid.');
            }

            if (!_.isString(options.levelSetSource) || _.isEmpty(options.levelSetSource)) {
                throw new Error('Level set source is not defined or invalid.');
            }

            var jqContainer = $(options.container);
            if (jqContainer.length === 0) {
                throw new Error('Container "' + options.container + '" doesn\'t exist.');
            }
            this._container = jqContainer.get(0);

            this.init();
            this.loadLevelSet(options.levelSetSource);
        }.bind(this));

        $(window).on('resize', function() {
            if (this.levelSet instanceof LevelSet && this.levelSet.level instanceof Level) {
                this.levelSet.level.resize();
            }
        }.bind(this));
    };

    /**
     * Initializes the game.
     *
     * @protected
     */
    Storekeeper.prototype.init = function() {
        this.initNavbar();
        this.initEvents();
        this.initUserControls();
        this.initTicker();
    };

    /**
     * Initializes controls of navigation bar.
     *
     * @protected
     */
    Storekeeper.prototype.initNavbar = function() {
        var storekeeper = this;

        $(document).ready(function() {
            var jqHeader = $('#header');

            if (!window.File || !window.FileList) {
                jqHeader.find('a[href="#load-level-set"]').parent('li').addClass('disabled');
            }

            jqHeader
                .on('click', '.navbar-brand', function(event) {
                    event.preventDefault();
                })
                .on('click', 'a', function(event) {
                    if ($(this).parent('li').hasClass('disabled')) {
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }

                    if ($(this).siblings('.dropdown-menu').length === 0) {
                        var jqNavbarCollapse = $(this).parents('.navbar-collapse');
                        if (jqNavbarCollapse.hasClass('in')) {
                            jqNavbarCollapse.collapse('hide');
                        }
                    }
                })
                .on('click', 'a[href="#levels"] ~ .dropdown-menu a', function(event) {
                    event.preventDefault();
                    if ($(this).parent('li').hasClass('disabled')) {
                        return;
                    }

                    var source = $(this).attr('href');
                    if (!source) {
                        return;
                    }

                    if (source === '#load-level-set') {
                        storekeeper.browseLevelSet();
                    }
                    else {
                        storekeeper.loadLevelSet(source);
                    }
                })
                .on('change', 'input.load-level-set', function(event) {
                    var files = event.target.files;
                    if (files.length === 0) {
                        return;
                    }
                    var file = files[0];
                    storekeeper.loadLevelSet(file);
                })
                .on('click', 'a[href="#restart-level"]', function(event) {
                    event.preventDefault();
                    storekeeper.restartLevel();
                })
                .on('click', 'a[href="#previous-level"]', function(event) {
                    event.preventDefault();
                    storekeeper.previousLevel();
                })
                .on('click', 'a[href="#next-level"]', function(event) {
                    event.preventDefault();
                    storekeeper.nextLevel();
                });
        });
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
     * Initializes user's controls.
     *
     * @protected
     */
    Storekeeper.prototype.initUserControls = function() {
        this._moveDirection = Direction.NONE;

        $(window).on('keydown', function(event) {
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
        }.bind(this));

        $(window).on('keyup', function(event) {
            var direction = Storekeeper.getDirectionByKeyCode(event.which);
            if (direction === this._moveDirection) {
                this._moveDirection = Direction.NONE;
            }
        }.bind(this));

        $(window).on('touchstart', function(event) {
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
        }.bind(this));

        $(window).on('touchend', function(event) {
            this._moveDirection = Direction.NONE;
        }.bind(this));
    };

    /**
     * Initializes rendering ticker.
     */
    Storekeeper.prototype.initTicker = function() {
        Easel.Ticker.setFPS(30);
        Easel.Ticker.addEventListener('tick', this.onAnimationFrame.bind(this));
    };

    /**
     * Opens a dialog to choose a level set to load from local computer.
     *
     * @see module:Storekeeper#loadLevelSet
     */
    Storekeeper.prototype.browseLevelSet = function() {
        $('#header').find('input.load-level-set:first').trigger('click');
    };

    /**
     * Loads levels' set by a given source.
     *
     * @param {String} source
     * URL of levels' set to load.
     *
     * @see module:Storekeeper#browseLevelSet
     * @see module:Storekeeper#onLevelSetLoaded
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
                this.onLevelSetLoaded(source);
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
    Storekeeper.prototype.onLevelSetLoaded = function(source) {
        var jqLevelsDropdown = $('#header').find('a[href="#levels"] ~ .dropdown-menu');
        jqLevelsDropdown.find('a').each(function() {
            if ($(this).attr('href') === source) {
                $(this).parent('li').addClass('active');
            }
            else {
                $(this).parent('li').removeClass('active');
            }
        });

        var jqLoadLevelSetItem = jqLevelsDropdown.find('a[href="#load-level-set"]').parent('li');
        var jqLocalLevelSetItem = jqLevelsDropdown.find('.local-level-set');

        if (window.File && source instanceof window.File) {
            var levelSetName = source.name;

            if (jqLocalLevelSetItem.length === 0) {
                jqLocalLevelSetItem = $('<li></li>')
                    .addClass('local-level-set')
                    .addClass('active')
                    .append($('<a></a>')
                        .text(levelSetName)
                    );
                jqLoadLevelSetItem.after(jqLocalLevelSetItem);
                jqLoadLevelSetItem.after($('<li></li>')
                    .addClass('divider')
                );
            }
            else {
                jqLocalLevelSetItem.children('a').text(levelSetName);
            }
        }
        else {
            jqLocalLevelSetItem.prev('li').remove();
            jqLocalLevelSetItem.remove();
        }

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
     * @param {Object} data
     * Object consisting of values to update:
     *
     * @param {Number} [data.levelNumber]
     * Order number of current active level.
     *
     * @param {Number} [data.boxesCount]
     * Overall count of boxes belonging to current level.
     *
     * @param {Number} [data.boxesOnGoalCount]
     * Count of boxes belonging to current level and already placed on goals.
     *
     * @param {Number} [data.pushesCount]
     * Count of boxes' pushes caused by the worker.
     *
     * @param {Number} [data.movesCount]
     * Count of moves performed by the worker.
     */
    Storekeeper.prototype.updateInfo = function(data) {
        data = data || {};
        var jqHeader = $('#header');

        if (_.isNumber(data.levelNumber)) {
            var jqLevel = jqHeader.find('.level');
            jqLevel.find('.name').text('Level');
            jqLevel.find('.value').text(Storekeeper.formatInteger(data.levelNumber, 3));
        }

        if (_.isNumber(data.boxesCount) && _.isNumber(data.boxesOnGoalCount)) {
            var jqBoxesCount = jqHeader.find('.boxes-count');
            jqBoxesCount.find('.name').text('Boxes');
            jqBoxesCount.find('.value').text(Storekeeper.formatInteger(data.boxesOnGoalCount, 3) +
                '/' + Storekeeper.formatInteger(data.boxesCount, 3)
            );
        }

        if (_.isNumber(data.pushesCount)) {
            var jqPushesCount = jqHeader.find('.pushes-count');
            jqPushesCount.find('.name').text('Pushes');
            jqPushesCount.find('.value').text(Storekeeper.formatInteger(data.pushesCount, 5));
        }

        if (_.isNumber(data.movesCount)) {
            var jqMovesCount = jqHeader.find('.moves-count');
            jqMovesCount.find('.name').text('Moves');
            jqMovesCount.find('.value').text(Storekeeper.formatInteger(data.movesCount, 5));
        }
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

    /**
     * Formats an integer by prepending leading zeros.
     *
     * @param {Number} number
     * Integer number to format.
     *
     * @param {Number} digits
     * Count of digits in formatted string.
     *
     * @returns {String}
     */
    Storekeeper.formatInteger = function(number, digits) {
        if (!_.isNumber(number) || number % 1 !== 0) {
            throw new Error('Number must be an integer.');
        }

        if (!_.isNumber(digits) || digits % 1 !== 0) {
            throw new Error('Digits must be an integer.');
        }

        var formatted = '' + number;
        for (var i = 0; i < digits - number.toString().length; i += 1) {
            formatted = '0' + formatted;
        }
        return formatted;
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