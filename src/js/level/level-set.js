import _ from 'underscore';
import Backbone from 'backbone';

import isInteger from '../helpers/is-integer';
import Level from './level';

class LevelSet {
    constructor(levelSetSource) {
        this._levels = [];
        this._index = null;
        this.load(levelSetSource);
    }

    addLevelListeners(level) {
        this.listenTo(level, 'move:start', stats => {
            this.trigger('level:move:start', stats);
        });

        this.listenTo(level, 'move:end', stats => {
            this.trigger('level:move:end', stats);
        });

        this.listenTo(level, 'completed', () => {
            this.trigger('level:completed');
        });
    }

    removeLevelListeners(level) {
        this.stopListening(level);
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
            this.level = 0;
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

    goToPrevious() {
        if (this.level === null) {
            return;
        }

        let index = this._index - 1;
        if (index < 0) {
            index = this._levels.length - 1;
        }

        this.level = index;
        this.trigger('level:number', this.levelNumber);
    }

    goToNext() {
        if (this.level === null) {
            return;
        }

        let index = this._index + 1;
        if (index >= this._levels.length) {
            index = 0;
        }

        this.level = index;
        this.trigger('level:number', this.levelNumber);
    }

    restart() {
        if (this.level === null) {
            return;
        }

        this.level.reset();
        this.trigger('level:number', this.levelNumber);
    }

    get levelIndex() {
        return this._index;
    }

    get levelNumber() {
        return this._index + 1;
    }

    get level() {
        return isInteger(this._index) ? this.get(this._index) : null;
    }

    set level(level) {
        if (this.level !== null) {
            this.removeLevelListeners(this.level);
        }

        if (isInteger(level)) {
            level = this.get(level);
        }

        // Checking whether specified level exists in level set
        let index = this._levels.indexOf(level);
        if (index === -1) {
            throw new Error('Level doesn\'t exist in level set.');
        }

        this._index = index;

        this.addLevelListeners(level);
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

    destroy() {
        // TODO: implement (remove levels and listeners)

        if (this.level !== null) {
            this.removeLevelListeners(this.level);
        }
    }
}

_.extend(LevelSet.prototype, Backbone.Events);

export default LevelSet;