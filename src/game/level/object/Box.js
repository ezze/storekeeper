import Movable from './Movable';

export default class Box extends Movable {
  #goalSource = false;
  #goalTarget = false;

  get goalSource() {
    return this.#goalSource;
  }

  set goalSource(goalSource) {
    this.#goalSource = goalSource;
  }

  get goalTarget() {
    return this.#goalTarget;
  }

  set goalTarget(goalTarget) {
    this.#goalTarget = goalTarget;
  }
}
