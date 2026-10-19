import { describe, expect, it } from 'vitest';
import {
  PVP_WIN_CHANCE,
  ROSTER,
  heroIndex,
  heroName,
  powerOf,
  randomGenes,
  winChance,
} from '@/lib/roster';

describe('roster', () => {
  it('6 genes map to 6 distinct heroes in order, index == position', () => {
    expect(ROSTER).toHaveLength(6);
    ROSTER.forEach((r, i) => {
      expect(r.index).toBe(i);
      expect(heroIndex(r.genes)).toBe(i);
      expect(heroName(r.genes)).toBe(r.name);
    });
    expect(new Set(ROSTER.map((r) => r.name)).size).toBe(6);
    expect(ROSTER.map((r) => r.name)).toEqual([
      'Iron Man',
      'Captain America',
      'Thor',
      'Hulk',
      'Black Widow',
      'Hawkeye',
    ]);
  });

  it('powers are 7,6,9,8,5,4', () => {
    expect(ROSTER.map((r) => powerOf(r.genes))).toEqual([7, 6, 9, 8, 5, 4]);
  });

  it('winChance clamps to 10..90', () => {
    expect(winChance(1, 10)).toBe(10);
    expect(winChance(20, 1)).toBe(90);
    expect(winChance(8, 9)).toBe(45);
    expect(winChance(8, 4)).toBe(70);
    expect(winChance(0, 10)).toBe(10);
  });

  it('PvP chance is 71', () => {
    expect(PVP_WIN_CHANCE).toBe(71);
  });

  it('randomGenes is below 10^16', () => {
    for (let i = 0; i < 20; i++) {
      const g = randomGenes();
      expect(g >= 0n && g < 10n ** 16n).toBe(true);
    }
  });
});
