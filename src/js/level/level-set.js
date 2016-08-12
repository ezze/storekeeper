import _ from 'underscore';

import isInteger from '../helpers/is-integer';
import Level from './level';
import levelSetSource from '../../levels/original.json';

export default class LevelSet {
    constructor() {
        this._levels = [];
        this._index = null;

        this.load(levelSetSource);
    }

    load(levelSetSource) {
        _.each(levelSetSource.levels, levelSource => {
            let level = new Level(levelSource.items);
            this.add(level);
        });
    }

    add(level) {
        if (_.isArray(level)) {
            level = new Level(level);
        }

        this._levels.push(level);

        if (this._index === null && this._levels.length === 1) {
            this._index = 0;
        }
    }

    get(index) {
        if (index < 0 || index >= this._levels.length) {
            throw new RangeError('Level index is out of bounds.');
        }
        return this._levels[index];
    }

    remove(level) {
        // TODO: implement
    }

    get levelIndex() {
        return this._index;
    }

    get level() {
        return isInteger(this._index) ? this.get(this._index) : null;
    }

    set level(level) {
        if (isInteger(level)) {
            level = this.get(level);
        }

        // Checking whether specified level exists in level set
        let index = this._levels.indexOf(level);
        if (index === -1) {
            throw new Error('Level doesn\'t exist in level set.');
        }

        this._index = index;
    }

    toString() {
        let output = '';
        _.each(this._levels, (level, index) => {
            if (output) {
                output += '\n\n';
            }
            output += 'Level ' + (index + 1) + '\n' + level.toString();
        });
        return output;
    }
}