import LevelMap, { detectLevelMapSize } from '../../../src/game/level/LevelMap';
import levelPackJson from '../../../src/levels/classic.json';

const { levels } = levelPackJson;

const items = [
  '######',
  '#.   ####',
  '#.$ ##  #',
  '#.$ @ $ #',
  '#.  #   #',
  '## ###$##',
  ' # *   #',
  ' ##   ##',
  '  #####'
];

const truncatedItems = [
  '#####',
  '#   #',
  '#.$@#',
  '#####'
];

describe('level map', () => {
  describe('size detection', () => {
    it('non-empty map', () => {
      const size = detectLevelMapSize(items);
      expect(size).toEqual({ rows: 9, columns: 9 });

      const levelMap = new LevelMap(items);
      expect(levelMap.rows).toEqual(size.rows);
      expect(levelMap.columns).toEqual(size.columns);
    });

    it('empty map', () => {
      const levelMap = new LevelMap();
      expect(levelMap.rows).toEqual(0);
      expect(levelMap.columns).toEqual(0);
    });
  });

  it('consistency', () => {
    levels.forEach(function(level) {
      const levelMap = new LevelMap(level.items);
      expect(levelMap.items).toEqual(level.items);
    });
  });

  it('manipulation', () => {
    const levelMap = new LevelMap();

    levelMap.rows = 6;
    levelMap.columns = 6;

    expect(levelMap.rows).toEqual(6);
    expect(levelMap.columns).toEqual(6);
    expect(levelMap.linearIndex(4, 5)).toEqual(29);

    levelMap.items = items;

    expect(levelMap.items).toEqual(items);
    expect(levelMap.linearIndex(4, 5)).toEqual(41);
    expect(levelMap.at(3, 4)).toEqual('@');
    expect(levelMap.at(0, 0)).toEqual('#');
    expect(levelMap.at(levelMap.rows - 1, levelMap.columns - 1)).toEqual(' ');

    levelMap.insert(1, 4, '#');
    levelMap.insert(levelMap.rows - 1, levelMap.columns - 1, '*');
    expect(levelMap.at(1, 4)).toEqual('#');
    expect(levelMap.at(levelMap.rows - 1, levelMap.columns - 1)).toEqual('*');

    levelMap.rows = 4;
    levelMap.columns = 5;
    levelMap.insert(3, 1, '#');
    levelMap.insert(3, 2, '#');
    levelMap.insert(3, 3, '#');
    levelMap.insert(3, 4, '#');
    levelMap.insert(2, 3, '@');
    levelMap.remove(1, 1);
    expect(levelMap.items).toEqual(truncatedItems);

    levelMap.columns = 9;
    expect(levelMap.items).toEqual(truncatedItems);

    levelMap.rows = 9;
    expect(levelMap.items).not.toEqual(truncatedItems);

    levelMap.normalize();
    expect(levelMap.rows).toEqual(4);
    expect(levelMap.columns).toEqual(5);
    expect(levelMap.items).toEqual(truncatedItems);
  });

  it('validation', () => {
    let levelMap;
    levels.forEach(function(level) {
      levelMap = new LevelMap(level.items);
      expect(levelMap.validate()).toBeTruthy();
    });

    levelMap = new LevelMap(items);
    expect(levelMap.validate()).toBeTruthy();

    levelMap.insert(3, 4, ' ');
    expect(levelMap.validate()).toBeFalsy();

    levelMap.insert(1, 4, '@');
    expect(levelMap.validate()).toBeTruthy();

    levelMap.insert(3, 1, '*');
    expect(levelMap.validate()).toBeFalsy();

    levelMap.insert(3, 4, '.');
    expect(levelMap.validate()).toBeTruthy();

    levelMap.insert(1, 4, '+');
    expect(levelMap.validate()).toBeFalsy();

    levelMap.insert(3, 1, '$');
    expect(levelMap.validate()).toBeTruthy();
  });
});
