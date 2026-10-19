import { keccak256, toUtf8Bytes } from 'ethers';
import type { Rarity } from '@/lib/types';

export const DNA_MOD = 10n ** 16n;

export type Traits = {
  species: 'zombie' | 'hero';
  accessory: number;
  clothes: number;
  mouth: number;
  eyes: number;
  skin: number;
  head: number;
  aura: number;
};

export const SKIN = ['#7FB069', '#8DBF5A', '#6FA37A', '#9BBF7A', '#7A9E8E', '#A3B86C', '#5E8C6A', '#8FA89B'] as const;

export const TRAIT_NAMES = {
  accessory: ['None', 'Helmet + goggles', 'Pirate hat', 'Flat cap', 'Bandana', 'Headphones'],
  clothes: ['Torn tank top', 'Striped shirt', 'Lab coat', 'Leather jacket', 'Hoodie', 'Suit + tie'],
  mouth: ['Stitched', 'Jagged teeth', 'Drool', 'Gap grin', 'Frown'],
  eyes: ['Hollow', 'Mismatched', 'Glowing slits', 'Stitched X', 'Droopy', 'Three-eyed'],
  skin: ['Swamp green', 'Lime rot', 'Sea moss', 'Pale sage', 'Grey lichen', 'Olive decay', 'Fern', 'Ash mist'],
  head: ['Round', 'Square jaw', 'Tall skull', 'Lumpy stitched'],
  aura: ['Toxic green', 'Purple mist', 'Teal ring', 'Ember', 'Swirl'],
} as const;

export const normalizeDna = (dna: bigint): bigint => dna % DNA_MOD;

export const dnaString = (dna: bigint): string => normalizeDna(dna).toString().padStart(16, '0');

/** i = 0 is the last two digits. */
export const dnaPair = (dna: bigint, i: number): number =>
  Number(((normalizeDna(dna) / 10n ** BigInt(2 * i)) % 100n));

/** Mirrors createRandomZombie: keccak(name) % 10^16, last two digits zeroed. */
export function previewDna(name: string): bigint {
  const d = BigInt(keccak256(toUtf8Bytes(name))) % DNA_MOD;
  return d - (d % 100n);
}

/** Mirrors feedAndMultiply with species "avenger". */
export function heroDna(myDna: bigint, genes: bigint): bigint {
  const x = (myDna + (genes % DNA_MOD)) / 2n;
  return x - (x % 100n) + 99n;
}

export const isHero = (dna: bigint): boolean => dna % 100n === 99n;

export function rarityOf(dna: bigint): Rarity {
  if (isHero(dna)) return 'hero';
  return dnaPair(dna, 7) >= 90 ? 'rare' : 'common';
}

export function decodeDna(dna: bigint): Traits {
  return {
    species: dnaPair(dna, 0) === 99 ? 'hero' : 'zombie',
    accessory: dnaPair(dna, 1) % 6,
    clothes: dnaPair(dna, 2) % 6,
    mouth: dnaPair(dna, 3) % 5,
    eyes: dnaPair(dna, 4) % 6,
    skin: dnaPair(dna, 5) % 8,
    head: dnaPair(dna, 6) % 4,
    aura: dnaPair(dna, 7) % 5,
  };
}

export function levelTier(level: number): 0 | 1 | 2 | 3 {
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  if (level >= 2) return 1;
  return 0;
}
