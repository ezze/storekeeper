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

            $('#main-navbar')
                .on('click', '.navbar-brand', function(event) {
                    event.preventDefault();
                })
                .on('click', 'a', function(event) {
                    if ($(this).parent('li').hasClass('disabled')) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });

            var jqContainer = $(options.container);
            if (jqContainer.length === 0) {
                throw new Exception('Container "' + options.container + '" doesn\'t exist.');
            }

            // Creating game's canvas
            $('<canvas></canvas>')
                .attr('width', jqContainer.width())
                .attr('height', jqContainer.height())
                .appendTo(jqContainer);

            this.init();
            this.loadLevelSet(options.levelSetSource);
        }.bind(this));
    };

    Storekeeper.prototype.init = function() {
        this.initEvents();
        this.initUserControls();
        this.initTicker();
    };

    Storekeeper.prototype.initEvents = function() {
        var eventManager = this._eventManager = new EventManager();

        eventManager.on(LevelSet.EVENT_LOADED, function(eventName, params) {
            this.onLevelSetLoaded.bind(this)(params.source);
        }.bind(this));

        eventManager.on(Movable.EVENT_MOVED, function(eventName, params) {
            if (!(params.object instanceof Worker)) {
                return;
            }

            // TODO:
            console.log('Moves count: ' + params.movesCount);
        }.bind(this));
    };

    Storekeeper.prototype.initUserControls = function() {
        this._moveDirection = Direction.NONE;

        $(window)
            .on('keydown', function(event) {
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
            case 37: case 65: return Direction.LEFT;
            case 38: case 87: return Direction.UP;
            case 39: case 68: return Direction.RIGHT;
            case 40: case 83: return Direction.DOWN;
            default: return Direction.NONE;
        }
    };

    Storekeeper.prototype.initTicker = function() {
        Easel.Ticker.setFPS(30);
        Easel.Ticker.addEventListener('tick', this.onAnimationFrame.bind(this));
    };

    Storekeeper.prototype.loadLevelSet = function(source) {
        this._levelSet = new LevelSet({
            source: source,
            eventManager: this.eventManager
        });
    };

    Storekeeper.prototype.onLevelSetLoaded = function(source) {
        this.levelSet.level = 0;
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
        worker.move(this._moveDirection, false);

        // TODO: for performance reasons update level only when it's really necessary
        this.levelSet.level.update();
    };

    Object.defineProperties(Storekeeper.prototype, {
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