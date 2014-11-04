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

            this._jqCanvas = $(canvasSelector);
            if (this._jqCanvas.length === 0) {
                throw new Exception('Canvas "' + canvasSelector + '" doesn\'t exist.');
            }

            var that = this;
            this._levelSet = new LevelSet(this, levelSetSource, function () {
                that._activeLevel = that._levelSet.selectLevelByIndex(33);
                // initial render;
                that._activeLevel.update();
                // attaching handlers
                that.handleUserInputs();
                // Initializing ticker
                Easel.Ticker.setFPS(24);
                Easel.Ticker.addEventListener('tick', function (event) {
                    that.onAnimationFrame.call(that, event);
                });
            });
        };


    Storekeeper.prototype.handleUserInputs = function () {
        var that = this;
        var worker = that._activeLevel.getWorker();
        // TODO: this object might store user actions, i haven't decided yet,
        // TODO : whether it will be Worker's state object or this one
        that._userAction = {};
        $(window).keydown(function(event) {
            worker._state.previous = worker.getCurrentState();
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
                    break;
            }
            that._userAction.isKeyDown = true;
            that._userAction.keepMoving = true;
        });
        $(window).keyup(function () {
            that._userAction.isKeyDown = false;
        })
    };

    Storekeeper.prototype.onAnimationFrame = function() {
        if (this._userAction.keepMoving) {
            var level = this._activeLevel;
            var worker = level.getWorker();
            switch (worker.getCurrentState()) {
                case 'up':
                    if (!level.checkWorkerCollision('up')) {
                        worker.moveUp();
                    }
                    break;
                case 'down':
                    if (!level.checkWorkerCollision('down')) {
                        worker.moveDown();
                    }
                    break;
                case 'left':
                    if (!level.checkWorkerCollision('left')) {
                        worker.moveLeft();
                    }
                    break;
                case 'right':
                    if (!level.checkWorkerCollision('right')) {
                        worker.moveRight();
                    }
                    break;
                case 'stand':
                default:
                    return;
            }
            level.update();
            level._hasCollision = false;
        }
    };

    return Storekeeper;
    });



