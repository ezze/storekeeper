import Level from './Level';

import {
  EVENT_LEVEL_CHANGE
} from '../../constants/event';

class LevelPack {
  _eventBus = null;
  _levels = [];
  _index = -1;

  constructor(source, options = {}) {
    const { name = '', description = '', levels = [] } = source;
    this.name = name;
    this.description = description;

    const { eventBus = null } = options;
    this._eventBus = eventBus;

    this.load(levels);
  }

  destroy() {

  }

  load(levels) {
    const levelOptions = {};
    if (this._eventBus) {
      levelOptions.eventBus = this._eventBus;
    }
    levels.forEach(({ items }) => this.add(new Level(items, levelOptions)));
  }

  get levelNumber() {
    return this._index + 1;
  }

  get level() {
    return this._index >= 0 ? this.getLevel(this._index) : null;
  }

  getLevel(index) {
    if (index < 0 || index >= this._levels.length) {
      throw new RangeError('Level index is out of bounds.');
    }
    return this._levels[index];
  }

  setLevel(index) {
    if (index < 0 || index >= this._levels.length) {
      throw new RangeError('Level index is out of bounds.');
    }
    this._index = index;
    if (this._eventBus) {
      const { level, levelNumber } = this;
      const { movesCount, pushesCount, boxesCount, retractedBoxesCount } = level;
      const params = { levelNumber, movesCount, pushesCount, boxesCount, retractedBoxesCount };
      this._eventBus.fire(EVENT_LEVEL_CHANGE, params);
    }
  }

  add(level) {
    if (Array.isArray(level)) {
      level = new Level(level);
    }
    this._levels.push(level);
    if (this._index === -1 && this._levels.length === 1) {
      this.setLevel(0);
    }
  }

  remove(level) { // eslint-disable-line no-unused-vars
    // TODO: implement
  }

  previous() {
    if (!this.level) {
      throw new TypeError('Level is not selected.');
    }
    let index = this._index - 1;
    if (index < 0) {
      index = this._levels.length - 1;
    }
    this.setLevel(index);
  }

  next() {
    if (!this.level) {
      throw new TypeError('Level is not selected.');
    }
    let index = this._index + 1;
    if (index >= this._levels.length) {
      index = 0;
    }
    this.setLevel(index);
  }

  restart() {
    if (!this.level) {
      throw new TypeError('Level is not selected.');
    }
    this.level.reset();
  }

  toString() {
    let output = '';
    this._levels.forEach((level, index) => {
      if (output) {
        output += '\n\n';
      }
      output += 'Level ' + (index + 1) + '\n' + level.toString();
    });
    return output;
  }
}

export default LevelPack;
