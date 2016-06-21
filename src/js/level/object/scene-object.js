'use strict';

import Backbone from 'backbone';
import Easel from 'easel';
import _ from 'lodash';

import spriteSheet from '../sprite-sheet';

var SceneObject = function(options) {
    if (!options.app) {
        throw new Error('Application is invalid or not specified.');
    }

    if (!options.level) {
        throw new Error('Level is invalid or not specified.');
    }

    if (!_.isNumber(options.row) || options.row % 1 !== 0) {
        throw new Error('Scene object\'s row must be an integer.');
    }

    if (!_.isNumber(options.column) || options.column % 1 !== 0) {
        throw new Error('Scene object\'s column must be an integer.');
    }

    this._app = options.app;

    this._name = '';

    this._level = options.level;
    this._row = options.row;
    this._column = options.column;

    this._width = spriteSheet.data.frames.width;
    this._height = spriteSheet.data.frames.height;

    this._sprite = new Easel.Sprite(spriteSheet.instance, 'space');

    this.updatePixels();
};

_.extend(SceneObject.prototype, Backbone.Events);

SceneObject.prototype.columnToPixels = function(column) {
    return column * this._width;
};

SceneObject.prototype.rowToPixels = function(row) {
    return row * this._height;
};

SceneObject.prototype.updatePixels = function() {
    this._sprite.x = this.columnToPixels(this.column);
    this._sprite.y = this.rowToPixels(this.row);
};

Object.defineProperties(SceneObject.prototype, {
    name: {
        get: function() {
            return this._name;
        }
    },
    level: {
        get: function() {
            return this._level;
        }
    },
    sprite: {
        get: function() {
            return this._sprite;
        }
    },
    row: {
        get: function() {
            return this._row;
        },
        set: function(row) {
            if (!_.isNumber(row)) {
                throw new Error('Row must be a number.');
            }
            this._row = row;
        }
    },
    column: {
        get: function() {
            return this._column;
        },
        set: function(column) {
            if (!_.isNumber(column)) {
                throw new Error('Column must be a number.');
            }
            this._column = column;
        }
    }
});

SceneObject.spriteSheet = spriteSheet;

export default SceneObject;