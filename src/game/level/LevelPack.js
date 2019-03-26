import { EventMixin } from 'dissemination';

import { EVENT_LEVEL_CHANGE } from '../../constants';

import Level from './Level';

class LevelPack {
  _levels = [];
  _levelIndex = null;

  get levelNumber() {
    return typeof this._levelIndex === 'number' ? this._levelIndex + 1 : null;
  }

  get level() {
    return typeof this._levelIndex === 'number' ? this.getLevel(this._levelIndex) : null;
  }

  constructor(source) {
    this.load(source);
  }

  destroy() {
    // TODO: implement (remove levels and listeners)
    if (this.level !== null) {
      this.removeLevelListeners(this.level);
    }
  }

  load(source) {
    source.levels.forEach(({ items }) => this.add(new Level(items)));
  }

  getLevel(index) {
    if (index < 0 || index >= this._levels.length) {
      throw new RangeError('Level index is out of bounds.');
    }
    return this._levels[index];
  }

  setLevel(level) {
    if (this.level !== null) {
      this.removeLevelListeners(this.level);
    }

    if (typeof level === 'number') {
      level = this.getLevel(level);
    }

    // Checking whether specified level exists in level pack
    const index = this._levels.indexOf(level);
    if (index === -1) {
      throw new Error('Level doesn\'t exist in level pack.');
    }

    this._levelIndex = index;
    this.addLevelListeners(level);
  }

  addLevelListeners(level) {
    /*
    this.listenTo(level, 'move:start', stats => {
      this.trigger('level:move:start', stats);
    });

    this.listenTo(level, 'move:end', stats => {
      this.trigger('level:move:end', stats);
    });

    this.listenTo(level, 'completed', () => {
      this.trigger('level:completed');
    });
     */
  }

  removeLevelListeners(level) {
    /*
    this.stopListening(level);
     */
  }

  add(level) {
    if (Array.isArray(level)) {
      level = new Level(level);
    }
    this._levels.push(level);
    if (this._levelIndex === null && this._levels.length === 1) {
      this.setLevel(0);
    }
  }

  remove(level) {
    // TODO: implement
  }

  goToPrevious() {
    if (this.level === null) {
      return;
    }
    let index = this._levelIndex - 1;
    if (index < 0) {
      index = this._levels.length - 1;
    }
    this.setLevel(index);
    this.fire(EVENT_LEVEL_CHANGE, this.levelNumber);
  }

  goToNext() {
    if (this.level === null) {
      return;
    }
    let index = this._levelIndex + 1;
    if (index >= this._levels.length) {
      index = 0;
    }
    this.setLevel(index);
    this.fire(EVENT_LEVEL_CHANGE, this.levelNumber);
  }

  restart() {
    if (this.level === null) {
      return;
    }
    this.level.reset();
    this.fire(EVENT_LEVEL_CHANGE, this.levelNumber);
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

Object.assign(LevelPack.prototype, EventMixin);

export default LevelPack;
