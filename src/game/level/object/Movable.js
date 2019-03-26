import { DIRECTION_LEFT, DIRECTION_DOWN } from '../../../constants';

import {
  isDirectionValidHorizontal,
  isDirectionValidVertical,
  getDirectionShift
} from '../../utils/direction';

import Item from './Item';

export default class Movable extends Item {
  _targetRow = null;
  _targetColumn = null;

  _stepSize = 0;

  _lastHorizontalDirection = DIRECTION_LEFT;
  _lastVerticalDirection = DIRECTION_DOWN;

  _consecutiveStepsCount = 0;
  _movesCount = 0;

  constructor(row, column) {
    super(row, column);
    this._targetRow = row;
    this._targetColumn = column;
  }

  get lastHorizontalDirection() {
    return this._lastHorizontalDirection;
  }

  get lastVerticalDirection() {
    return this._lastVerticalDirection;
  }

  get consecutiveStepsCount() {
    return this._consecutiveStepsCount;
  }

  move(direction, stepSize) {
    const shift = getDirectionShift(direction);

    this._targetRow = this.row + shift.y;
    this._targetColumn = this.column + shift.x;

    this._stepSize = stepSize;

    if (isDirectionValidHorizontal(direction)) {
      this._lastHorizontalDirection = direction;
    }
    else if (isDirectionValidVertical(direction)) {
      this._lastVerticalDirection = direction;
    }

    this._movesCount++;
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
