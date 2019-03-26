import Movable from './Movable';

export default class Box extends Movable {
  constructor(row, column) {
    super(row, column);
    this.goalSource = false;
    this.goalTarget = false;
  }
}
