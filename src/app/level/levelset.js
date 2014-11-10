define([
    'jquery',
    'lodash',
    './level'
], function(
    $,
    _,
    Level
) {
    'use strict';

    var LevelSet = function(storekeeper, source, loadCallback) {
        this._storekeeper = storekeeper;
        this._source = source;
        this._loadCallback = loadCallback;

        this._name = '';
        this._description = '';

        this._levelIndex = -1;
        this._level = undefined;
        this._levels = [];

        this.load();
    };

    LevelSet.prototype = {
        load: function() {
            $.ajax({
                url: this._source,
                success: function(data, textStatus, jqXHR) {
                    this.parseLevels(data);
                }.bind(this),
                complete: function(jqXHR, textStatus) {
                    if (_.isFunction(this._loadCallback)) {
                        this._loadCallback.call();
                    }
                }.bind(this)
            });
        },

        parseLevels: function(data) {
            if (typeof data.name === 'string') {
                this.name = data.name;
            }

            if (typeof data.description === 'string') {
                this.description = data.description;
            }

            if ($.isArray(data.levels)) {
                for (var i = 0; i < data.levels.length; i++) {
                    var level = new Level(this._storekeeper, data.levels[i]);
                    this.addLevel(level);
                }
            }
        },

        addLevel: function(level) {
            if (!(level instanceof Level)) {
                // TODO: throw an exception
                return;
            }

            this._levels.push(level);
        },

        getLevelByIndex: function(index) {
            if (index < 0 || index >= this._levels.length) {
                // TODO: throw an exception
                return null;
            }

            return this._levels[index];
        },

        removeLevel: function(level) {
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
        },

        selectLevelByIndex: function(index) {
            var level = this.getLevelByIndex(index);
            if (!level) {
                // TODO: throw an exception
                return;
            }

            // TODO: rewrite
            if (this._level instanceof Level) {
                this._level.stop();
            }

            this._levelIndex = index;
            this._level = level.clone();
            this._level.start();
            return level;
        },

        getActiveLevel: function() {
            return this._level;
        }
    };

    Object.defineProperties(LevelSet.prototype, {
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
        }
    });

    return LevelSet;
});