import { DIRECTION_LEFT, DIRECTION_DOWN } from '../../../constants';

import {
  isDirectionValidHorizontal,
  isDirectionValidVertical,
  getDirectionShift
} from '../../utils/direction';

import Item from './Item';

export default class Movable extends Item {
  #targetRow = null;
  #targetColumn = null;

  #stepSize = 0;

  #lastHorizontalDirection = DIRECTION_LEFT;
  #lastVerticalDirection = DIRECTION_DOWN;

  #consecutiveStepsCount = 0;
  #movesCount = 0;

  constructor(row, column) {
    super(row, column);
    this.#targetRow = row;
    this.#targetColumn = column;
  }

  get lastHorizontalDirection() {
    return this.#lastHorizontalDirection;
  }

  set lastHorizontalDirection(direction) {
    this.#lastHorizontalDirection = direction;
  }

  get lastVerticalDirection() {
    return this.#lastVerticalDirection;
  }

  set lastVerticalDirection(direction) {
    this.#lastVerticalDirection = direction;
  }

  get consecutiveStepsCount() {
    return this.#consecutiveStepsCount;
  }

  get movesCount() {
    return this.#movesCount;
  }

  move(direction, stepSize) {
    const shift = getDirectionShift(direction);

    this.#targetRow = this.row + shift.y;
    this.#targetColumn = this.column + shift.x;
    this.#stepSize = stepSize;

    if (isDirectionValidHorizontal(direction)) {
      this.#lastHorizontalDirection = direction;
    }
    else if (isDirectionValidVertical(direction)) {
      this.#lastVerticalDirection = direction;
    }

    this.#movesCount++;
  }

  animate() {
    const stepX = Math.sign(this.#targetColumn - this.column) * this.#stepSize;
    const stepY = Math.sign(this.#targetRow - this.row) * this.#stepSize;

    this.column = this.column + stepX;
    this.row = this.row + stepY;

    this.#consecutiveStepsCount += 1;

    return this.row === this.#targetRow && this.column === this.#targetColumn;
  }

  reset() {
    this.#consecutiveStepsCount = 0;
  }
}
