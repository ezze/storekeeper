import { LEVEL_MAP_ITEM_SPACE } from '../../constants/level';

import {
  isLevelMapItemValid,
  isLevelMapWorkerItem,
  isLevelMapGoalItem,
  isLevelMapBoxItem
} from '../utils/level';

export default class LevelMap {
  _items = [];
  _rows = 0;
  _columns = 0;

  constructor(items = []) {
    this.items = items;
  }

  get items() {
    const items = [];
    for (let row = 0; row < this._rows; row++) {
      const begin = this.linearIndex(row, 0);
      items.push(this._items.slice(begin, begin + this._columns).join('').replace(/ +$/, ''));
    }
    return items;
  }

  set items(items) {
    this._items = [];
    const { rows, columns } = detectLevelMapSize(items);
    this._rows = rows;
    this._columns = columns;
    for (let row = 0; row < this._rows; row++) {
      for (let column = 0; column < this._columns; column++) {
        this._items.push(column < items[row].length ? items[row][column] : LEVEL_MAP_ITEM_SPACE);
      }
    }
  }

  get rows() {
    return this._rows;
  }

  set rows(count) {
    if (count < this._rows) {
      this._items.splice(this.linearIndex(count, 0), (this._rows - count) * this._columns);
    }
    else if (count > this._rows) {
      for (let row = count; row < this._rows; row++) {
        for (let column = 0; column < this._columns; column++) {
          this._items.push(LEVEL_MAP_ITEM_SPACE);
        }
      }
    }
    this._rows = count;
  }

  get columns() {
    return this._columns;
  }

  set columns(count) {
    if (count < this._columns) {
      for (let row = 0; row < this._rows; row++) {
        this._items.splice((row + 1) * count, this._columns - count);
      }
    }
    else if (count > this._columns) {
      for (let row = 0; row < this._rows; row++) {
        for (let column = this._columns; column < count; column++) {
          this._items.splice(row * count + column, 0, LEVEL_MAP_ITEM_SPACE);
        }
      }
    }
    this._columns = count;
  }

  normalize() {
    let row = 0;
    while (row < this._items.length) {
      const line = this._items[row].trim();
      if (line === '') {
        this._items.splice(row, 1);
      }
      else {
        this._items[row] = line;
        row++;
      }
    }
    const { rows, columns } = detectLevelMapSize(this._items);
    this._rows = rows;
    this._columns = columns;
  }

  linearIndex(row, column) {
    return row * this._columns + column;
  }

  insert(row, column, item) {
    if (!isLevelMapItemValid(item)) {
      item = LEVEL_MAP_ITEM_SPACE;
    }
    this._items[this.linearIndex(row, column)] = item;
  }

  at(row, column) {
    return this._items[this.linearIndex(row, column)];
  }

  remove(row, column) {
    this._items[this.linearIndex(row, column)] = ' ';
  }

  validate() {
    let workersCount = 0;
    let goalsCount = 0;
    let boxesCount = 0;
    this._items.forEach(function(item) {
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
    return this._items.join('\n');
  }
}

function detectLevelMapSize(items) {
  return {
    rows: items.length,
    columns: items.length === 0 ? 0 : Math.max.apply(null, items.map(row => row.length))
  };
}
