import { EventMixin } from 'dissemination';

import {
  DIRECTION_NONE,
  LEVEL_MAP_ITEM_WORKER,
  LEVEL_MAP_ITEM_WALL,
  LEVEL_MAP_ITEM_GOAL,
  LEVEL_MAP_ITEM_BOX,
  EVENT_LEVEL_MOVE_START,
  EVENT_LEVEL_MOVE_END,
  EVENT_LEVEL_COMPLETED
} from '../../constants';

import {
  getDirectionShift,
  isDirectionValid,
  isDirectionValidHorizontal
} from '../utils/direction';

import {
  isLevelMapWorkerItem,
  isLevelMapWallItem,
  isLevelMapGoalItem,
  isLevelMapBoxItem
} from '../utils/level';

import LevelMap from './LevelMap';

import Worker from './object/Worker';
import Wall from './object/Wall';
import Goal from './object/Goal';
import Box from './object/Box';

class Level {
  _worker = null;
  _walls = [];
  _goals = [];
  _boxes = [];

  _stepsPerMove;

  _direction = DIRECTION_NONE;

  _animating = false;
  _animatedItems = [];

  _boxesOverGoalsCount = null;
  _completedTriggered = false;

  constructor(items, options = {}) {
    if (items instanceof LevelMap) {
      this.map = items;
    }
    else {
      this.map = new LevelMap(items);
    }

    if (!this.map.validate()) {
      throw new Error('Level map is invalid.');
    }

    const { stepsPerMove = 16 } = options;
    this._stepsPerMove = stepsPerMove;
    this.reset();
  }

  reset() {
    for (let row = 0; row < this.map.rowsCount; row++) {
      for (let column = 0; column < this.map.columnsCount; column++) {
        const item = this.map.at(row, column);
        if (isLevelMapWorkerItem(item)) {
          this._worker = new Worker(row, column);
        }
        if (isLevelMapWallItem(item)) {
          this._walls.push(new Wall(row, column));
        }
        if (isLevelMapGoalItem(item)) {
          this._goals.push(new Goal(row, column));
        }
        if (isLevelMapBoxItem(item)) {
          this._boxes.push(new Box(row, column));
        }
      }
    }

    this._direction = DIRECTION_NONE;

    this._animating = false;
    this._animatedItems = [];

    this._boxesOverGoalsCount = null;
    this._completedTriggered = false;
  }

  at(row, column, filter) {
    const items = [];

    if (!filter) {
      filter = [
        LEVEL_MAP_ITEM_WORKER,
        LEVEL_MAP_ITEM_WALL,
        LEVEL_MAP_ITEM_GOAL,
        LEVEL_MAP_ITEM_BOX
      ];
    }

    filter.forEach(type => {
      if (type === LEVEL_MAP_ITEM_WORKER) {
        if (this._worker.row === row && this._worker.column === column) {
          items.push(this._worker);
        }
        return;
      }

      let typedItems;
      switch (type) {
        case LEVEL_MAP_ITEM_WALL: typedItems = this._walls; break;
        case LEVEL_MAP_ITEM_GOAL: typedItems = this._goals; break;
        case LEVEL_MAP_ITEM_BOX: typedItems = this._boxes; break;
        default: throw new TypeError(`Filter type "${type}" is not supported.`);
      }

      const item = typedItems.find(item => item.row === row && item.column === column);
      if (item) {
        items.push(item);
      }
    });

    return items;
  }

  move() {
    const animatedBox = this.getAnimatedBox();

    if (this._animating) {
      if (this.animate()) {
        this._animating = false;

        if (animatedBox !== null) {
          this._boxesOverGoalsCount = null;
        }

        this.fire(EVENT_LEVEL_MOVE_END, {
          boxesCount: this.boxesCount,
          boxesOverGoalsCount: this.getBoxesOverGoalsCount()
        });
      }
      return false;
    }

    if (this.completed) {
      if (!this._completedTriggered) {
        this._completedTriggered = true;
        this.fire(EVENT_LEVEL_COMPLETED);
      }
      return false;
    }

    // Drop goal target flag for recenlty animated box
    if (animatedBox !== null) {
      animatedBox.goalSource = animatedBox.goalTarget;
      animatedBox.goalTarget = false;
    }

    const shift = getDirectionShift(this._direction);
    if (shift.x === 0 && shift.y === 0) {
      this.resetAnimatedItems();
      return false;
    }

    const isCollision = this.detectCollision(shift);
    if (isCollision) {
      this.resetAnimatedItems();
      if (isDirectionValidHorizontal(this._direction)) {
        this._worker.lastHorizontalDirection = this._direction;
      }
      return false;
    }

    this._animating = true;
    this._animatedItems.forEach(item => item.move(this._direction, this.stepSize));

    this.fire(EVENT_LEVEL_MOVE_START, {
      movesCount: this.movesCount,
      pushesCount: this.pushesCount
    });

    if (this.animate()) {
      this._animating = false;
    }

    return true;
  }

