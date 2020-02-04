export const DIRECTION_NONE = 'NONE';
export const DIRECTION_LEFT = 'LEFT';
export const DIRECTION_RIGHT = 'RIGHT';
export const DIRECTION_UP = 'UP';
export const DIRECTION_DOWN = 'DOWN';

export const directionsHorizontal = [DIRECTION_LEFT, DIRECTION_RIGHT];
export const directionsVertical = [DIRECTION_UP, DIRECTION_DOWN];
export const directions = [].concat(DIRECTION_NONE, directionsHorizontal, directionsVertical);
