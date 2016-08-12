'use strict';

import _ from 'underscore';

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
        this.stepsPerMove = options.stepsPerMove || 8;

        this.initialize();
    }

    initialize() {
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

        this._isAnimating = false;
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