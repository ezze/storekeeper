'use strict';

import Backbone from 'backbone';
import Easel from 'easel';

import $ from 'jquery';
import _ from 'lodash';

import showModal from './show-modal';

import Direction from './level/direction';
import Level from './level/level';
import LevelSet from './level/level-set';
import Box from './level/object/box';
import Movable from './level/object/movable';
import Worker from './level/object/worker';

var Storekeeper = function(options) {
    _.bindAll(this, [
        'onWindowResize',
        'onAnimationFrame',
        'onKeyDown',
        'onKeyUp',
        'onTouchStart',
        'onTouchEnd'
    ]);

    $(document).ready(_.bind(function() {
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
    }, this));

    $(window).on('resize', this.onWindowResize);
};


_.extend(Storekeeper.prototype, Backbone.Events);

Storekeeper.prototype.init = function() {
    this.initCommands();
    this.initEvents();
    this.enableUserControls();
    this.initTicker();
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
    ], _.bind(function(command) {
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
    }, this));

    commands.setHandlers(handlerOptions);
};

Storekeeper.prototype.initEvents = function() {
    var vent = this._app.vent;
    this.listenTo(vent, LevelSet.EVENT_LEVEL_CHANGE, this.onLevelChange);
    this.listenTo(vent, LevelSet.EVENT_LEVEL_RESTART, this.onLevelChange);
    this.listenTo(vent, LevelSet.EVENT_LEVEL_COMPLETE, this.onLevelComplete);
    this.listenTo(vent, Box.EVENT_MOVE_ON_GOAL, this.onBoxMove);
    this.listenTo(vent, Box.EVENT_MOVE_OUT_OF_GOAL, this.onBoxMove);
    this.listenTo(vent, Movable.EVENT_MOVE, this.onMovableMove);
    this.listenTo(vent, Movable.EVENT_ANIMATE, this.onMovableAnimate);
    this.listenTo(vent, Movable.EVENT_STOP, this.onMovableAnimate);
};

Storekeeper.prototype.initTicker = function() {
    Easel.Ticker.setFPS(30);
    Easel.Ticker.addEventListener('tick', this.onAnimationFrame);
};

Storekeeper.prototype.updateLevelInfo = function(info) {
    info = info || {};
    this._app.vent.trigger('level-info-update', info);
};

Storekeeper.prototype.loadLevelSet = function(source) {
    var levelSet = new LevelSet({
        app: this._app,
        container: this.container
    });

    levelSet.load({
        source: source,
        onSucceed: _.bind(function(params) {
            if (this._levelSet instanceof LevelSet) {
                this._levelSet.destroy();
            }

            this._levelSet = levelSet;
            this._levelSet.level = 0;

            this._app.vent.trigger('level-set-load', source);
        }, this)
    });
};

Storekeeper.prototype.restartLevel = function() {
    if (!(this.levelSet instanceof LevelSet)) {
        throw new Error('Level set is not loaded.');
    }
    this.levelSet.restart();
};

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

Storekeeper.prototype.onLevelChange = function(params) {
    var level = params.level;

    this.updateLevelInfo({
        levelNumber: params.index + 1,
        boxesCount: level.boxesCount,
        boxesOnGoalCount: level.boxesOnGoalCount,
        pushesCount: 0,
        movesCount: level.worker.movesCount
    });

    level.resize(false);
    level.update();
};

Storekeeper.prototype.onLevelComplete = function(params) {
    params.level.update();
    setTimeout(_.bind(function() {
        var deferred = showModal({
            title: 'Congratulations!',
            html: '<p>' + 'Level ' + (params.levelIndex + 1) + ' is completed!' + '</p>',
            closeButton: true
        });
        deferred.done(_.bind(function() {
            params.level.reset();
            this.nextLevel();
        }, this));
    }, this), 50);
};

Storekeeper.prototype.onBoxMove = function(params) {
    var level = params.box.level;
    this.updateLevelInfo({
        boxesCount: level.boxesCount,
        boxesOnGoalCount: level.boxesOnGoalCount
    });
};

Storekeeper.prototype.onMovableMove = function(params) {
    if (params.object instanceof Box) {
        // TODO: optimize if possible
        var pushesCount = 0;
        _.each(params.object.level.boxes, function(box) {
            pushesCount += box.movesCount;
        });
        this.updateLevelInfo({
            pushesCount: pushesCount
        });
    }
    else if (params.object instanceof Worker) {
        this.updateLevelInfo({
            movesCount: params.object.movesCount
        });
        this.levelSet.level.adjustCamera({
            cancel: false,
            smooth: true,
            delay: 50
        });
    }
};

Storekeeper.prototype.onMovableAnimate = function(params) {
    if (!(params.object instanceof Worker)) {
        return;
    }
    params.object.level.update();
};

Storekeeper.prototype.onWindowResize = function() {
    if (this.levelSet instanceof LevelSet && this.levelSet.level instanceof Level) {
        this.levelSet.level.resize();
    }
};

Object.defineProperties(Storekeeper.prototype, {
    container: {
        get: function() {
            return this._container;
        }
    },
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

export default Storekeeper;