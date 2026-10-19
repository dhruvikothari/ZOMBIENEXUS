import { Biohazard, ChevronsUp, Crown, Dna, Flame, Send, Sparkles, Swords, UserCheck, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BadgeTone } from '@/components/ui/Badge';
import type { ActivityItem } from '@/lib/types';

export type FilterId = 'all' | 'zombies' | 'transfers' | 'battles' | 'avengers' | 'mine';

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'zombies', label: 'Zombies' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'battles', label: 'Battles' },
  { id: 'avengers', label: 'Avengers' },
  { id: 'mine', label: 'Mine' },
];

type Meta = { label: string; icon: ReactNode; tone: BadgeTone; group: FilterId | null };

const META: Record<string, Meta> = {
  NewZombie: { label: 'New zombie', icon: <Biohazard />, tone: 'green', group: 'zombies' },
  LevelUp: { label: 'Level up', icon: <ChevronsUp />, tone: 'green', group: 'zombies' },
  Transfer: { label: 'Transfer', icon: <Send />, tone: 'info', group: 'transfers' },
  Approval: { label: 'Approval', icon: <UserCheck />, tone: 'info', group: 'transfers' },
  Battle: { label: 'Battle', icon: <Swords />, tone: 'danger', group: 'battles' },
  AvengerBattle: { label: 'Avenger battle', icon: <Flame />, tone: 'gold', group: 'battles' },
  Birth: { label: 'Avenger summoned', icon: <Sparkles />, tone: 'purple', group: 'avengers' },
  AvengerFed: { label: 'Infection', icon: <Dna />, tone: 'purple', group: 'avengers' },
  OwnershipTransferred: { label: 'Contract owner changed', icon: <Crown />, tone: 'neutral', group: null },
};

export function eventMeta(event: string): Meta {
  return META[event] ?? { label: event, icon: <Zap />, tone: 'neutral', group: null };
}

export function matchesFilter(item: ActivityItem, filter: FilterId, me: string | null): boolean {
  if (filter === 'all') return true;
  if (filter === 'mine') {
    if (!me) return false;
    const m = me.toLowerCase();
    return item.from.toLowerCase() === m || Object.values(item.args).some((v) => v.toLowerCase() === m);
  }
  return eventMeta(item.event).group === filter;
}
