import _ from 'underscore';
import $ from 'jquery';
import Tween from 'tween.js';

import isInteger from '../../helpers/is-integer';

import Worker from '../object/worker';
import Wall from '../object/wall';
import Goal from '../object/goal';
import Box from '../object/box';

let abstractMethods = [
    'renderWorker',
    'renderWorkerOverGoal',
    'renderWall',
    'renderGoal',
    'renderGoalBehindWorker',
    'renderGoalBehindBox',
    'renderBox',
    'renderBoxOverGoal'
];

class Renderer {
    constructor(options) {
        if (this.constructor === Renderer) {
            throw new Error('Can\'t construct abstract renderer.');
        }

        _.each(abstractMethods, abstractMethod => {
            if (this[abstractMethod] === Renderer.prototype[abstractMethod]) {
                throw new Error('Method "' + abstractMethod + '" is not implemented.');
            }
        });

        if (!(options.container instanceof HTMLElement)) {
            throw new TypeError('Container must be HTML element.');
        }

        _.bindAll(this, 'onWindowResize', 'onMoveEnd');

        this._container = options.container;
        this._canvas = document.createElement('canvas');
        this._container.appendChild(this._canvas);

        this._$container = $(this._container);

        this._level = null;

        this._camera = {
            tween: null,
            offset: {
                x: 0,
                y: 0
            }
        };

        $(window).on('resize', this.onWindowResize);
        this.adjustCanvasSize();
    }

    render(time) {
        let context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.width, this.height);

        if (this.level === null) {
            return;
        }

        _.each(this.level.walls, (wall) => {
            this.renderItem(wall);
        });

        _.each(this.level.goals, (goal) => {
            this.renderItem(goal);
        });

        _.each(this.level.boxes, (box) => {
            this.renderItem(box);
        });

        this.renderItem(this.level.worker);

