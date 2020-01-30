import { LEVEL_MAP_ITEM_SPACE } from '../../constants';

import {
  isLevelMapItemValid,
  isLevelMapWorkerItem,
  isLevelMapGoalItem,
  isLevelMapBoxItem
} from '../utils/level';

export default class LevelMap {
  #items = [];
  #rows = 0;
  #columns = 0;

  constructor(items = []) {
    this.items = items;
  }

  get items() {
    const items = [];
    for (let row = 0; row < this.#rows; row++) {
      const begin = this.linearIndex(row, 0);
      items.push(this.#items.slice(begin, begin + this.#columns).join('').replace(/ +$/, ''));
    }
    return items;
  }

  set items(items) {
    this.#items = [];
    const { rows, columns } = detectLevelMapSize(items);
    this.#rows = rows;
    this.#columns = columns;
    for (let row = 0; row < this.#rows; row++) {
      for (let column = 0; column < this.#columns; column++) {
        this.#items.push(column < items[row].length ? items[row][column] : LEVEL_MAP_ITEM_SPACE);
      }
    }
  }

  get rows() {
    return this.#rows;
  }

  set rows(count) {
    if (count < this.#rows) {
      this.#items.splice(this.linearIndex(count, 0), (this.#rows - count) * this.#columns);
    }
    else if (count > this.#rows) {
      for (let row = count; row < this.#rows; row++) {
        for (let column = 0; column < this.#columns; column++) {
          this.#items.push(LEVEL_MAP_ITEM_SPACE);
        }
      }
    }
    this.#rows = count;
  }

  get columns() {
    return this.#columns;
  }

  set columns(count) {
    if (count < this.#columns) {
      for (let row = 0; row < this.#rows; row++) {
        this.#items.splice((row + 1) * count, this.#columns - count);
      }
    }
    else if (count > this.#columns) {
      for (let row = 0; row < this.#rows; row++) {
        for (let column = this.#columns; column < count; column++) {
          this.#items.splice(row * count + column, 0, LEVEL_MAP_ITEM_SPACE);
        }
      }
    }
    this.#columns = count;
  }

  normalize() {
    let row = 0;
    while (row < this.#items.length) {
      const line = this.#items[row].trim();
      if (line === '') {
        this.#items.splice(row, 1);
      }
      else {
        this.#items[row] = line;
        row++;
      }
    }
    const { rows, columns } = detectLevelMapSize(this.#items);
    this.#rows = rows;
    this.#columns = columns;
  }

  linearIndex(row, column) {
    return row * this.#columns + column;
  }

  insert(row, column, item) {
    if (!isLevelMapItemValid(item)) {
      item = LEVEL_MAP_ITEM_SPACE;
    }
    this.#items[this.linearIndex(row, column)] = item;
  }

  at(row, column) {
    return this.#items[this.linearIndex(row, column)];
  }

  remove(row, column) {
    this.#items[this.linearIndex(row, column)] = ' ';
  }

  validate() {
    let workersCount = 0;
    let goalsCount = 0;
    let boxesCount = 0;
    this.#items.forEach(function(item) {
      if (isLevelMapWorkerItem(item)) {
        workersCount++;
      }
      if (isLevelMapGoalItem(item)) {
        goalsCount++;
      }
      if (isLevelMapBoxItem(item)) {
        boxesCount++;
      }
    });
    return workersCount === 1 && goalsCount > 0 && goalsCount === boxesCount;
  }

  toString() {
    return this.#items.join('\n');
  }
}

function detectLevelMapSize(items) {
  return {
    rows: items.length,
    columns: items.length === 0 ? 0 : Math.max.apply(null, items.map(row => row.length))
  };
}
