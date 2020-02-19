import { DIRECTION_LEFT, DIRECTION_DOWN } from '../../../constants/direction';

import {
  isDirectionValidHorizontal,
  isDirectionValidVertical,
  getOppositeDirection,
  getDirectionShift
} from '../../utils/direction';

import Item from './Item';

export default class Movable extends Item {
  _targetRow = null;
  _targetColumn = null;

  _stepSize = 0;
  _consecutiveStepsCount = 0;
  _movesCount = 0;

  lastHorizontalDirection = DIRECTION_LEFT;
  lastVerticalDirection = DIRECTION_DOWN;

  constructor(row, column) {
    super(row, column);
    this._targetRow = row;
    this._targetColumn = column;
  }

  get consecutiveStepsCount() {
    return this._consecutiveStepsCount;
  }

  get movesCount() {
    return this._movesCount;
  }

  move(direction, stepSize) {
    const shift = getDirectionShift(direction);

    this._targetRow = this.row + shift.y;
    this._targetColumn = this.column + shift.x;
    this._stepSize = stepSize;

    if (isDirectionValidHorizontal(direction)) {
      this.lastHorizontalDirection = direction;
    }
    else if (isDirectionValidVertical(direction)) {
      this.lastVerticalDirection = direction;
    }

    this._movesCount++;
  }

  undoMove(direction, lastHorizontalDirection, lastVerticalDirection) {
    if (this._movesCount === 0) {
      return;
    }

    const oppositeDirection = getOppositeDirection(direction);
    const shift = getDirectionShift(oppositeDirection);

    this.row = this.row + shift.y;
    this.column = this.column + shift.x;

    if (isDirectionValidHorizontal(lastHorizontalDirection)) {
      this.lastHorizontalDirection = lastHorizontalDirection;
    }
    else if (isDirectionValidVertical(lastVerticalDirection)) {
      this.lastVerticalDirection = lastVerticalDirection;
    }

    this._movesCount--;
    this._consecutiveStepsCount = 0;
  }

  animate() {
    const stepX = Math.sign(this._targetColumn - this.column) * this._stepSize;
    const stepY = Math.sign(this._targetRow - this.row) * this._stepSize;

    this.column = this.column + stepX;
    this.row = this.row + stepY;

    this._consecutiveStepsCount += 1;

    return this.row === this._targetRow && this.column === this._targetColumn;
  }

  reset() {
    this._consecutiveStepsCount = 0;
  }
}
