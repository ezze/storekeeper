import Level from './Level';

import {
  EVENT_LEVEL_CHANGE
} from '../../constants/event';

class LevelPack {
  _eventBus = null;
  _levels = [];
  _index = -1;

  constructor(source, options = {}) {
    const { fileName, name = '', description = '', levels = [], levelNumber } = source;
    this._fileName = fileName;
    this._name = name;
    this._description = description;

    const { eventBus = null } = options;
    this._eventBus = eventBus;

    this.load(levels, { levelNumber });
  }

  destroy() {

  }

  load(levels, options = {}) {
    const levelOptions = {};
    if (this._eventBus) {
      levelOptions.eventBus = this._eventBus;
    }
    levels.forEach(({ items }) => this.add(new Level(items, levelOptions)));
    const { levelNumber } = options;
    if (typeof levelNumber === 'number' && levelNumber >= 1 && levelNumber <= this._levels.length) {
      this.setLevel(levelNumber - 1);
    }
  }

  get fileName() {
    return this._fileName;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
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
    if (this._index === -1) {
      this.setLevel(0);
    }
  }

  remove(level) {
    const index = this._levels.find(l => l === level);
    if (index >= 0) {
      this._levels.splice(index, 1);
      if (this._index >= index) {
        this._index--;
      }
    }
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
