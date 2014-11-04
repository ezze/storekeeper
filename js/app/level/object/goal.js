define([
    './object'
], function(
    object
) {
    "use strict";

    var Goal = function(level, row, column) {
            object.apply(this, arguments);
            this._sprite.gotoAndStop(['goal']);
        };
    Goal.prototype = Object.create(object.prototype);
    return Goal;
    });