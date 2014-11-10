/**
 * @module Storekeeper
 */
define([
    'easel',
    'jquery',
    'lodash',
    './exception',
    './level/levelset'
], function(
    Easel,
    $,
    _,
    Exception,
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

            this._levelSet = new LevelSet(this, options.levelSetSource, this.onDefaultLevelSetLoaded.bind(this));
        }.bind(this));
    };

    Storekeeper.prototype.onDefaultLevelSetLoaded = function() {
        this._activeLevel = this._levelSet.selectLevelByIndex(0);

        // initial render;
        this._activeLevel.update();

        // attaching handlers
        this.handleUserInputs();

        // Initializing ticker
        Easel.Ticker.setFPS(24);
        Easel.Ticker.addEventListener('tick', function(event) {
            this.onAnimationFrame.apply(this, arguments);
        }.bind(this));
    };

    Storekeeper.prototype.handleUserInputs = function() {
        var that = this;
        var worker = that._activeLevel.getWorker();

        // TODO: this object might store user actions, i haven't decided yet,
        // TODO : whether it will be Worker's state object or this one
        that._userAction = {};

        // TODO: all handlers for user inputs and shortcuts define in separate module, i.e. 'controls'
        $(window).keydown(function(event) {
            if (!worker.isMoving) {
                switch (event.which) {
                    case 87:
                    case 38:
                        worker.setCurrentState('up');
                        break;
                    case 83:
                    case 40:
                        worker.setCurrentState('down');
                        break;
                    case 37:
                    case 65:
                        worker.setCurrentState('left');
                        break;
                    case 39:
                    case 68:
                        worker.setCurrentState('right');
                        break;
                    default:
                        worker.setCurrentState('stand');
                        break;
                }
                that._userAction.isKeyDown = true;
            }
        });

        $(window).keyup(function() {
            that._userAction.isKeyDown = false;
        });
    };

    Storekeeper.prototype.onAnimationFrame = function() {
        var level = this._activeLevel;
        var worker = level.getWorker();
        if (!worker._hasCollision) {
            var state = worker.getCurrentState();
            if (_.isFunction(state)) {
                state.call(worker);
                level.update();
            }
        }
        worker._hasCollision = false;
    };

    return Storekeeper;
});