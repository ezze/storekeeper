define([
    'easel',
    'lodash',
    './sprite-sheet'
], function(
    Easel,
    _,
    spriteSheet
) {
    'use strict';

    var Sprite = function(level, row, column) {
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

    Sprite.prototype = {
        getName: function() {
            return this._name;
        },

        find: function() {
            return this._level;
        },

        getRow: function() {
            return this._row;
        },

        getColumn: function() {
            return this._column;
        },

        getSprite: function() {
            return this._sprite;
        },

        transformToLocal: function() {
            var column = this._sprite.x / this._width;
            var row = this._sprite.y / this._height;
            this.setColumn(column);
            this.setRow(row);
        },

        setRow: function(row) {
            if (!_.isNumber(row)) {
                return;
            }
            this._row = row;
        },

        setColumn: function(column) {
            if (!_.isNumber(column)) {
                return;
            }
            this._column = column;
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

    return Sprite;
});