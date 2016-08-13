'use strict';

import _ from 'underscore';

import Direction from './direction';
import LevelMap from './level-map';

import Worker from './object/worker';
import Wall from './object/wall';
import Goal from './object/goal';
import Box from './object/box';

export default class Level {
    constructor(items, options) {
        if (items instanceof LevelMap) {
            this.map = items;
        }
        else {
            this.map = new LevelMap(items);
        }

        if (!this.map.validate()) {
            throw new Error('Level map is invalid.');
        }

        options = options || {};
        this.stepsPerMove = options.stepsPerMove || 16;

        this.reset();
    }

    reset() {
        this._worker = null;
        this._walls = [];
        this._goals = [];
        this._boxes = [];

        for (let row = 0; row < this.map.rows; row++) {
            for (let column = 0; column < this.map.columns; column++) {
                let item = this.map.at(row, column);
                if (LevelMap.isWorkerItem(item)) {
                    this._worker = new Worker(row, column);
                }
                if (LevelMap.isWallItem(item)) {
                    this._walls.push(new Wall(row, column));
                }
                if (LevelMap.isGoalItem(item)) {
                    this._goals.push(new Goal(row, column));
                }
                if (LevelMap.isBoxItem(item)) {
                    this._boxes.push(new Box(row, column));
                }
            }
        }

        this._direction = Direction.NONE;

        this._isAnimating = false;
        this._animatedItems = [];
    }

    at(row, column, filter) {
        let items = [];

        if (!filter) {
            filter = ['worker', 'walls', 'goals', 'boxes'];
        }

        _.each(filter, filterType => {
            switch (filterType) {
                case 'wall': filterType = 'walls'; break;
                case 'goal': filterType = 'goals'; break;
                case 'box': filterType = 'boxes'; break;
            }

            if (filterType === 'worker' && this._worker.row === row && this._worker.column === column) {
                items.push(this._worker);
            }
            else {
                _.each(this['_' + filterType], item => {
                    if (item.row === row && item.column === column) {
                        items.push(item);
                        return false;
                    }
                    return true;
                });
            }
        });

        return items;
    }

    isOutOfBounds(row, column) {
        return row < 0 || row >= this.rows || column < 0 || column >= this.columns;
    }

    move() {
        if (this._isAnimating) {
            if (this.animate()) {
                this._isAnimating = false;
            }
            return false;
        }

        let shift = Direction.getShift(this._direction);
        if (shift.x === 0 && shift.y === 0) {
            this.resetAnimatedItems();
            return false;
        }

        let isCollision = this.detectCollision(shift);
        if (isCollision) {
            this.resetAnimatedItems();
            if (Direction.isValidHorizontal(this._direction)) {
                this.worker.lastHorizontalDirection = this._direction;
            }
            return false;
        }

        this._isAnimating = true;
        _.each(this._animatedItems, item => {
            item.move(this._direction, this.stepSize);
        });

        if (this.animate()) {
            this._isAnimating = false;
        }

        return true;
    }

    detectCollision(shift) {
        let targetRow = this.worker.row + shift.y,
            targetColumn = this.worker.column + shift.x;

        if (this.isOutOfBounds(targetRow, targetColumn)) {
            return false;
        }

        let targetItems = this.at(targetRow, targetColumn),
            animatedItems = [this.worker],
            isCollision = false;

        _.each(targetItems, targetItem => {
            if (targetItem instanceof Wall) {
                isCollision = true;
                return false;
            }

            if (targetItem instanceof Box) {
                let boxTargetRow = targetItem.row + shift.y,
                    boxTargetColumn = targetItem.column + shift.x;

                if (this.isOutOfBounds(boxTargetRow, boxTargetColumn)) {
                    isCollision = true;
                }
                else {
                    let boxTargetItems = this.at(boxTargetRow, boxTargetColumn);
                    _.each(boxTargetItems, boxTargetItem => {
                        if (boxTargetItem instanceof Wall || boxTargetItem instanceof Box) {
                            isCollision = true;
                            return false;
                        }
                    });
                }

                if (isCollision) {
                    return false;
                }

                animatedItems.push(targetItem);
            }
        });

        if (!isCollision) {
            this._animatedItems = animatedItems;
        }

        return isCollision;
    }

    animate() {
        let isAnimated = false;
        _.each(this._animatedItems, item => {
            isAnimated = item.animate();
        });
        return isAnimated;
    }

    resetAnimatedItems() {
        _.each(this._animatedItems, item => {
            item.reset();
        });
        this._animatedItems = [];
    }

    /**
     * @returns {LevelMap}
     */
    get map() {
        return this._map;
    }

    /**
     * @param {LevelMap} map
     */
    set map(map) {
        this._map = map;
    }

    get rows() {
        return this._map.rows;
    }

    get columns() {
        return this._map.columns;
    }

    get stepsPerMove() {
        return this._stepsPerMove;
    }

    set stepsPerMove(stepsPerMove) {
        this._stepsPerMove = stepsPerMove;
    }

    get stepSize() {
        return 1 / this._stepsPerMove;
    }

    get direction() {
        return this._direction;
    }

    set direction(moveDirection) {
        if (Direction.isValid(moveDirection)) {
            this._direction = moveDirection;
        }
    }

    get worker() {
        return this._worker;
    }

    get walls() {
        return this._walls;
    }

    get goals() {
        return this._goals;
    }

    get boxes() {
        return this._boxes;
    }

    toString() {
        return this.map.toString();
    }
}