export const DIRECTION_NONE = 'NONE';
export const DIRECTION_LEFT = 'LEFT';
export const DIRECTION_RIGHT = 'RIGHT';
export const DIRECTION_UP = 'UP';
export const DIRECTION_DOWN = 'DOWN';

export const directionsHorizontal = [DIRECTION_LEFT, DIRECTION_RIGHT];
export const directionsVertical = [DIRECTION_UP, DIRECTION_DOWN];
export const directions = [].concat(directionsHorizontal, directionsVertical);

export const LEVEL_MAP_ITEM_WORKER = '@';
export const LEVEL_MAP_ITEM_WORKER_ON_GOAL = '+';
export const LEVEL_MAP_ITEM_WALL = '#';
export const LEVEL_MAP_ITEM_GOAL = '.';
export const LEVEL_MAP_ITEM_BOX = '$';
export const LEVEL_MAP_ITEM_BOX_ON_GOAL = '*';
export const LEVEL_MAP_ITEM_SPACE = ' ';

export const levelMapItems = [
  LEVEL_MAP_ITEM_WORKER,
  LEVEL_MAP_ITEM_WORKER_ON_GOAL,
  LEVEL_MAP_ITEM_WALL,
  LEVEL_MAP_ITEM_GOAL,
  LEVEL_MAP_ITEM_BOX,
  LEVEL_MAP_ITEM_BOX_ON_GOAL,
  LEVEL_MAP_ITEM_SPACE
];

export const EVENT_LEVEL_CHANGE = 'level:change';
export const EVENT_LEVEL_MOVE_START = 'level:moveStart';
export const EVENT_LEVEL_MOVE_END = 'level:moveEnd';
export const EVENT_LEVEL_COMPLETED = 'level:completed';
