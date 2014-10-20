define([
    'jquery',
    'backbone',
    'ring',
    'easel',
    './exception',
    './level/levelset'
], function(
    $,
    Backbone,
    Ring,
    Easel,
    Exception,
    LevelSet
) {
    "use strict";

    var Storekeeper = Ring.create({
        constructor: function(canvasSelector, levelSetSource) {
            if (typeof canvasSelector !== 'string') {
                throw new Exception('Canvas selector is not defined or invalid.');
            }

            var jqCanvas = $(canvasSelector);
            if (jqCanvas.length === 0) {
                throw new Exception('Canvas "' + canvasSelector + '" doesn\'t exist.');
            }

            var that = this;

            this._levelSet = new LevelSet(this, levelSetSource, function() {
                that._levelSet.selectLevelByIndex(0);

                // Initializing ticker
                Easel.Ticker.setFPS(24);
                Easel.Ticker.addEventListener('tick', function(event) {
                    that.onAnimationFrame.call(that, event);
                });
            });
        },

        onAnimationFrame: function(event) {
            // TODO: 
            //var action = event.keyPress
            var level = this._levelSet.getActiveLevel(); 
            switch(action) {
                case 'left': 
                    level.getWorker().moveLeft();
                    break;
                case 'right':
                    level.getWorker().moveRight();
                    break;
                case 'up':
                    level.getWorker().moveUp();
                    break;
                case 'down':
                    level.getWorker().moveDown();
                    break;
            }
            level.update();
        }
    });

    return Storekeeper;
});
