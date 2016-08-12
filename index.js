import Level from './lib/level/level';
import LevelMap from './lib/level/level-map';

import levelSet from './levels/original.json';

var level = new Level();
level.map = new LevelMap(levelSet.levels[0].items);

console.log(level.map.toString());
