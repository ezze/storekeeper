import _ from 'underscore';
import $ from 'jquery';

import Worker from '../object/worker';
import Wall from '../object/wall';
import Goal from '../object/goal';
import Box from '../object/box';

class Renderer {
    constructor(options) {
        if (this.constructor === Renderer) {
            throw new Error('Can\'t construct abstract renderer.');
        }

        if (!(options.container instanceof HTMLElement)) {
            throw new TypeError('Container must be HTML element.');
        }

        _.bindAll(this, [
            'onWindowResize'
        ]);

        this._container = options.container;
        this._canvas = document.createElement('canvas');
        this._container.appendChild(this._canvas);

        this._$container = $(this._container);

        this._level = null;

        this._cameraOffsetX = 0;
        this._cameraOffsetY = 0;

        $(window).on('resize', this.onWindowResize);
        this.adjustCanvasSize();
    }

    adjustCanvasSize() {
        this.canvas.width = this._$container.outerWidth(true);
        this.canvas.height = this._$container.outerHeight(true);
    }

    render() {
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
    }

    renderItem(item) {
        let context = this._canvas.getContext('2d');

        let x = this._cameraOffsetX + item.column * this.itemWidth,
            y = this._cameraOffsetY + (item.row + 1) * this.itemHeight;

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
        this._level = level;
    }

    get itemWidth() {
        throw new Error('Getter method for "itemWidth" is not implemented.');
    }

    get itemHeight() {
        throw new Error('Getter method for "itemHeight" is not implemented.');
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

    onWindowResize(event) {
        this.adjustCanvasSize();
    }

    destroy() {
        $(window).off('resize', this.onWindowResize);
    }
}

export default Renderer;