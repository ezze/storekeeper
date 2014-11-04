define([
    'underscore',
    'easel'
], function(
    _,
    Easel
) {
    "use strict";

    var data = {
        images: ['img/sprites.png'],
        frames: {
            width: 32,
            height: 32,
            count: 23
        },
        animations: {
            box: [0],
            boxOnGoal: [1],
            wall: [2],
            goal: [3],
            workerLeftStand: [4],
            workerLeftWalk: [5, 12, true, 1],
            workerRightStand: [13],
            workerRightWalk: [14, 21, true, 1],
            space: [22]
        }
    };
    var spriteSheet = new Easel.SpriteSheet(data);

    var Object = function(level, row, column) {
        this._level = level;
        this._row = row;
        this._column = column;
        this._width = data.frames.width;
        this._height = data.frames.height;
        this._speedMultiplier = 16;
        this._sprite = new Easel.Sprite(spriteSheet, 'space');
        this._sprite.x = column * data.frames.width;
        this._sprite.y = row * data.frames.height;
        this._sprite.vX = data.frames.width / this._speedMultiplier;
        this._sprite.vY = data.frames.height / this._speedMultiplier;
    };

    Object.prototype = {

        getLevel: function () {
            return this._level;
        },

        getRow: function () {
            return this._row;
        },

        getColumn: function () {
            return this._column;
        },

        getSprite: function () {
            return this._sprite;
        },

        transformToLocal: function() {
            var column = this._sprite.x / this._width;
            var row = this._sprite.y / this._height;
            this.setColumn(column);
            this.setRow(row);
        },

        setRow: function (row) {
            if (!_.isNumber(row)) return;
            this._row = row;
        },

        setColumn: function(column) {
            if (!_.isNumber(column)) return;
            this._column = column;
        },

        setSpeedMultiplier: function(num) {
            // TODO: it should be one of allowed values (i.e. pow of 2 or common factor of sprite dimension)
            if (!_.isNumber(num)) {
                this._speedMultiplier = num;
            }
        },

        stopAnimation: function() {
            this._sprite.stop();
        }

    };

    return Object;
    });

