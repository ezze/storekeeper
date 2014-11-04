define([
    'jquery',
    'parallel',
    './level'
], function(
    $,
    Parallel,
    Level
) {
    "use strict";

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
            var that = this;
            $.ajax({
                url: this._source,
                success: function(data, textStatus, jqXHR) {
                    that.parseLevels(data);
                },
                complete: function(jqXHR, textStatus) {
                    if (typeof that._loadCallback === 'function')
                        that._loadCallback.call();
                }
            });
        },

        parseLevels: function(data) {
            if (typeof data.name === 'string')
                this.setName(data.name);
            if (typeof data.description === 'string')
                this.setDescription(data.description);
            if ($.isArray(data.levels)) {
                for (var i = 0; i < data.levels.length; i++) {
                    var level = new Level(this._storekeeper, data.levels[i]);
                    this.addLevel(level);
                }
            }
        },

        getName: function() {
            return this._name;
        },

        setName: function(name) {
            this._name = name;
        },

        getDescription: function() {
            return this._description;
        },

        setDescription: function(description) {
            this._description = description;
        },

        addLevel: function(level) {
            if (!(level instanceof Level))
                return;
            this._levels.push(level);
        },

        getLevelByIndex: function(index) {
            if (index < 0 || index >= this._levels.length)
                return null;
            return this._levels[index];
        },

        removeLevel: function(level) {
            if (!(level instanceof Level))
                return;
            var index = $.inArray(level, this._levels);
            if (index === -1)
                return;
            this._level.splice(index, 1);
        },

        selectLevelByIndex: function(index) {
            var level = this.getLevelByIndex(index);
            if (!level)
                return;

            // TODO: rewrite
            if (this._level != null) {
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
    return LevelSet;
});
