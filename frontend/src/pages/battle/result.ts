import type { Avenger, Zombie } from '@/lib/types';

export type Mode = 'avengers' | 'zombies';

// Snapshot taken when the player presses Battle, so the arena keeps its fighters while data refetches.
export type Fight = {
  mode: Mode;
  zombie: Zombie;
  opponent: Zombie | Avenger;
  odds: number;
};

export type BattleResult = {
  won: boolean;
  spawnedId: number | null;
  after: Zombie | null;
  hash: string;
};

export function isAvenger(o: Zombie | Avenger): o is Avenger {
  return 'heroName' in o;
}

export function opponentName(o: Zombie | Avenger): string {
  return isAvenger(o) ? o.heroName : o.name;
}

// The outcome is read only from the decoded on-chain event, never from the animation.
export function readOutcome(
  logs: { name: string; args: Record<string, string> }[],
  mode: Mode,
): { won: boolean; spawnedId: number | null } | null {
  const ev = logs.find((l) => l.name === (mode === 'avengers' ? 'AvengerBattle' : 'Battle'));
  if (!ev) return null;
  const spawned = mode === 'zombies' ? logs.find((l) => l.name === 'NewZombie') : undefined;
  return {
    won: String(ev.args.won) === 'true',
    spawnedId: spawned ? Number(spawned.args.zombieId) : null,
  };
}

export function parseId(v: string | null): number | null {
  return v !== null && /^\d+$/.test(v) ? Number(v) : null;
}
