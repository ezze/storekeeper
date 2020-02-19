import { sprintf } from 'sprintf-js';

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

export const levelPacks = [{
  id: 'classic',
  fileName: 'classic.json',
  label: 'Classic'
}, {
  id: 'yellowberry',
  fileName: 'yellowberry.json',
  label: 'Yellowberry'
}, {
  id: 'haikemono',
  fileName: 'haikemono.sok',
  label: 'Haikemono'
}];

for (let number = 1; number <= 12; number++) {
  const formattedNumber = sprintf('%02d', number);
  levelPacks.push({
    id: `sasquatch-${formattedNumber}`,
    fileName: `sasquatch-${formattedNumber}.sok`,
    label: `Sasquatch ${formattedNumber}`
  });
}
