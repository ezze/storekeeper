import Direction from '../direction';
import Item from './item';

export default class Movable extends Item {
    constructor(row, column) {
        super(row, column);

        this._targetRow = row;
        this._targetColumn = column;
        this._stepSize = 0;

        this._lastHorizontalMoveDirection = Direction.LEFT;
        this._lastVerticalMoveDirection = Direction.DOWN;

        this._consecutiveStepsCount = 0;
    }

    moveLeft(stepSize) {
        this._targetColumn = this.column - 1;
        this.stepSize = stepSize;
    }

    moveRight(stepSize) {
        this._targetColumn = this.column + 1;
        this.stepSize = stepSize;
    }

    moveUp(stepSize) {
        this._targetRow = this.row - 1;
        this.stepSize = stepSize;
    }

    moveDown(stepSize) {
        this._targetRow = this.row + 1;
        this.stepSize = stepSize;
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

    get consecutiveStepsCount() {
        return this._consecutiveStepsCount;
    }
}