        Tween.update(time);
    }

    renderItem(item) {
        let context = this._canvas.getContext('2d');

        let x = this.getItemOffsetX(item),
            y = this.getItemOffsetY(item);

        if (item instanceof Wall) {
            this.renderWall(context, x, y, item);
        }
        else if (item instanceof Goal) {
            let items = this.level.at(item.row, item.column, ['worker', 'box']);
            if (items.length === 1) {
                if (items[0] instanceof Worker) {
                    this.renderGoalBehindWorker(context, x, y, item);
                }
                else {
                    this.renderGoalBehindBox(context, x, y, item);
                }
            }
            else {
                this.renderGoal(context, x, y, item);
            }
        }
        else if (item instanceof Worker) {
            if (this.level.at(item.row, item.column, ['goal']).length === 1) {
                this.renderWorkerOverGoal(context, x, y, item);
            }
            else {
                this.renderWorker(context, x, y, item);
            }
        }
        else if (item instanceof Box) {
            if (this.level.at(item.row, item.column, ['goal']).length === 1) {
                this.renderBoxOverGoal(context, x, y, item);
            }
            else {
                this.renderBox(context, x, y, item);
            }
        }
    }

    getItemOffsetX(item) {
        return this._camera.offset.x + item.column * this.itemWidth;
    }

    getItemOffsetY(item) {
        return this._camera.offset.y + item.row * this.itemHeight;
    }

    adjustCanvasSize() {
        this.canvas.width = this._$container.outerWidth(true);
        this.canvas.height = this._$container.outerHeight(true);
    }

    adjustCamera(options) {
        let interrupt = options.interrupt || false;
        if (this._camera.tween) {
            if (!interrupt) {
                return;
            }
            this._camera.tween.stop();
            this._camera.tween = null;
        }

        // If the whole level can't be placed within the canvas
        // we will move the camera to grant worker is visible at each moment of time
        let offsetX = this.calculateCameraOffsetX(),
            offsetY = this.calculateCameraOffsetY();

        // Checking whether camera's calculated position differs from the current one
        if (this._camera.offset.x === offsetX && this._camera.offset.y === offsetY) {
            return;
        }

        let smooth = options.smooth || false;
        if (!smooth) {
            this._camera.offset.x = offsetX;
            this._camera.offset.y = offsetY;
            return;
        }

        let delay = isInteger(options.delay) ? options.delay : 500,
            duration = isInteger(options.duration) ? options.duration : 300;

        let tween = this._camera.tween = new Tween.Tween(this._camera.offset);
        tween.delay(delay).easing(Tween.Easing.Quadratic.In).to({
            x: offsetX,
            y: offsetY
        }, duration).onComplete(() => {
            this._camera.tween = null;
        }).start();
    }

    calculateCameraOffsetX() {
        let isVisibleX = true,
            offsetX = Math.round((this.width - this.levelWidth) / 2);

        if (this.levelWidth > this.width) {
            // Calculating left point of the worker relative to the canvas
            let x = this.getItemOffsetX(this.level.worker);

            // Checking whether worker is within visible rectangle
            // that is 5/8 of the canvas and placed in the center of the canvas
            let visibleRectLeft = Math.round(this.width * 3 / 16),
                visibleRectRight = this.width - Math.round(this.width * 3 / 16);

            if (this._camera.offset.x === this.width - this.levelWidth) {
                visibleRectRight = this.width;
            }
            else if (this._camera.offset.x === 0) {
                visibleRectLeft = 0;
            }

            isVisibleX = x >= visibleRectLeft && x + this.itemWidth <= visibleRectRight;

            if (!isVisibleX) {
                // We have to recalculate camera's left position to place the worker in the center
                let workerCanvasCenterX = Math.round((this.width - this.itemWidth) / 2);
                offsetX = this._camera.offset.x + workerCanvasCenterX - x;
            }
            else {
                offsetX = this._camera.offset.x;
            }

            if (offsetX > 0) {
                offsetX = 0;
            }
            else if (offsetX < this.width - this.levelWidth) {
                offsetX = this.width - this.levelWidth;
            }
        }

        return offsetX;
    }

    calculateCameraOffsetY() {
        let isVisibleY = true,
            offsetY = Math.round((this.height - this.levelHeight) / 2);

        if (this.levelHeight > this.height) {
            // Calculating top point of the worker relative to the canvas
            let y = this.getItemOffsetY(this.level.worker);

            // Checking whether worker is within visible rectangle
            // that is 5/8 of the canvas and placed in the center of the canvas
            let visibleRectTop = Math.round(this.height * 3 / 16),
                visibleRectBottom = this.height - Math.round(this.height * 3 / 16);

            if (this._camera.offset.y === this.height - this.levelHeight) {
                visibleRectBottom = this.height;
            }
            else if (this._camera.offset.y === 0) {
                visibleRectTop = 0;
            }

            isVisibleY = y >= visibleRectTop &&
                y + this.itemHeight <= visibleRectBottom;

            if (!isVisibleY) {
                // We have to recalculate camera's top position to place the worker in the center
                let workerCanvasCenterY = Math.round((this.height - this.itemHeight) / 2);
                offsetY = this._camera.offset.y + workerCanvasCenterY - y;
            }
            else {
                offsetY = this._camera.offset.y;
            }

            if (offsetY > 0) {
                offsetY = 0;
            }
            else if (offsetY < this.height - this.levelHeight) {
                offsetY = this.height - this.levelHeight;
            }
        }

        return offsetY;
    }

    get container() {
        return this._container;
    }

    get canvas() {
        return this._canvas;
    }

    get width() {
        return this._canvas.width;
    }

    set width(width) {
        this._canvas.width = width;
    }

    get height() {
        return this._canvas.height;
    }

    set height(height) {
        this._canvas.height = height;
    }

    get level() {
        return this._level;
    }

    set level(level) {
        if (this.level) {
            this.removeLevelListeners(this.level);
        }

        this._level = level;
        this.addLevelListeners(level);

        this.adjustCamera({
            smooth: false,
            interrupt: true
        });
    }
    
    get levelWidth() {
        return this.level.columns * this.itemWidth; 
    }
    
    get levelHeight() {
        return this.level.rows * this.itemHeight;
    }

    get itemWidth() {
        return 8;
    }

    get itemHeight() {
        return 8;
    }

    addLevelListeners(level) {
        level.on('move:end', this.onMoveEnd);
    }

    removeLevelListeners(level) {
        level.off('move:end', this.onMoveEnd);
    }

    renderWorker(context, x, y, item) {
        throw new Error('Method "renderWorker" is not implemented.');
    }

    renderWorkerOverGoal(context, x, y, item) {
        throw new Error('Method "renderWorkerOverGoal" is not implemented.');
    }

    renderWall(context, x, y, item) {
        throw new Error('Method "renderWall" is not implemented.');
    }

    renderGoal(context, x, y, item) {
        throw new Error('Method "renderGoal" is not implemented.');
    }

    renderGoalBehindWorker(context, x, y, item) {
        throw new Error('Method "renderGoalBehindWorker" is not implemented.');
    }

    renderGoalBehindBox(context, x, y, item) {
        throw new Error('Method "renderGoalBehindBox" is not implemented.');
    }

    renderBox(context, x, y, item) {
        throw new Error('Method "renderBox" is not implemented.');
    }

    renderBoxOverGoal(context, x, y, item) {
        throw new Error('Method "renderBoxOverGoal" is not implemented.');
    }

    onWindowResize() {
        this.adjustCanvasSize();
        this.adjustCamera({
            smooth: true,
            interrupt: true
        });
    }

    onMoveEnd() {
        this.adjustCamera({
            smooth: true,
            interrupt: false,
            delay: 50
        });
    }

    destroy() {
        $(window).off('resize', this.onWindowResize);
        if (this.level) {
            this.removeLevelListeners(this.level);
        }
    }
}

export default Renderer;