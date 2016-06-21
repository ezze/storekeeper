'use strict';

import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'lodash';

import Level from './level';
import Loader from './loader/loader';
import LoaderJson from './loader/loader-json';
import LoaderSok from './loader/loader-sok';

import Box from './object/box';

var LevelSet = function(options) {
    if (!(options.app)) {
        throw new Error('Application is invalid or not specified.');
    }

    if (!(options.container instanceof HTMLElement)) {
        throw new Error('Container is invalid or not specified.');
    }

    this._app = options.app;
    this._container = options.container;

    this._name = '';
    this._description = '';

    this._levelIndex = -1;
    this._level = null;
    this._levels = [];

    this.listenTo(this._app.vent, Box.EVENT_MOVE_ON_GOAL, this.onBoxMoveOnGoal);
};

_.extend(LevelSet.prototype, Backbone.Events);

LevelSet.EVENT_LEVEL_CHANGE = 'level-set:level-change';
LevelSet.EVENT_LEVEL_COMPLETE = 'level-set:level-complete';
LevelSet.EVENT_LEVEL_RESTART = 'level-set:level-restart';

LevelSet.prototype.load = function(options) {
    if ((window.File && !(options.source instanceof window.File)) &&
        (!_.isString(options.source) || _.isEmpty(options.source))
    ) {
        throw new Error('Level set\'s source is invalid or not specified.');
    }

    var source = options.source;

    var onSucceed = _.isFunction(options.onSucceed) ? options.onSucceed : null;
    var onFailed = _.isFunction(options.onFailed) ? options.onFailed: null;

    var cleanSource;
    if (window.File && options.source instanceof window.File) {
        cleanSource = options.source.name;
    }
    else {
        var queryStringPos = source.indexOf('?');
        if (queryStringPos === -1) {
            cleanSource = source;
            source += '?';
        }
        else {
            cleanSource = source.slice(0, queryStringPos);
            source += '&';
        }

        source += 'q=' + new Date().getTime();
    }

    var dotPos = cleanSource.lastIndexOf('.');
    var extension = dotPos === -1 ? 'json' : cleanSource.slice(dotPos + 1, cleanSource.length);

    // Determining a loader to use by source extension
    var loader;
    switch (extension) {
        case 'sok':
            loader = new LoaderSok();
            break;

        case 'json':
            loader = new LoaderJson();
            break;
    }
    if (!(loader instanceof Loader)) {
        throw new Error('Unable to determine loader for "' + source + '".');
    }

    var loaderOptions = {
        source: source,
        onSucceed: function(params) {
            var loader = params.loader;
            this.name = loader.name;
            this.description = loader.description;

            var jqContainer = $(this.container);
            _.each(loader.levels, _.bind(function(levelData) {
                var level = new Level(_.extend({
                    app: this._app
                }, levelData));
                this.add(level);
                $(level.canvas)
                    .attr('width', jqContainer.width())
                    .attr('height', jqContainer.height());
                jqContainer.append(level.canvas);
            }, this));

            if (onSucceed !== null) {
                onSucceed(params);
            }
        }.bind(this),
        onFailed: function(params) {
            // TODO: handle error
            if (onFailed !== null) {
                onFailed(params);
            }
        }
    };

    loader.load(loaderOptions);
};

LevelSet.prototype.add = function(level) {
    if (!(level instanceof Level)) {
        throw new Error('Level instance is expected.');
    }

    this._levels.push(level);
};

LevelSet.prototype.find = function(search) {
    if (_.isNumber(search)) {
        if (search % 1 !== 0) {
            throw new Error('Level\'s index must be an integer.');
        }

        if (search < 0 || search >= this._levels.length) {
            throw new Error('Level\'s index is out of bounds.');
        }

        return {
            index: search,
            level: this._levels[search]
        };
    }
    else if (search instanceof Level) {
        var index = _.findIndex(this._levels, search);
        if (index === -1) {
            throw new Error('Level is not found.');
        }

        return {
            index: index,
            level: search
        };
    }

    throw new Error('Level\'s search argument is invalid.');
};

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

LevelSet.prototype.restart = function() {
    this._level.reset();

    var levelRestartParams = {
        levelSet: this,
        level: this.level,
        index: this.levelIndex
    };

    this._app.vent.trigger(LevelSet.EVENT_LEVEL_RESTART, levelRestartParams);
    this.onLevelRestart(levelRestartParams);
};

LevelSet.prototype.onLevelComplete = function(params) {};

LevelSet.prototype.onLevelChange = function(params) {};

LevelSet.prototype.onLevelRestart = function(params) {};

LevelSet.prototype.destroy = function() {
    _.each(this._levels, function(level) {
        level.destroy();
    });
};

LevelSet.prototype.onBoxMoveOnGoal = function(params) {
    var level = params.box.level;
    if (!level.isCompleted()) {
        return;
    }

    var levelCompleteParams = {
        levelSet: this,
        level: level,
        levelIndex: this.levelIndex
    };

    this._app.vent.trigger(LevelSet.EVENT_LEVEL_COMPLETE, levelCompleteParams);
    this.onLevelComplete(levelCompleteParams);
};

Object.defineProperties(LevelSet.prototype, {
    container: {
        get: function() {
            return this._container;
        }
    },
    name: {
        get: function () {
            return this._name;
        },
        set: function(name) {
            if (!_.isString(name)) {
                throw new Error('Level set\'s name must be a string.');
            }
            this._name = name;
        }
    },
    description: {
        get: function() {
            return this._description;
        },
        set: function(description) {
            if (!_.isString(description)) {
                throw new Error('Level set\'s description must be a string.');
            }
            this._description = description;
        }
    },
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

            var levelChangeParams = {
                levelSet: this,
                level: this.level,
                index: this.levelIndex
            };

            this._app.vent.trigger(LevelSet.EVENT_LEVEL_CHANGE, levelChangeParams);
            this.onLevelChange(levelChangeParams);
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

export default LevelSet;