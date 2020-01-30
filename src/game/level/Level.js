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
  #worker = null;
  #walls = [];
  #goals = [];
  #boxes = [];

  #stepsPerMove;

  #direction = DIRECTION_NONE;

  #animating = false;
  #animatedItems = [];

  #boxesOverGoalsCount;
  #completedTriggered = false;

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
    this.#stepsPerMove = stepsPerMove;
    this.reset();
  }

  reset() {
    for (let row = 0; row < this.map.rows; row++) {
      for (let column = 0; column < this.map.columns; column++) {
        const item = this.map.at(row, column);
        if (isLevelMapWorkerItem(item)) {
          this.#worker = new Worker(row, column);
        }
        if (isLevelMapWallItem(item)) {
          this.#walls.push(new Wall(row, column));
        }
        if (isLevelMapGoalItem(item)) {
          this.#goals.push(new Goal(row, column));
        }
        if (isLevelMapBoxItem(item)) {
          this.#boxes.push(new Box(row, column));
        }
      }
    }

    this.#direction = DIRECTION_NONE;

    this.#animating = false;
    this.#animatedItems = [];

    this.#boxesOverGoalsCount = undefined;
    this.#completedTriggered = false;
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
        if (this.#worker.row === row && this.#worker.column === column) {
          items.push(this.#worker);
        }
        return;
      }

      let typedItems;
      switch (type) {
        case LEVEL_MAP_ITEM_WALL: typedItems = this.#walls; break;
        case LEVEL_MAP_ITEM_GOAL: typedItems = this.#goals; break;
        case LEVEL_MAP_ITEM_BOX: typedItems = this.#boxes; break;
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

    if (this.#animating) {
      if (this.animate()) {
        this.#animating = false;

        if (animatedBox !== null) {
          this.#boxesOverGoalsCount = undefined;
        }

        this.fire(EVENT_LEVEL_MOVE_END, {
          boxesCount: this.boxesCount,
          boxesOverGoalsCount: this.boxesOverGoalsCount
        });
      }
      return false;
    }

    if (this.completed) {
      if (!this.#completedTriggered) {
        this.#completedTriggered = true;
        this.fire(EVENT_LEVEL_COMPLETED);
      }
      return false;
    }

    // Drop goal target flag for recenlty animated box
    if (animatedBox !== null) {
      animatedBox.goalSource = animatedBox.goalTarget;
      animatedBox.goalTarget = false;
    }

    const shift = getDirectionShift(this.#direction);
    if (shift.x === 0 && shift.y === 0) {
      this.resetAnimatedItems();
      return false;
    }

    const isCollision = this.detectCollision(shift);
    if (isCollision) {
      this.resetAnimatedItems();
      if (isDirectionValidHorizontal(this.#direction)) {
        this.#worker.lastHorizontalDirection = this.#direction;
      }
      return false;
    }

    this.#animating = true;
    this.#animatedItems.forEach(item => item.move(this.#direction, this.stepSize));

    this.fire(EVENT_LEVEL_MOVE_START, {
      movesCount: this.movesCount,
      pushesCount: this.pushesCount
    });

    if (this.animate()) {
      this.#animating = false;
    }

    return true;
  }

  getAnimatedBox() {
    return this.#animatedItems.find(item => item instanceof Box) || null;
  }

  outOfBounds(row, column) {
    return row < 0 || row >= this.rows || column < 0 || column >= this.columns;
  }

  detectCollision(shift) {
    const targetRow = this.#worker.row + shift.y;
    const targetColumn = this.#worker.column + shift.x;
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
      this.#animatedItems = [this.#worker];
      if (targetBox !== null) {
        this.#animatedItems.push(targetBox);
        if (targetGoal !== null) {
          targetBox.goalSource = true;
        }
      }
    }

    return isCollision;
  }

  animate() {
    let isAnimated = false;
    this.#animatedItems.forEach(item => {
      if (item.animate()) {
        isAnimated = true;
      }
    });
    return isAnimated;
  }

  resetAnimatedItems() {
    this.#animatedItems.forEach(item => item.reset());
    this.#animatedItems = [];
  }

  get worker() {
    return this.#worker;
  }

  get walls() {
    return this.#walls;
  }

  get goals() {
    return this.#goals;
  }

  get boxes() {
    return this.#boxes;
  }

  get direction() {
    return this.#direction;
  }

  set direction(direction) {
    if (isDirectionValid(direction)) {
      this.#direction = direction;
    }
  }

  get rows() {
    return this.map.rows;
  }

  get columns() {
    return this.map.columns;
  }

  get stepSize() {
    return 1 / this.#stepsPerMove;
  }

  get boxesCount() {
    return this.#boxes.length;
  }

  get boxesOverGoalsCount() {
    if (typeof this.#boxesOverGoalsCount === 'number') {
      return this.#boxesOverGoalsCount;
    }
    this.#boxesOverGoalsCount = 0;
    this.#boxes.forEach(box => {
      const goals = this.at(box.row, box.column, [LEVEL_MAP_ITEM_GOAL]);
      if (goals.length === 1) {
        this.#boxesOverGoalsCount++;
      }
    });
    return this.#boxesOverGoalsCount;
  }

  get movesCount() {
    return this.#worker.movesCount;
  }

  get pushesCount() {
    let count = 0;
    this.#boxes.forEach(box => {
      count += box.movesCount;
    });
    return count;
  }

  get completed() {
    return this.boxesOverGoalsCount === this.boxesCount;
  }

  toString() {
    return this.map.toString();
  }
}

Object.assign(Level.prototype, EventMixin);

export default Level;
