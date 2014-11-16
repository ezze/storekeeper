define([
    'easel',
    'lodash',
    '../sprite-sheet',
    '../../exception'
], function(
    Easel,
    _,
    spriteSheet,
    Exception
) {
    'use strict';

    var SceneObject = function(level, row, column) {
        this._level = level;
        this._name = '';

        this._row = row;
        this._column = column;

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

    return SceneObject;
});