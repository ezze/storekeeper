define([
    './object'
], function(
    object
) {
    "use strict";

    var Box = function(level, row, column) {
            object.apply(this, arguments);
            this._sprite.gotoAndStop(['box']);
        };
    Box.prototype = Object.create(object.prototype);
    return Box;
});