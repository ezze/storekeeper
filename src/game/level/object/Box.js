import Movable from './Movable';

export default class Box extends Movable {
  // Goal source indicates whether the box starts the move from a goal
  // (used for animation only)
  goalSource = false;

  // Goal target indicates whether the box will be retracted to a goal
  // at the end of the move (used for animation only)
  goalTarget = false;
}
