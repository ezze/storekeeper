import Movable from './Movable';

export default class Box extends Movable {
    constructor(row, column) {
        super(row, column);
        this.goalSource = false;
        this.goalTarget = false;
    }

    get goalSource() {
        return this._goalSource;
    }

    set goalSource(goalSource) {
        this._goalSource = goalSource;
    }

    get goalTarget() {
        return this._goalTarget;
    }

    set goalTarget(goalTarget) {
        this._goalTarget = goalTarget;
    }
}