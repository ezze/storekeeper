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
        let size = LevelMap.detectSize(items);
        expect(size).toEqual({
            rows: 9,
            columns: 9
        });

        let levelMap = new LevelMap(items);
        expect(levelMap.rows).toBe(size.rows);
        expect(levelMap.columns).toBe(size.columns);
    });

    it('Consistency', () => {
        let levelMap;
        levelSetJson.levels.forEach(function(level) {
            levelMap = new LevelMap(level.items);
            expect(levelMap.items).toEqual(level.items);
        });
    });
});