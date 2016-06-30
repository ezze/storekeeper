'use strict';

import LevelMap from './level-map';
//import Item from './object/item';
//import Worker from './object/worker';

export default class Level {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.map = new LevelMap([]);

        this._worker = null;
        this._walls = [];
        this._goals = [];
        this._boxes = [];
    }

    get rows() {
        return this._rows;
    }

    set rows(rows) {
        this._rows = rows;
    }

    get columns() {
        return this._columns;
    }

    set columns(columns) {
        this._columns = columns;
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
}