import {
  DIRECTION_NONE,
  DIRECTION_LEFT,
  DIRECTION_UP,
  DIRECTION_RIGHT,
  DIRECTION_DOWN
} from '../constants/direction';

export function getDirectionByKeyCode(code) {
  switch (code) {
    case 37: case 65: return DIRECTION_LEFT; // arrow left or A
    case 38: case 87: return DIRECTION_UP; // arrow up or W
    case 39: case 68: return DIRECTION_RIGHT; // arrow right or D
    case 40: case 83: return DIRECTION_DOWN; // arrow down or S
    default: return DIRECTION_NONE;
  }
}

export function getDirectionByTouchPoint(target, x, y) {
  const { offsetWidth: targetWidth, offsetHeight: targetHeight } = target;
  const targetRatio = targetHeight / targetWidth;
  if (y < targetRatio * x && y < targetHeight - targetRatio * x) {
    return DIRECTION_UP;
  }
  if (y > targetRatio * x && y > targetHeight - targetRatio * x) {
    return DIRECTION_DOWN;
  }
  if (y > targetRatio * x && y < targetHeight - targetRatio * x) {
    return DIRECTION_LEFT;
  }
  if (y < targetRatio * x && y > targetHeight - targetRatio * x) {
    return DIRECTION_RIGHT;
  }
  return DIRECTION_NONE;
}
