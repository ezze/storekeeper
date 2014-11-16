/**
 * @module Storekeeper
 */
define([
    'easel',
    'jquery',
    'lodash',
    './exception',
    './level/direction',
    './level/levelset'
], function(
    Easel,
    $,
    _,
    Exception,
    Direction,
    LevelSet
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

            // Creating game's canvas
            $('<canvas></canvas>')
                .attr('width', jqContainer.width())
                .attr('height', jqContainer.height())
                .appendTo(jqContainer);

            this.init();
            this.loadLevelSet(options.levelSetSource, this.onDefaultLevelSetLoaded.bind(this));
        }.bind(this));
    };

    Storekeeper.prototype.init = function() {
        this.initUserControls();
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

    Storekeeper.prototype.loadLevelSet = function(source, onLoad) {
        this._levelSet = new LevelSet(source, onLoad);
    };

    Storekeeper.prototype.onDefaultLevelSetLoaded = function() {
        this.levelSet.level = 0;
        this.initTicker();
    };

    Storekeeper.prototype.onAnimationFrame = function(event) {
        var level = this.levelSet.level;
        var worker = level.worker;
        worker.move(this._moveDirection);

        // TODO: decide when to update level
        // level.update();
    };

    Object.defineProperties(Storekeeper.prototype, {
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