  getAnimatedBox() {
    return this._animatedItems.find(item => item instanceof Box) || null;
  }

  outOfBounds(row, column) {
    return row < 0 || row >= this.rows || column < 0 || column >= this.columns;
  }

  detectCollision(shift) {
    const targetRow = this._worker.row + shift.y;
    const targetColumn = this._worker.column + shift.x;
    if (this.outOfBounds(targetRow, targetColumn)) {
      return false;
    }

    const targetItems = this.at(targetRow, targetColumn);
    let targetBox = null;
    let targetGoal = null;
    let isCollision = false;

    for (let i = 0; i < targetItems.length; i++) {
      const targetItem = targetItems[i];
      if (targetItem instanceof Wall) {
        isCollision = true;
        break;
      }

      if (targetItem instanceof Box) {
        targetBox = targetItem;

        const boxTargetRow = targetItem.row + shift.y;
        const boxTargetColumn = targetItem.column + shift.x;
        if (this.outOfBounds(boxTargetRow, boxTargetColumn)) {
          isCollision = true;
          continue;
        }

        const boxTargetItems = this.at(boxTargetRow, boxTargetColumn);
        boxTargetItems.forEach(boxTargetItem => {
          if (boxTargetItem instanceof Wall || boxTargetItem instanceof Box) {
            isCollision = true;
          }
          else {
            targetBox.goalTarget = boxTargetItem instanceof Goal;
          }
        });
      }

      if (targetItem instanceof Goal) {
        targetGoal = targetItem;
      }
    }

    if (!isCollision) {
      this._animatedItems = [this._worker];
      if (targetBox !== null) {
        this._animatedItems.push(targetBox);
        if (targetGoal !== null) {
          targetBox.goalSource = true;
        }
      }
    }

    return isCollision;
  }

  animate() {
    let isAnimated = false;
    this._animatedItems.forEach(item => {
      if (item.animate()) {
        isAnimated = true;
      }
    });
    return isAnimated;
  }

  resetAnimatedItems() {
    this._animatedItems.forEach(item => item.reset());
    this._animatedItems = [];
  }

  get worker() {
    return this._worker;
  }

  get walls() {
    return this._walls;
  }

  get goals() {
    return this._goals;
  }

  get boxes() {
    return this._boxes;
  }

  get direction() {
    return this._direction;
  }

  set direction(direction) {
    if (isDirectionValid(direction)) {
      this._direction = direction;
    }
  }

  get rowsCount() {
    return this.map.rowsCount;
  }

  get columnsCount() {
    return this.map.columnsCount;
  }

  get stepSize() {
    return 1 / this._stepsPerMove;
  }

  getBoxesOverGoalsCount() {
    if (this._boxesOverGoalsCount !== null) {
      return this._boxesOverGoalsCount;
    }
    this._boxesOverGoalsCount = 0;
    this._boxes.forEach(box => {
      const goals = this.at(box.row, box.column, [LEVEL_MAP_ITEM_GOAL]);
      if (goals.length === 1) {
        this._boxesOverGoalsCount++;
      }
    });
    return this._boxesOverGoalsCount;
  }

  get movesCount() {
    return this._worker.movesCount;
  }

  get pushesCount() {
    let count = 0;
    this._boxes.forEach(box => {
      count += box.movesCount;
    });
    return count;
  }

  get completed() {
    return this._boxesOverGoalsCount === this._boxes.length;
  }

  toString() {
    return this.map.toString();
  }
}

Object.assign(Level.prototype, EventMixin);

export default Level;
