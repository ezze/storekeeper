define([
    'jquery',
    'ring',
    './object'
], function(
    $,
    Ring,
    Object
) {
    "use strict";

    var Worker = Ring.create([Object], {
        constructor: function(level, row, column) {
            this.$super(level, row, column);
            this.setLookDirection('left');
        },

        getLookDirection: function() {
            return this._lookDirection;
        },

        setLookDirection: function(direction) {
            if ($.inArray(direction, ['left', 'right']) === -1)
                return;
            this._lookDirection = direction;
            switch (this._lookDirection) {
                case 'left':
                    this._sprite.gotoAndStop('workerLeftStand');
                    break;
                case 'right':
                    this._sprite.gotoAndStop('workerRightStand');
                    break;
            }
        }
    });
    return Worker;
});