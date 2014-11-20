define([
    'require',
    'easel',
    'lodash',
    '../sprite-sheet',
    '../../event-manager',
    '../../exception'
], function(
    require,
    Easel,
    _,
    spriteSheet,
    EventManager,
    Exception
) {
    'use strict';

    var SceneObject = function(options) {
        if (!options.level instanceof require('../level')) {
            throw new Exception('Level is invalid or not specified.');
        }

        if (!_.isNumber(options.row) || options.row % 1 !== 0) {
            throw new Exception('Scene object\'s row must be an integer.');
        }

        if (!_.isNumber(options.column) || options.column % 1 !== 0) {
            throw new Exception('Scene object\'s column must be an integer.');
        }

        this._name = '';

        this._level = options.level;
        this._row = options.row;
        this._column = options.column;

        this._width = spriteSheet.data.frames.width;
        this._height = spriteSheet.data.frames.height;

        this._sprite = new Easel.Sprite(spriteSheet.instance, 'space');

        this.updatePixels();
    };

    SceneObject.prototype.columnToPixels = function(column) {
        return column * this._width;
    };

    SceneObject.prototype.rowToPixels = function(row) {
        return row * this._height;
    };

    SceneObject.prototype.pixelsToColumn = function(pixels) {
        return pixels / this._width;
    };

    SceneObject.prototype.pixelsToRow = function(pixels) {
        return pixels / this._height;
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
                    throw new Exception('Row must be a number.');
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
                    throw new Exception('Column must be a number.');
                }
                this._column = column;
            }
        }
    });

    SceneObject.spriteSheet = spriteSheet;

    return SceneObject;
});