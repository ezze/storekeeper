import {
  DIRECTION_NONE,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  DIRECTION_DOWN
} from '../../constants';

import {
  directions,
  directionsHorizontal,
  directionsVertical
} from '../../constants';

export function isDirectionValid(direction) {
  return directions.includes(direction);
}

export function isDirectionValidHorizontal(direction) {
  return directionsHorizontal.includes(direction);
}

export function isDirectionValidVertical(direction) {
  return directionsVertical.includes(direction);
}

export function getOppositeDirection(direction) {
  switch (direction) {
    case DIRECTION_LEFT: return DIRECTION_RIGHT;
    case DIRECTION_RIGHT: return DIRECTION_LEFT;
    case DIRECTION_UP: return DIRECTION_DOWN;
    case DIRECTION_DOWN: return DIRECTION_UP;
    default: return DIRECTION_NONE;
  }
}

export function getDirectionShift(direction) {
  switch (direction) {
    case DIRECTION_LEFT: return { x: -1, y: 0 };
    case DIRECTION_RIGHT: return { x: 1, y: 0 };
    case DIRECTION_UP: return { x: 0, y: -1 };
    case DIRECTION_DOWN: return { x: 0, y: 1 };
    default: return { x: 0, y: 0 };
  }
}
