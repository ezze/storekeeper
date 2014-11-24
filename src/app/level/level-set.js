/**
 * @module LevelSet
 */
define([
    'jquery',
    'lodash',
    './level',
    './loader/loader',
    './loader/loader-json',
    './loader/loader-sok',
    './object/box',
    '../event-manager',
    '../exception'
], function(
    $,
    _,
    Level,
    Loader,
    LoaderJson,
    LoaderSok,
    Box,
    EventManager,
    Exception
) {
    'use strict';

    /**
     * Represents a set of [levels]{@link module:Level}.
     *
     * @param {Object} options
     * Object with the following properties:
     *
     * @param {String} options.source
     * URL to load levels' set by.
     *
     * @param {HTMLElement} options.container
     * HTML container to place levels' HTML canvases in.
     *
     * @param {module:EventManager} [options.eventManager]
     * Instance of event manager.
     *
     * @author Dmitriy Pushkov <ezze@ezze.org>
     * @since 0.1.0
     * @alias module:LevelSet
     * @class
     */
    var LevelSet = function(options) {
        if (!_.isString(options.source) || _.isEmpty(options.source)) {
            throw new Exception('Level set\'s source is invalid or not specified.');
        }
        this._source = options.source;

        if (!(options.container instanceof HTMLElement)) {
            throw new Exception('Container is invalid or not specified.');
        }
        this._container = options.container;

        var eventManager = EventManager.instance;

        eventManager.on([
            Box.EVENT_MOVED_ON_GOAL
        ], function(eventName, params) {
            var level = params.box.level;
            if (!level.isCompleted()) {
                return;
            }

            var onLevelCompletedParams = {
                levelSet: this,
                level: level,
                levelIndex: this.levelIndex
            };

            eventManager.raiseEvent(LevelSet.EVENT_LEVEL_COMPLETED, onLevelCompletedParams);
            this.onLevelCompleted(onLevelCompletedParams);
        }.bind(this));

        this._name = '';
        this._description = '';

        this._levelIndex = -1;
        this._level = null;
        this._levels = [];

        this.load();
    };

    /**
     * Name of an event raised when levels' set is loaded.
     *
     * @type {String}
     *
     * @see module:LevelSet#load
     */
    LevelSet.EVENT_LOADED = 'levelSet:loaded';

    /**
     * Name of an event raised when active level is changed.
     *
     * @type {String}
     *
     * @see module:LevelSet#level
     */
    LevelSet.EVENT_LEVEL_CHANGED = 'levelSet:levelChanged';

    /**
     * Name of an event raised when level is completed.
     *
     * @type {String}
     *
     * @see module:Level#isCompleted
     */
    LevelSet.EVENT_LEVEL_COMPLETED = 'levelSet:levelCompleted';

    /**
     * Name of an event raised when active level is restarted.
     *
     * @type {String}
     *
     * @see module:LevelSet#restart
     * @see module:Level#reset
     */
    LevelSet.EVENT_LEVEL_RESTARTED = 'levelSet:levelRestarted';

    /**
     * Loads levels' set by source URL passed to its constructor.
     *
     * @protected
     */
    LevelSet.prototype.load = function() {
        var url = this._source;
        var cleanUrl;

        var queryStringPos = url.indexOf('?');
        if (queryStringPos === -1) {
            cleanUrl = url;
            url += '?';
        }
        else {
            cleanUrl = url.slice(0, queryStringPos);
            url += '&';
        }

        url += 'q=' + new Date().getTime();

        var dotPos = cleanUrl.lastIndexOf('.');
        var extension = dotPos === -1 ? 'json' : url.slice(dotPos + 1, cleanUrl.length);

        var loader;

        var loaderOptions = {
            source: url,
            onSucceed: function(params) {
                var loader = params.loader;
                this.name = loader.name;
                this.description = loader.description;

                var jqContainer = $(this.container);
                _.forEach(loader.levels, function(levelData) {
                    var level = new Level(levelData);
                    this.add(level);
                    $(level.canvas)
                        .attr('width', jqContainer.width())
                        .attr('height', jqContainer.height());
                    jqContainer.append(level.canvas);
                }, this);

                EventManager.instance.raiseEvent(LevelSet.EVENT_LOADED, onLoadedParams);
            }.bind(this),
            onFailed: function(params) {
                // TODO: handle error
            }
        };

        switch (extension) {
            case 'sok':
                loader = new LoaderSok(loaderOptions);
                break;

            case 'json':
                loader = new LoaderJson(loaderOptions);
                break;
        }
        if (!(loader instanceof Loader)) {
            throw new Exception('Unable to determine loader for "' + this._source + '".');
        }

        var onLoadedParams = {
            loader: loader,
            levelSet: this,
            source: this._source
        };

        loader.load();
    };

    /**
     * Adds a level to the set.
     *
     * @param {module:Level} level
     * Level to add.
     *
     * @see module:LevelSet#remove
     * @see module:LevelSet#find
     */
    LevelSet.prototype.add = function(level) {
        if (!(level instanceof Level)) {
            throw new Exception('Level instance is expected.');
        }

        this._levels.push(level);
    };

    /**
     * Finds a level in the set by its zero-based index or reference.
     *
     * @param {Number|module:Level} search
     *
     * @returns {Object}
     * Object consisting of the following properties:
     * <ul>
     * <li><code>index</code> &ndash; found level's zero-based index;</li>
     * <li><code>level</code> &ndash; reference to found [level]{@link module:Level}.</li>
     * </ul>
     *
     * @see module:LevelSet#add
     * @see module:LevelSet#remove
     */
    LevelSet.prototype.find = function(search) {
        if (_.isNumber(search)) {
            if (search % 1 !== 0) {
                throw new Exception('Level\'s index must be an integer.');
            }

            if (search < 0 || search >= this._levels.length) {
                throw new Exception('Level\'s index is out of bounds.');
            }

            return {
                index: search,
                level: this._levels[search]
            };
        }
        else if (search instanceof Level) {
            var index = _.findIndex(this._levels, search);
            if (index === -1) {
                throw new Exception('Level is not found.');
            }

            return {
                index: index,
                level: search
            };
        }

        throw new Exception('Level\'s search argument is invalid.');
    };

    /**
     * Removes a level from the set.
     *
     * @param {module:Level} level
     * Reference to level to remove.
     *
     * @see module:LevelSet#add
     * @see module:LevelSet#find
     */
    LevelSet.prototype.remove = function(level) {
        // TODO: add ability to remove level by index

        if (!(level instanceof Level)) {
            // TODO: throw an exception
            return;
        }

        var index = _.inArray(level, this._levels);
        if (index === -1) {
            // TODO: throw an exception
            return;
        }

        this._levels.splice(index, 1);
    };

    /**
     * Restarts current active level of the set.
     *
     * @see module:Level#reset
     */
    LevelSet.prototype.restart = function() {
        this._level.reset();

        var onLevelRestartedParams = {
            levelSet: this,
            level: this.level,
            index: this.levelIndex
        };

        EventManager.instance.raiseEvent(LevelSet.EVENT_LEVEL_RESTARTED, onLevelRestartedParams);
        this.onLevelRestarted(onLevelRestartedParams);
    };

    /**
     * Method being called when current level is completed.
     *
     * @param {Object} params
     * Object of event's parameters.
     *
     * @see module:LevelSet#isCompleted
     */
    LevelSet.prototype.onLevelCompleted = function(params) {};

    /**
     * Method being called when level is changed.
     *
     * @param {Object} params
     * Object of event's parameters.
     *
     * @see module:LevelSet#level
     */
    LevelSet.prototype.onLevelChanged = function(params) {};

    /**
     * Method being called when level is restarted.
     *
     * @param {Object} params
     * Object of event's parameters.
     *
     * @see module:LevelSet#restart
     */
    LevelSet.prototype.onLevelRestarted = function(params) {};

    /**
     * Method that should be called to unload the set.
     */
    LevelSet.prototype.destroy = function() {
        EventManager.instance.off(Box.EVENT_MOVED_ON_GOAL);

        if (this._level instanceof Level) {
            this._level.disableTouch();
        }

        _.forEach(this._levels, function(level) {
            // TODO: think of destroying level
        });

        $(this.container).find('canvas').remove();
    };

    Object.defineProperties(LevelSet.prototype, {
        /**
         * Gets HTML element containing canvases of set's levels.
         *
         * @type {HTMLElement}
         * @memberof module:LevelSet.prototype
         */
        container: {
            get: function() {
                return this._container;
            }
        },
        /**
         * Gets or sets a name of the set.
         *
         * @type {String}
         * @memberof module:LevelSet.prototype
         */
        name: {
            get: function () {
                return this._name;
            },
            set: function(name) {
                if (!_.isString(name)) {
                    throw new Exception('Level set\'s name must be a string.');
                }
                this._name = name;
            }
        },
        /**
         * Gets or sets a description of the set.
         *
         * @type {String}
         * @memberof module:LevelSet.prototype
         */
        description: {
            get: function() {
                return this._description;
            },
            set: function(description) {
                if (!_.isString(description)) {
                    throw new Exception('Level set\'s description must be a string.');
                }
                this._description = description;
            }
        },
        /**
         * Gets or sets active level.
         *
         * <p>Active level can be specified not only by [level]{@link module:Level}'s instance
         * but also by its zero-based index.</p>
         *
         * @type {module:Level|Number}
         * @memberof module:LevelSet.prototype
         */
        level: {
            get: function() {
                return this._level;
            },
            set: function(source) {
                var result = this.find(source);

                if (this._level instanceof Level) {
                    this._level.disableTouch();
                }

                this._levelIndex = result.index;
                this._level = result.level;

                this._level.enableTouch();

                $(this.container).children('canvas').each(function(index) {
                    if (index === result.index) {
                        $(this).css('display', 'block');
                    }
                    else {
                        $(this).css('display', 'none');
                    }
                });

                var onLevelChangedParams = {
                    levelSet: this,
                    level: this.level,
                    index: this.levelIndex
                };

                EventManager.instance.raiseEvent(LevelSet.EVENT_LEVEL_CHANGED, onLevelChangedParams);
                this.onLevelChanged(onLevelChangedParams);
            }
        },
        /**
         * Gets zero-based index of active level.
         *
         * @type {Number}
         * @memberof module:LevelSet.prototype
         */
        levelIndex: {
            get: function() {
                return this._levelIndex;
            }
        },
        /**
         * Gets a count of levels in the set.
         *
         * @type {Number}
         * @memberof module:LevelSet.prototype
         */
        count: {
            get: function() {
                return this._levels.length;
            }
        }
    });

    return LevelSet;
});