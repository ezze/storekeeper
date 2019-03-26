import { LEVEL_MAP_ITEM_SPACE } from '../../constants';

import {
  isLevelMapItemValid,
  isLevelMapWorkerItem,
  isLevelMapGoalItem,
  isLevelMapBoxItem
} from '../utils/level';

export default class LevelMap {
  items = [];
  rowsCount = 0;
  columnsCount = 0;

  constructor(items) {
    this.setItems(items);
  }

  getItems() {
    const items = [];
    for (let row = 0; row < this.rowsCount; row++) {
      const begin = this.linearIndex(row, 0);
      items.push(this.items.slice(begin, begin + this.columnsCount).join('').replace(/ +$/, ''));
    }
    return items;
  }

  setItems(items = []) {
    this.items = [];
    const { rowsCount, columnsCount } = detectLevelMapSize(items);
    this.rowsCount = rowsCount;
    this.columnsCount = columnsCount;
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        this.items.push(column < items[row].length ? items[row][column] : LEVEL_MAP_ITEM_SPACE);
      }
    }
  }

  getRowsCount() {
    return this.rowsCount;
  }

  setRowsCount(count) {
    if (count < this.rowsCount) {
      this.items.splice(this.linearIndex(count, 0), (this.rowsCount - count) * this.columnsCount);
    }
    else if (count > this.rowsCount) {
      for (let row = count; row < this.rowsCount; row++) {
        for (let column = 0; column < this.columnsCount; column++) {
          this.items.push(LEVEL_MAP_ITEM_SPACE);
        }
      }
    }
    this.rowsCount = count;
  }

  getColumnsCount() {
    return this.columnsCount;
  }

  setColumnsCount(count) {
    if (count < this.columnsCount) {
      for (let row = 0; row < this.rowsCount; row++) {
        this.items.splice((row + 1) * count, this.columnsCount - count);
      }
    }
    else if (count > this.columnsCount) {
      for (let row = 0; row < this.rowsCount; row++) {
        for (let column = this.columnsCount; column < count; column++) {
          this.items.splice(row * count + column, 0, LEVEL_MAP_ITEM_SPACE);
        }
      }
    }
    this.columnsCount = count;
  }

  normalize() {
    let row = 0;
    while (row < this.items.length) {
      const line = this.items[row].trim();
      if (line === '') {
        this.items.splice(row, 1);
      }
      else {
        this.items[row] = line;
        row++;
      }
    }
    const { rowsCount, columnsCount } = detectLevelMapSize(this.items);
    this.rowsCount = rowsCount;
    this.columnsCount = columnsCount;
  }

  linearIndex(row, column) {
    return row * this.columnsCount + column;
  }

  insert(row, column, item) {
    if (!isLevelMapItemValid(item)) {
      item = LEVEL_MAP_ITEM_SPACE;
    }
    this.items[this.linearIndex(row, column)] = item;
  }

  at(row, column) {
    return this.items[this.linearIndex(row, column)];
  }

  remove(row, column) {
    this.items[this.linearIndex(row, column)] = ' ';
  }

  validate() {
    let workersCount = 0;
    let goalsCount = 0;
    let boxesCount = 0;
    this.items.forEach(function(item) {
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
    return this.items.join('\n');
  }
}

function detectLevelMapSize(items) {
  return {
    rowsCount: items.length,
    columnsCount: items.length === 0 ? 0 : Math.max.apply(null, items.map(row => row.length))
  };
}
