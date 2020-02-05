import {
  DIRECTION_NONE
} from '../../constants/direction';

import {
  EVENT_LEVEL_RESET,
  EVENT_LEVEL_COMPLETED,
  EVENT_MOVE_START,
  EVENT_MOVE_END
} from '../../constants/event';

import {
  LEVEL_MAP_ITEM_WORKER,
  LEVEL_MAP_ITEM_WALL,
  LEVEL_MAP_ITEM_GOAL,
  LEVEL_MAP_ITEM_BOX
} from '../../constants/level';

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

  _retractedBoxesCountCached = null;

  _stepsPerMove;

  _direction = DIRECTION_NONE;

  _animating = false;
  _animatedBox = null;

  _completed = false;

  _eventBus = null;

  constructor(items, options = {}) {
    const { eventBus = null } = options;
    this._eventBus = eventBus;

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
    this.reset(false);
  }

  reset(fireEvent = true) {
    this._worker = null;
    this._walls = [];
    this._goals = [];
    this._boxes = [];

    this._retractedBoxesCountCached = null;

    for (let row = 0; row < this.map.rows; row++) {
      for (let column = 0; column < this.map.columns; column++) {
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

    this._completed = false;

    if (fireEvent && this._eventBus) {
      const { movesCount, pushesCount, boxesCount, retractedBoxesCount } = this;
      this._eventBus.fire(EVENT_LEVEL_RESET, { movesCount, pushesCount, boxesCount, retractedBoxesCount });
    }
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
    if (this._animating) {
      if (!this.animate()) {
        // Items are animated but the animation is not over yet
        return false;
      }

      // Current animation is over
      this._animating = false;

      // If box was moved (animated) then we have to clear cached value
      // of retracted boxes' count in order to recalculate it for upcoming move end event
      if (this._animatedBox) {
        this._retractedBoxesCountCached = null;
      }

      if (this._eventBus) {
        const { boxesCount, retractedBoxesCount } = this;
        this._eventBus.fire(EVENT_MOVE_END, { boxesCount, retractedBoxesCount });
      }

      return false;
    }

    if (this._completed || this.completed) {
      if (!this._completed) {
        if (this._eventBus) {
          this._eventBus.fire(EVENT_LEVEL_COMPLETED);
        }
        this._completed = true;
      }
      return false;
    }

    // Drop goal target flag for recenlty animated box
    if (this._animatedBox) {
      this._animatedBox.goalSource = this._animatedBox.goalTarget;
      this._animatedBox.goalTarget = false;
    }

    const shift = getDirectionShift(this._direction);
    if (shift.x === 0 && shift.y === 0) {
      this.resetAnimatedItems();
      return false;
    }

    const collided = this.detectCollision(shift);
    if (collided) {
      this.resetAnimatedItems();
      if (isDirectionValidHorizontal(this._direction)) {
        this._worker.lastHorizontalDirection = this._direction;
      }
      return false;
    }

    this._animating = true;
    this._worker.move(this._direction, this.stepSize);
    if (this._animatedBox) {
      this._animatedBox.move(this._direction, this.stepSize);
    }

    if (this._eventBus) {
      const { movesCount, pushesCount } = this;
      this._eventBus.fire(EVENT_MOVE_START, { movesCount, pushesCount });
    }

    if (this.animate()) {
      this._animating = false;
    }

    return true;
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
    let collided = false;

    for (let i = 0; i < targetItems.length; i++) {
      const targetItem = targetItems[i];
      if (targetItem instanceof Wall) {
        collided = true;
        break;
      }

      if (targetItem instanceof Box) {
        targetBox = targetItem;

        const boxTargetRow = targetItem.row + shift.y;
        const boxTargetColumn = targetItem.column + shift.x;
        if (this.outOfBounds(boxTargetRow, boxTargetColumn)) {
          collided = true;
          continue;
        }

        const boxTargetItems = this.at(boxTargetRow, boxTargetColumn);
        boxTargetItems.forEach(boxTargetItem => {
          if (boxTargetItem instanceof Wall || boxTargetItem instanceof Box) {
            collided = true;
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

    if (!collided) {
      if (targetBox) {
        this._animatedBox = targetBox;
        if (targetGoal) {
          targetBox.goalSource = true;
        }
      }
      else {
        this._animatedBox = false;
      }
    }

    return collided;
  }

  animate() {
    const workerAnimated = this._worker.animate();
    const boxAnimated = this._animatedBox && this._animatedBox.animate();
    return workerAnimated || boxAnimated;
  }

  resetAnimatedItems() {
    this._worker.reset();
    if (this._animatedBox) {
      this._animatedBox.reset();
    }
    this._animating = false;
  }

  get rows() {
    return this.map.rows;
  }

  get columns() {
    return this.map.columns;
  }

  get stepSize() {
    return 1 / this._stepsPerMove;
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

  get movesCount() {
    if (!this.worker) {
      return 0;
    }
    const { movesCount } = this.worker;
    return movesCount;
  }

  get pushesCount() {
    let count = 0;
    this._boxes.forEach(box => {
      count += box.movesCount;
    });
    return count;
  }

  get boxesCount() {
    return this._boxes.length;
  }

  get retractedBoxesCount() {
    if (typeof this._retractedBoxesCountCached === 'number') {
      return this._retractedBoxesCountCached;
    }

    let retractedBoxesCount = 0;
    this._boxes.forEach(box => {
      const goals = this.at(box.row, box.column, [LEVEL_MAP_ITEM_GOAL]);
      if (goals.length === 1) {
        retractedBoxesCount++;
      }
    });

    this._retractedBoxesCountCached = retractedBoxesCount;
    return retractedBoxesCount;
  }

  get completed() {
    return this.boxesCount > 0 && this.retractedBoxesCount === this.boxesCount;
  }

  get direction() {
    return this._direction;
  }

  set direction(direction) {
    if (isDirectionValid(direction)) {
      this._direction = direction;
    }
  }

  toString() {
    return this.map.toString();
  }
}

export default Level;
