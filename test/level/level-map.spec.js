'use strict';

import LevelMap from '../../lib/level/level-map';
import levelSetJson from '../../levels/original.json';

describe('Level map initialization', () => {
    let items = [
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

    it('Size detection', () => {
        let size, levelMap;

        size = LevelMap.detectSize(items);
        expect(size).toEqual({
            rows: items.length,
            columns: 9
        });
        levelMap = new LevelMap(items);
        expect(levelMap.rows).toBe(size.rows);
        expect(levelMap.columns).toBe(size.columns);

        levelMap = new LevelMap();
        expect(levelMap.rows).toBe(0);
        expect(levelMap.columns).toBe(0);
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
        let levelMap = new LevelMap();

        levelMap.rows = 6;
        levelMap.columns = 6;

        expect(levelMap.rows).toBe(6);
        expect(levelMap.columns).toBe(6);
        expect(levelMap.linearIndex(4, 5)).toBe(29);

        levelMap.items = items;
        expect(levelMap.items).toEqual(items);
        expect(levelMap.linearIndex(4, 5)).toBe(41);
        expect(levelMap.at(3, 4)).toBe('@');
        expect(levelMap.at(0, 0)).toBe('#');
        expect(levelMap.at(levelMap.rows - 1, levelMap.columns - 1)).toBe(' ');

        levelMap.insert(1, 4, '#');
        levelMap.insert(levelMap.rows - 1, levelMap.columns - 1, '*');
        expect(levelMap.at(1, 4)).toBe('#');
        expect(levelMap.at(levelMap.rows - 1, levelMap.columns - 1)).toBe('*');

        levelMap.rows = 4;
        //levelMap.columns = 5;

        console.log(levelMap.toString());
    });
});