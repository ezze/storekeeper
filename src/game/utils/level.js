import {
  LEVEL_MAP_ITEM_WORKER,
  LEVEL_MAP_ITEM_WORKER_ON_GOAL,
  LEVEL_MAP_ITEM_WALL,
  LEVEL_MAP_ITEM_GOAL,
  LEVEL_MAP_ITEM_BOX,
  LEVEL_MAP_ITEM_BOX_ON_GOAL,
  levelMapItems
} from '../../constants/level';

export function isLevelMapItemValid(item) {
  return levelMapItems.includes(item);
}

export function isLevelMapWorkerItem(item) {
  return item === LEVEL_MAP_ITEM_WORKER || item === LEVEL_MAP_ITEM_WORKER_ON_GOAL;
}

export function isLevelMapWallItem(item) {
  return item === LEVEL_MAP_ITEM_WALL;
}

export function isLevelMapGoalItem(item) {
  return item === LEVEL_MAP_ITEM_GOAL || item === LEVEL_MAP_ITEM_WORKER_ON_GOAL || item === LEVEL_MAP_ITEM_BOX_ON_GOAL;
}

export function isLevelMapBoxItem(character) {
  return character === LEVEL_MAP_ITEM_BOX || character === LEVEL_MAP_ITEM_BOX_ON_GOAL;
}
