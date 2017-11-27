import Direction from '../Direction';
import Item from './Item';

export default class Movable extends Item {
    constructor(row, column) {
        super(row, column);

        this._targetRow = row;
        this._targetColumn = column;
        this._stepSize = 0;

        this._lastHorizontalDirection = Direction.LEFT;
        this._lastVerticalDirection = Direction.DOWN;

        this._consecutiveStepsCount = 0;
        this._movesCount = 0;
    }

    move(direction, stepSize) {
        let shift = Direction.getShift(direction);

        this._targetRow = this.row + shift.y;
        this._targetColumn = this.column + shift.x;

        this.stepSize = stepSize;

        if (Direction.isValidHorizontal(direction)) {
            this._lastHorizontalDirection = direction;
        }
        else if (Direction.isValidVertical(direction)) {
            this._lastVerticalDirection = direction;
        }

        this._movesCount++;
    }

    animate() {
        let stepX = Math.sign(this._targetColumn - this.column) * this.stepSize,
            stepY = Math.sign(this._targetRow - this.row) * this.stepSize;

        this.column = this.column + stepX;
        this.row = this.row + stepY;

        this._consecutiveStepsCount += 1;

        return this.row === this._targetRow && this.column === this._targetColumn;
    }

    reset() {
        this._consecutiveStepsCount = 0;
    }

    get stepSize() {
        return this._stepSize;
    }

    set stepSize(stepSize) {
        this._stepSize = stepSize;
    }

    get lastHorizontalDirection() {
        return this._lastHorizontalDirection;
    }

    set lastHorizontalDirection(direction) {
        this._lastHorizontalDirection = direction;
    }

    get lastVerticalDirection() {
        return this._lastVerticalDirection;
    }

    set lastVerticalDirection(direction) {
        this._lastVerticalDirection = direction;
    }

    get consecutiveStepsCount() {
        return this._consecutiveStepsCount;
    }

    get movesCount() {
        return this._movesCount;
    }
}