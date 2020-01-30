import LevelMap from '../../src/game/level/LevelMap';
import levelSetJson from '../../src/levels/original.json';

describe('Level map', () => {
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

  it('Size detection', () => {
    let size, levelMap;

    size = LevelMap.detectLevelMapSize(items);
    expect(size).toEqual({
      rows: 9,
      columns: 9
    });

    levelMap = new LevelMap(items);
    expect(levelMap.rowsCount).toBe(size.rows);
    expect(levelMap.columnsCount).toBe(size.columns);

    levelMap = new LevelMap();
    expect(levelMap.rowsCount).toBe(0);
    expect(levelMap.columnsCount).toBe(0);
  });

  it('Item validation', () => {
    expect(LevelMap.isItemValid('@')).toBe(true);
    expect(LevelMap.isItemValid('+')).toBe(true);
    expect(LevelMap.isItemValid('#')).toBe(true);
    expect(LevelMap.isItemValid('.')).toBe(true);
    expect(LevelMap.isItemValid('$')).toBe(true);
    expect(LevelMap.isItemValid('*')).toBe(true);
    expect(LevelMap.isItemValid(' ')).toBe(true);
    expect(LevelMap.isItemValid('~')).toBe(false);
    expect(LevelMap.isItemValid('1')).toBe(false);
    expect(LevelMap.isItemValid('w')).toBe(false);
  });

  it('Consistency', () => {
    let levelMap;
    levelSetJson.levels.forEach(function(level) {
      levelMap = new LevelMap(level.items);
      expect(levelMap.items).toEqual(level.items);
    });
  });

  it('Manipulation', () => {
    const levelMap = new LevelMap();

    levelMap.rowsCount = 6;
    levelMap.columnsCount = 6;

    expect(levelMap.rowsCount).toBe(6);
    expect(levelMap.columnsCount).toBe(6);
    expect(levelMap.linearIndex(4, 5)).toBe(29);

    levelMap.items = items;
    expect(levelMap.items).toEqual(items);
    expect(levelMap.linearIndex(4, 5)).toBe(41);
    expect(levelMap.at(3, 4)).toBe('@');
    expect(levelMap.at(0, 0)).toBe('#');
    expect(levelMap.at(levelMap.rowsCount - 1, levelMap.columnsCount - 1)).toBe(' ');

    levelMap.insert(1, 4, '#');
    levelMap.insert(levelMap.rowsCount - 1, levelMap.columnsCount - 1, '*');
    expect(levelMap.at(1, 4)).toBe('#');
    expect(levelMap.at(levelMap.rowsCount - 1, levelMap.columnsCount - 1)).toBe('*');

    levelMap.rowsCount = 4;
    levelMap.columnsCount = 5;
    levelMap.insert(3, 1, '#');
    levelMap.insert(3, 2, '#');
    levelMap.insert(3, 3, '#');
    levelMap.insert(3, 4, '#');
    levelMap.insert(2, 3, '@');
    levelMap.remove(1, 1);
    expect(levelMap.items).toEqual(truncatedItems);

    levelMap.columnsCount = 9;
    expect(levelMap.items).toEqual(truncatedItems);

    levelMap.rowsCount = 9;
    expect(levelMap.items).not.toEqual(truncatedItems);

    levelMap.normalize();
    expect(levelMap.rowsCount).toBe(4);
    expect(levelMap.columnsCount).toBe(5);
    expect(levelMap.items).toEqual(truncatedItems);
  });

  it('Validation', () => {
    let levelMap;
    levelSetJson.levels.forEach(function(level) {
      levelMap = new LevelMap(level.items);
      expect(levelMap.validate()).toBe(true);
    });

    levelMap = new LevelMap(items);
    expect(levelMap.validate()).toBe(true);

    levelMap.insert(3, 4, ' ');
    expect(levelMap.validate()).toBe(false);

    levelMap.insert(1, 4, '@');
    expect(levelMap.validate()).toBe(true);

    levelMap.insert(3, 1, '*');
    expect(levelMap.validate()).toBe(false);

    levelMap.insert(3, 4, '.');
    expect(levelMap.validate()).toBe(true);

    levelMap.insert(1, 4, '+');
    expect(levelMap.validate()).toBe(false);

    levelMap.insert(3, 1, '$');
    expect(levelMap.validate()).toBe(true);
  });
});
