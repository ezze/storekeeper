define([
    'ring',
    'easel'
], function(
    Ring,
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
            workerLeftWalk: [5, 12],
            workerRightStand: [13],
            workerRightWalk: [14, 21],
            space: [22]
        }
    };
    var spriteSheet = new Easel.SpriteSheet(data);

    var Object = Ring.create({
        constructor: function(level, row, column) {
            this._level = level;
            this._row = row;
            this._column = column;
            this._sprite = new Easel.Sprite(spriteSheet, 'space');
            this._sprite.x = column * data.frames.width;
            this._sprite.y = row * data.frames.height;
        },

        getLevel: function() {
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
        }
    });
    return Object;
});