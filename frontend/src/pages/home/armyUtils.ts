import { rarityOf } from '@/lib/dna';
import { isReady } from '@/lib/format';
import type { Rarity, Zombie } from '@/lib/types';

export type SortKey = 'level-desc' | 'level-asc' | 'newest' | 'name';
export type FilterKey = 'all' | Rarity | 'ready' | 'cooling';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'level-desc', label: 'Level: high to low' },
  { value: 'level-asc', label: 'Level: low to high' },
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name (A to Z)' },
];

export const FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'common', label: 'Common' },
  { id: 'rare', label: 'Rare' },
  { id: 'hero', label: 'Hero' },
  { id: 'ready', label: 'Ready' },
  { id: 'cooling', label: 'Cooling' },
];

export function matchesFilter(z: Zombie, filter: FilterKey, headTs: number | null): boolean {
  if (filter === 'all') return true;
  if (filter === 'ready' || filter === 'cooling') {
    const ready = isReady(z, headTs);
    return filter === 'ready' ? ready : !ready;
  }
  return rarityOf(z.dna) === filter;
}

export function sortZombies(list: Zombie[], key: SortKey): Zombie[] {
  const out = [...list];
  if (key === 'level-desc') out.sort((a, b) => b.level - a.level || b.id - a.id);
  else if (key === 'level-asc') out.sort((a, b) => a.level - b.level || a.id - b.id);
  else if (key === 'newest') out.sort((a, b) => b.id - a.id);
  else out.sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id);
  return out;
}
