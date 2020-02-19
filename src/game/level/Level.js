import {
  DIRECTION_LEFT,
  DIRECTION_NONE
} from '../../constants/direction';

import {
  EVENT_LEVEL_RESET,
  EVENT_LEVEL_COMPLETED,
  EVENT_MOVE_START,
  EVENT_MOVE_END,
  EVENT_MOVE_UNDO
} from '../../constants/event';

import {
  LEVEL_MAP_ITEM_WORKER,
  LEVEL_MAP_ITEM_WALL,
  LEVEL_MAP_ITEM_GOAL,
  LEVEL_MAP_ITEM_BOX
} from '../../constants/level';

import {
  isDirectionValid,
  isDirectionValidHorizontal,
  getDirectionShift
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

  _history = [];
  _direction = DIRECTION_NONE;
  _retractedBoxesCountCached = null;
  _stepsPerMove;
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

    this._history = [];
    this._direction = DIRECTION_NONE;
    this._retractedBoxesCountCached = null;
    this._animating = false;
    this._completed = false;

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

    if (fireEvent && this._eventBus) {
      const { movesCount, pushesCount, boxesCount, retractedBoxesCount } = this;
      this._eventBus.fire(EVENT_LEVEL_RESET, { movesCount, pushesCount, boxesCount, retractedBoxesCount });
    }
  }

  getAt(row, column, type) {
    if (type === LEVEL_MAP_ITEM_WORKER) {
      return this._worker.row === row && this._worker.column === column ? this._worker : null;
    }
    const typedItems = this.getTypedItems(type);
    return typedItems.find(item => item.row === row && item.column === column) || null;
  }

  hasAt(row, column, type) {
    return !!this.getAt(row, column, type);
  }

  getTypedItems(type) {
    switch (type) {
      case LEVEL_MAP_ITEM_WALL: return this._walls;
      case LEVEL_MAP_ITEM_GOAL: return this._goals;
      case LEVEL_MAP_ITEM_BOX: return this._boxes;
      default: throw new TypeError(`Filter type "${type}" is not supported.`);
    }
  }

  move() {
    if (!this._animating) {
      // Checking whether level is completed (don't allow to move if it's true)
      if (this._completed || this.completed) {
        if (!this._completed) {
          this._completed = true;
          if (this._eventBus) {
            this._eventBus.fire(EVENT_LEVEL_COMPLETED);
          }
        }
        return;
      }

      // If a direction is set then it's a moment to start a new move
      const shift = getDirectionShift(this._direction);
      if (shift.x === 0 && shift.y === 0) {
        this.resetAnimatedItems();
        return;
      }

      // Checking whether the worker and a box being pushed are not collided and the move is possible
      const { collided, box, boxGoalSource, boxGoalTarget } = this.analyzeMove(shift);
      if (collided) {
        this.resetAnimatedItems();
        if (isDirectionValidHorizontal(this._direction)) {
          this._worker.lastHorizontalDirection = this._direction;
        }
        return;
      }

      this._animating = true;

      if (box) {
        // The worker starts to push the box so we have to remember it for move animation
        box.goalSource = boxGoalSource;
        box.goalTarget = boxGoalTarget;
        this._animatedBox = box;
      }

      // Letting the worker and the box to know where and how fast to go
      this._worker.move(this._direction, this.stepSize);
      if (this._animatedBox) {
        this._animatedBox.move(this._direction, this.stepSize);
      }

      // Adding a move to history
      this._history.push({
        direction: this._direction,
        box: this._animatedBox ? this._animatedBox : null
      });

      if (this._eventBus) {
        // Signaling that the move has been started
        const { movesCount, pushesCount } = this;
        this._eventBus.fire(EVENT_MOVE_START, { movesCount, pushesCount });
      }
    }

    // Frame animation of the move happens here
    const animationFinished = this.animate();
    if (!animationFinished) {
      return;
    }

    // Move animation is finished, cleaning up the things
    this._animating = false;

    if (this._animatedBox) {
      // If the box has been moved (animated) then we have to clear cached value
      // of retracted boxes' count in order to recalculate it for upcoming move end event
      this._retractedBoxesCountCached = null;
      this._animatedBox.goalSource = false;
      this._animatedBox.goalTarget = false;
      this._animatedBox = null;
    }

    if (this._eventBus) {
      // Signaling that the move has been ended
      const { boxesCount, retractedBoxesCount } = this;
      this._eventBus.fire(EVENT_MOVE_END, { boxesCount, retractedBoxesCount });
    }
  }

  analyzeMove(shift) {
    const targetRow = this._worker.row + shift.y;
    const targetColumn = this._worker.column + shift.x;

    if (this.outOfBounds(targetRow, targetColumn) || this.hasAt(targetRow, targetColumn, LEVEL_MAP_ITEM_WALL)) {
      // Worker is out of level bounds or has been collided with a wall
      return { collided: true };
    }

    const box = this.getAt(targetRow, targetColumn, LEVEL_MAP_ITEM_BOX);
    if (box) {
      const boxTargetRow = box.row + shift.y;
      const boxTargetColumn = box.column + shift.x;

      if (
        this.outOfBounds(boxTargetRow, boxTargetColumn) ||
        this.hasAt(boxTargetRow, boxTargetColumn, LEVEL_MAP_ITEM_WALL) ||
        this.hasAt(boxTargetRow, boxTargetColumn, LEVEL_MAP_ITEM_BOX)
      ) {
        // Box is out of level bounds or has been collided with a wall or another box
        return { collided: true };
      }

      const boxGoalSource = this.hasAt(targetRow, targetColumn, LEVEL_MAP_ITEM_GOAL);
      const boxGoalTarget = this.hasAt(boxTargetRow, boxTargetColumn, LEVEL_MAP_ITEM_GOAL);
      return { collided: false, box, boxGoalSource, boxGoalTarget };
    }

    return { collided: false };
  }

  undoMove(count = 1) {
    if (this._animating) {
      return;
    }

    let leftCount = count;
    while (leftCount > 0 && this._history.length > 0) {
      const previousMove = this._history.pop();
      const { direction, box } = previousMove;

      let lastHorizontalDirection = DIRECTION_LEFT;
      for (let i = this._history.length - 1; i >= 0; i--) {
        const { direction } = this._history[i];
        if (isDirectionValidHorizontal(direction)) {
          lastHorizontalDirection = direction;
          break;
        }
      }

      if (box) {
        box.undoMove(direction);
      }
      this._worker.undoMove(direction, lastHorizontalDirection);

      leftCount--;
    }

    this._retractedBoxesCountCached = null;
    if (this._eventBus) {
      const { movesCount, pushesCount, boxesCount, retractedBoxesCount } = this;
      this._eventBus.fire(EVENT_MOVE_UNDO, { movesCount, pushesCount, boxesCount, retractedBoxesCount });
    }
  }

  outOfBounds(row, column) {
    return row < 0 || row >= this.rows || column < 0 || column >= this.columns;
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
      if (this._goals.find(goal => goal.row === box.row && goal.column === box.column)) {
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
