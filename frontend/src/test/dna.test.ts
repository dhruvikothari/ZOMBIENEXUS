import { describe, expect, it } from 'vitest';
import {
  DNA_MOD,
  decodeDna,
  dnaPair,
  dnaString,
  heroDna,
  isHero,
  levelTier,
  normalizeDna,
  previewDna,
  rarityOf,
} from '@/lib/dna';

const ROTFANG = 2521625881949400n;
const THOR_GENES = 9902671358840708n;

describe('dna', () => {
  it('previewDna matches createRandomZombie (ends in 00)', () => {
    expect(previewDna('Rotfang')).toBe(ROTFANG);
    expect(previewDna('Rotfang')).toBe(previewDna('Rotfang'));
    for (const n of ['Grimjaw', 'Mossbelly', 'x', '']) {
      const d = previewDna(n);
      expect(d % 100n).toBe(0n);
      expect(d < DNA_MOD).toBe(true);
    }
  });

  it('heroDna(Rotfang, Thor) matches the seeded on-chain hero', () => {
    const h = heroDna(ROTFANG, THOR_GENES);
    expect(h).toBe(6212148620395099n);
    expect(isHero(h)).toBe(true);
  });

  it('normalizeDna and dnaString', () => {
    expect(normalizeDna(DNA_MOD + 5n)).toBe(5n);
    expect(dnaString(981397381800200n)).toBe('0981397381800200');
    expect(dnaString(5n)).toHaveLength(16);
  });

  it('dnaPair: i=0 is the last two digits', () => {
    const dna = 1234567890123456n;
    expect(dnaPair(dna, 0)).toBe(56);
    expect(dnaPair(dna, 1)).toBe(34);
    expect(dnaPair(dna, 7)).toBe(12);
    expect(dnaPair(981397381800200n, 7)).toBe(9); // leading zero pair
  });

  it('decodeDna is deterministic and maps pairs with the SPEC moduli', () => {
    const dna = 6212148620395099n;
    const s = dnaString(dna);
    const pair = (i: number) => Number(s.slice(14 - 2 * i, 16 - 2 * i));
    expect(decodeDna(dna)).toEqual(decodeDna(dna));
    expect(decodeDna(dna)).toEqual({
      species: 'hero',
      accessory: pair(1) % 6,
      clothes: pair(2) % 6,
      mouth: pair(3) % 5,
      eyes: pair(4) % 6,
      skin: pair(5) % 8,
      head: pair(6) % 4,
      aura: pair(7) % 5,
    });
    expect(decodeDna(ROTFANG).species).toBe('zombie');
  });

  it('decodeDna stays inside variant ranges', () => {
    for (let i = 0n; i < 200n; i++) {
      const t = decodeDna(i * 50_505_050_505_050n + 99n * (i % 2n));
      expect(t.accessory).toBeLessThan(6);
      expect(t.clothes).toBeLessThan(6);
      expect(t.mouth).toBeLessThan(5);
      expect(t.eyes).toBeLessThan(6);
      expect(t.skin).toBeLessThan(8);
      expect(t.head).toBeLessThan(4);
      expect(t.aura).toBeLessThan(5);
    }
  });

  it('rarityOf: hero / rare / common', () => {
    expect(rarityOf(6212148620395099n)).toBe('hero');
    expect(rarityOf(9343918324261199n)).toBe('hero'); // hero wins over rare roll
    expect(rarityOf(9343918324261100n)).toBe('rare'); // top pair 93
    expect(rarityOf(9043918324261100n)).toBe('rare'); // boundary 90
    expect(rarityOf(8943918324261100n)).toBe('common'); // 89
    expect(rarityOf(ROTFANG)).toBe('common');
  });

  it('levelTier boundaries', () => {
    const tiers = [1, 2, 4, 5, 9, 10, 50].map(levelTier);
    expect(tiers).toEqual([0, 1, 1, 2, 2, 3, 3]);
  });
});
