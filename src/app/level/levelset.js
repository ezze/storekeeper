/**
 * @module LevelSet
 */
define([
    'jquery',
    'lodash',
    './level',
    '../event-manager',
    '../exception'
], function(
    $,
    _,
    Level,
    EventManager,
    Exception
) {
    'use strict';

    /**
     * @param options
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

        this._eventManager = options.eventManager instanceof EventManager ? options.eventManager : null;
        this._onLoad = _.isFunction(options.onLoad) ? options.onLoad : null;

        this._name = '';
        this._description = '';

        this._levelIndex = -1;
        this._level = null;
        this._levels = [];

        this.load();
    };

    LevelSet.EVENT_LOADED = 'levelSet:loaded';
    LevelSet.EVENT_LEVEL_CHANGED = 'levelSet:levelChanged';

    LevelSet.prototype = {
        load: function() {
            // TODO: handle error

            var url = this._source;
            if (url.indexOf('?') === -1) {
                url += '?';
            }
            else {
                url += '&';
            }
            url += 'q=' + new Date().getTime();

            $.ajax({
                url: url,
                success: function(data, textStatus, jqXHR) {
                    this.parse(data);

                    if (_.isFunction(this._onLoad)) {
                        this._onLoad.call();
                    }

                    if (this.eventManager) {
                        this.eventManager.raiseEvent(LevelSet.EVENT_LOADED, {
                            source: this._source
                        });
                    }
                }.bind(this)
            });
        },

        parse: function(data) {
            if (typeof data.name === 'string') {
                this.name = data.name;
            }

            if (typeof data.description === 'string') {
                this.description = data.description;
            }

            if (_.isArray(data.levels)) {
                var jqContainer = $(this.container);

                _.forEach(data.levels, function(levelData) {
                    var level = new Level(_.merge({}, {
                        eventManager: this.eventManager
                    }, levelData));

                    this.add(level);

                    $(level.canvas)
                        .attr('width', jqContainer.width())
                        .attr('height', jqContainer.height());
                    jqContainer.append(level.canvas);
                }, this);
            }
        },

        add: function(level) {
            if (!(level instanceof Level)) {
                throw new Exception('Level instance is expected.');
            }

            this._levels.push(level);
        },

        find: function(search) {
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
        },

        remove: function(level) {
            if (!(level instanceof Level)) {
                // TODO: throw an exception
                return;
            }

            var index = $.inArray(level, this._levels);
            if (index === -1) {
                // TODO: throw an exception
                return;
            }

            this._level.splice(index, 1);
        }
    };

    Object.defineProperties(LevelSet.prototype, {
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
        name: {
            get: function () {
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
        level: {
            get: function() {
                return this._level;
            },
            set: function(source) {
                var result = this.find(source);
                this._levelIndex = result.index;
                this._level = result.level;
                $(this.container).children('canvas').each(function(index) {
                    if (index === result.index) {
                        $(this).css('display', 'block');
                    }
                    else {
                        $(this).css('display', 'none');
                    }
                });

                if (this.eventManager) {
                    var onLevelChangedParams = {
                        index: this._levelIndex,
                        level: this._level
                    };
                    this.eventManager.raiseEvent(LevelSet.EVENT_LEVEL_CHANGED, onLevelChangedParams);
                }
            }
        },
        levelIndex: {
            get: function() {
                return this._levelIndex;
            }
        },
        count: {
            get: function() {
                return this._levels.length;
            }
        }
    });

    return LevelSet;
});