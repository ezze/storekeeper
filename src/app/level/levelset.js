/**
 * @module LevelSet
 */
define([
    'jquery',
    'lodash',
    './level',
    '../event-manager'
], function(
    $,
    _,
    Level,
    EventManager
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
        this._source = options.source;
        this._onLoad = options.onLoad;
        this._eventManager = options.eventManager instanceof EventManager ? options.eventManager : null;

        this._name = '';
        this._description = '';

        this._levelIndex = -1;
        this._level = null;
        this._levels = [];

        this.load();
    };

    LevelSet.EVENT_LOADED = 'levelSet:loaded';

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

            if ($.isArray(data.levels)) {
                for (var i = 0; i < data.levels.length; i++) {
                    var level = new Level(_.merge({
                        eventManager: this.eventManager
                    }, data.levels[i]));
                    this.add(level);
                }
            }
        },

        add: function(level) {
            if (!(level instanceof Level)) {
                // TODO: throw an exception
                return;
            }

            this._levels.push(level);
        },

        find: function(index) {
            // TODO: differ getting level by index and by reference
            if (index < 0 || index >= this._levels.length) {
                // TODO: throw an exception
                return null;
            }

            // TODO: return object containing level's reference and index
            return this._levels[index];
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
                if (!_.isNumber(source) || source % 1 !== 0) {
                    // TODO: throw an exception
                }

                var level = this.find(source);
                if (!(level instanceof Level)) {
                    // TODO: throw an exception
                    return;
                }

                // TODO: rewrite
                if (this._level instanceof Level) {
                    this._level.stop();
                }

                this._levelIndex = source;
                this._level = level.clone();
                this._level.start();
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