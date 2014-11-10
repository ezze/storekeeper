define([
    './movable'
], function(
    Movable
) {
    "use strict";

    var Box = function(level, row, column) {
        Movable.apply(this, arguments);
        this._name = 'Box';
        this._sprite.gotoAndStop(['box']);
        };
    Box.prototype = Object.create(Movable.prototype);

    Box.prototype.moveLeft = function() {
        this._sprite.x -= this._sprite.vX;
    };

    Box.prototype.moveRight = function() {
        this._sprite.x += this._sprite.vX;
    };

    Box.prototype.moveUp = function() {
        this._sprite.y -= this._sprite.vY;
    };

    Box.prototype.moveDown = function () {
        this._sprite.y += this._sprite.vY;
    };

    //TODO: change sprite when box is on goal field

    return Box;
});