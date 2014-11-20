/**
 * @module Storekeeper
 */
define([
    'bootstrap',
    'easel',
    'jquery',
    'lodash',
    './event-manager',
    './exception',
    './level/direction',
    './level/levelset',
    './level/object/box',
    './level/object/movable',
    './level/object/worker'
], function(
    Bootstrap,
    Easel,
    $,
    _,
    EventManager,
    Exception,
    Direction,
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
                throw new Exception('Game container is not defined or invalid.');
            }

            if (!_.isString(options.levelSetSource) || _.isEmpty(options.levelSetSource)) {
                throw new Exception('Level set source is not defined or invalid.');
            }

            var jqContainer = $(options.container);
            if (jqContainer.length === 0) {
                throw new Exception('Container "' + options.container + '" doesn\'t exist.');
            }
            this._container = jqContainer.get(0);

            this.init();
            this.loadLevelSet(options.levelSetSource, this.container);
        }.bind(this));
    };

    Storekeeper.prototype.init = function() {
        this.initNavbar();
        this.initEvents();
        this.initUserControls();
        this.initTicker();
    };

    Storekeeper.prototype.initNavbar = function() {
        $(document).ready(function() {
            $('#header')
                .on('click', '.navbar-brand', function(event) {
                    event.preventDefault();
                })
                .on('click', 'a', function(event) {
                    if ($(this).parent('li').hasClass('disabled')) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                })
                .on('click', 'a[href="#restart-level"]', function(event) {
                    event.preventDefault();
                    this.restartLevel();
                }.bind(this))
                .on('click', 'a[href="#previous-level"]', function(event) {
                    event.preventDefault();
                    this.previousLevel();
                }.bind(this))
                .on('click', 'a[href="#next-level"]', function(event) {
                    event.preventDefault();
                    this.nextLevel();
                }.bind(this));
        }.bind(this));
    };

    Storekeeper.prototype.initEvents = function() {
        var eventManager = this._eventManager = new EventManager();
        var jqFooter = $('#footer');

        eventManager.on(LevelSet.EVENT_LOADED, function(eventName, params) {
            this.onLevelSetLoaded.bind(this)(params.source);
        }.bind(this));

        eventManager.on([
            LevelSet.EVENT_LEVEL_CHANGED,
            LevelSet.EVENT_LEVEL_RESTARTED
        ], function(eventName, params) {
            var level = params.level;

            jqFooter.find('.level > .value').text(params.index + 1);
            jqFooter.find('.moves-count > .value').text(level.worker.movesCount);
            jqFooter.find('.pushes-count > .value').text(0);
            jqFooter.find('.boxes-count > .value').text(level.boxesOnGoalCount + '/' + level.boxesCount);

            params.levelSet.onResize();
            level.update();
        });

        eventManager.on(LevelSet.EVENT_LEVEL_COMPLETED, function(eventName, params) {
            params.level.update();
            setTimeout(function() {
                alert('Level ' + (params.levelIndex + 1) + ' is completed!');
                params.level.reset();
                this.nextLevel();
            }.bind(this), 50);
        }.bind(this));

        eventManager.on([
            Box.EVENT_MOVED_ON_GOAL,
            Box.EVENT_MOVED_OUT_OF_GOAL
        ], function(eventName, params) {
            var level = params.box.level;
            jqFooter.find('.boxes-count > .value').text(level.boxesOnGoalCount + '/' + level.boxesCount);
        });

        eventManager.on(Movable.EVENT_MOVED, function(eventName, params) {
            if (params.object instanceof Box) {
                // TODO: optimize if possible
                var pushesCount = 0;
                _.forEach(params.object.level.boxes, function(box) {
                    pushesCount += box.movesCount;
                });
                jqFooter.find('.pushes-count > .value').text(pushesCount);
            }
            else if (params.object instanceof Worker) {
                jqFooter.find('.moves-count > .value').text(params.object.movesCount);
            }
        });

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

    Storekeeper.prototype.initUserControls = function() {
        this._moveDirection = Direction.NONE;

        $(window)
            .on('keydown', function(event) {
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
            }.bind(this))
            .on('keyup', function(event) {
                var direction = Storekeeper.getDirectionByKeyCode(event.which);
                if (direction === this._moveDirection) {
                    this._moveDirection = Direction.NONE;
                }
            }.bind(this));
    };

    Storekeeper.getDirectionByKeyCode = function(code) {
        switch (code) {
            case 37: case 65: return Direction.LEFT;        // arrow left or A
            case 38: case 87: return Direction.UP;          // arrow up or W
            case 39: case 68: return Direction.RIGHT;       // arrow right or D
            case 40: case 83: return Direction.DOWN;        // arrow down or S
            default: return Direction.NONE;
        }
    };

    Storekeeper.prototype.initTicker = function() {
        Easel.Ticker.setFPS(30);
        Easel.Ticker.addEventListener('tick', this.onAnimationFrame.bind(this));
    };

    Storekeeper.prototype.loadLevelSet = function(source, container) {
        this._levelSet = new LevelSet({
            source: source,
            container: container,
            eventManager: this.eventManager
        });
    };

    Storekeeper.prototype.onLevelSetLoaded = function(source) {
        this.levelSet.level = 0;
    };

    Storekeeper.prototype.restartLevel = function() {
        if (!this.levelSet) {
            throw new Exception('Level set is not loaded.');
        }
        this.levelSet.restart();
    };

    Storekeeper.prototype.previousLevel = function() {
        if (!this.levelSet) {
            throw new Exception('Level set is not loaded.');
        }

        var levelIndex = this.levelSet.levelIndex;
        levelIndex -= 1;
        if (levelIndex < 0) {
            levelIndex = this.levelSet.count - 1;
        }

        this.levelSet.level = levelIndex;
    };

    Storekeeper.prototype.nextLevel = function() {
        if (!this.levelSet) {
            throw new Exception('Level set is not loaded.');
        }

        var levelIndex = this.levelSet.levelIndex;
        levelIndex += 1;
        if (levelIndex >= this.levelSet.count) {
            levelIndex = 0;
        }

        this.levelSet.level = levelIndex;
    };

    Storekeeper.prototype.onAnimationFrame = function(event) {
        if (!this.levelSet) {
            return;
        }

        var level = this.levelSet.level;
        if (!level) {
            return;
        }

        var worker = level.worker;
        worker.move(this._moveDirection);
    };

    Object.defineProperties(Storekeeper.prototype, {
        container: {
            get: function() {
                return this._container;
            }
        },
        eventManager: {
            get: function() {
                return this._eventManager;
            }
        },
        levelSet: {
            get: function() {
                return this._levelSet;
            },
            set: function(source) {
                if (!(source instanceof LevelSet)) {
                    throw new Exception('Level set is not specified or invalid.');
                }
                this._levelSet = source;
            }
        }
    });

    return Storekeeper;
});