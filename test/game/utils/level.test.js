import { isLevelMapItemValid } from '../../../src/game/utils/level';

describe('level map utils', () => {
  it('item validation', () => {
    expect(isLevelMapItemValid('@')).toBe(true);
    expect(isLevelMapItemValid('+')).toBe(true);
    expect(isLevelMapItemValid('#')).toBe(true);
    expect(isLevelMapItemValid('.')).toBe(true);
    expect(isLevelMapItemValid('$')).toBe(true);
    expect(isLevelMapItemValid('*')).toBe(true);
    expect(isLevelMapItemValid(' ')).toBe(true);
    expect(isLevelMapItemValid('~')).toBe(false);
    expect(isLevelMapItemValid('1')).toBe(false);
    expect(isLevelMapItemValid('w')).toBe(false);
  });
});
