define([
    'easel',
    'lodash',
    './sprite-sheet',
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

        this._maxMovesPerCell = 16;

        this._sprite = new Easel.Sprite(spriteSheet.instance, 'space');
        this._sprite.x = column * spriteSheet.data.frames.width;
        this._sprite.y = row * spriteSheet.data.frames.height;
        this._sprite.vX = spriteSheet.data.frames.width / this._maxMovesPerCell;
        this._sprite.vY = spriteSheet.data.frames.height / this._maxMovesPerCell;
    };

    SceneObject.prototype = {
        transformToLocal: function() {
            this.column = this._sprite.x / this._width;
            this.row = this._sprite.y / this._height;
        },

        setSpeedMultiplier: function(num) {
            // TODO: it should be one of allowed values (i.e. pow of 2 or common factor of sprite dimension)
            if (!_.isNumber(num)) {
                this._maxMovesPerCell = num;
            }
        },

        stopAnimation: function() {
            this._sprite.stop();
        }
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
                if (!_.isNumber(row) || row % 1 !== 0) {
                    throw new Exception('Row must be an integer.');
                }
                this._row = row;
            }
        },
        column: {
            get: function() {
                return this._column;
            },
            set: function(column) {
                if (!_.isNumber(column) || column % 1 !== 0) {
                    throw new Exception('Column must be an integer.');
                }
                this._column = column;
            }
        }
    });

    return SceneObject;
});