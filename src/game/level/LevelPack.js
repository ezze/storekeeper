import { EventMixin } from 'dissemination';

import { EVENT_LEVEL_CHANGE } from '../../constants';

import Level from './Level';

class LevelPack {
  #levels = [];
  #index = -1;

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

  get levelNumber() {
    return this.#index + 1;
  }

  get level() {
    return this.#index >= 0 ? this.getLevel(this.#index) : null;
  }

  getLevel(index) {
    if (index < 0 || index >= this.#levels.length) {
      throw new RangeError('Level index is out of bounds.');
    }
    return this.#levels[index];
  }

  setLevel(index) {
    if (this.level !== null) {
      this.removeLevelListeners(this.level);
    }

    if (index < 0 || index >= this.#levels.length) {
      throw new RangeError('Level index is out of bounds.');
    }

    this.#index = index;
    this.addLevelListeners(index);
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
    this.#levels.push(level);
    if (this.#index === -1 && this.#levels.length === 1) {
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
    let index = this.#index - 1;
    if (index < 0) {
      index = this.#levels.length - 1;
    }
    this.setLevel(index);
    this.fire(EVENT_LEVEL_CHANGE, this.levelNumber);
  }

  goToNext() {
    if (this.level === null) {
      return;
    }
    let index = this.#index + 1;
    if (index >= this.#levels.length) {
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
    this.#levels.forEach((level, index) => {
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
