define([
    'jquery',
    'backbone',
    'easel',
    './exception',
    './level/levelset'
], function(
    $,
    Backbone,
    Easel,
    Exception,
    LevelSet
) {
    "use strict";

    var Storekeeper = function (canvasSelector, levelSetSource) {
            if (typeof canvasSelector !== 'string') {
                throw new Exception('Canvas selector is not defined or invalid.');
            }

            var jqCanvas = $(canvasSelector);
            if (jqCanvas.length === 0) {
                throw new Exception('Canvas "' + canvasSelector + '" doesn\'t exist.');
            }

            var that = this;
            this._levelSet = new LevelSet(this, levelSetSource, function () {
                that._activeLevel = that._levelSet.selectLevelByIndex(0);
                // initial render;
                that._activeLevel.update();
                // attaching handlers
                that.handleUserInputs();
                // Initializing ticker
                Easel.Ticker.setFPS(24);
                Easel.Ticker.addEventListener('tick', function(event) {
                    that.onAnimationFrame.call(that, event);
                });
            });
        };


    Storekeeper.prototype.handleUserInputs = function() {
        var that = this;
        var worker = that._activeLevel.getWorker();
        // TODO: this object might store user actions, i haven't decided yet,
        // TODO : whether it will be Worker's state object or this one
        that._userAction = {};
        // TODO: all handlers for user inputs and shortcuts define in separate module, i.e. 'controls'
        $(window).keydown(function(event) {
            if (!worker.isMoving) {
                switch (event.which) {
                    case 87:
                    case 38:
                        worker.setCurrentState('up');
                        break;
                    case 83:
                    case 40:
                        worker.setCurrentState('down');
                        break;
                    case 37:
                    case 65:
                        worker.setCurrentState('left');
                        break;
                    case 39:
                    case 68:
                        worker.setCurrentState('right');
                        break;
                    default:
                        worker.setCurrentState('stand');
                        break;
                }
                that._userAction.isKeyDown = true;
            }

        });
        $(window).keyup(function() {
            that._userAction.isKeyDown = false;
        })
    };

    Storekeeper.prototype.onAnimationFrame = function() {
        var level = this._activeLevel;
        var worker = level.getWorker();
        if (!worker._hasCollision) {
            var state = worker.getCurrentState();
            if (typeof state === 'function') {
                state.call(worker);
                level.update();
            }
        }
        worker._hasCollision = false;
    };

    return Storekeeper;
    });



