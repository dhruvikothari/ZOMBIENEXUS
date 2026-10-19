import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronsUp, Crown, Skull, Timer, Trophy } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stat } from '@/components/ui/Stat';
import { formatDuration, shortAddress } from '@/lib/format';
import type { BattleResult, Fight } from './result';
import { opponentName } from './result';

function delta(from: number, to: number): string {
  const d = to - from;
  return d === 0 ? 'no change' : `${d > 0 ? '+' : ''}${d}`;
}

export function ResultPanel({ fight, result, headTs, onAgain }: { fight: Fight; result: BattleResult; headTs: number | null; onAgain: () => void }) {
  const reduced = !!useReducedMotion();
  const { won, after, spawnedId } = result;
  const before = fight.zombie;
  const foe = opponentName(fight.opponent);
  const wait = !after ? null : headTs === null ? '—' : after.readyTime <= headTs ? 'Ready now' : formatDuration(after.readyTime - headTs);
  const cell = (node: string) => (after ? node : <Skeleton className="h-7 w-20" rounded="md" />);

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 1.4, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card glow={won ? 'green' : 'none'} className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`grid size-12 place-items-center rounded-xl ${won ? 'bg-green/15 text-green' : 'bg-danger/15 text-danger'}`}>
              {won ? <Crown className="size-6" aria-hidden="true" /> : <Skull className="size-6" aria-hidden="true" />}
            </span>
            <div>
              <h2 className={`font-display text-h2 font-bold tracking-[0.08em] ${won ? 'text-green' : 'text-danger'}`}>{won ? 'VICTORY' : 'DEFEAT'}</h2>
              <p className="text-sm text-fg-muted">
                {won ? `${before.name} defeated ${foe}.` : `${foe} defeated ${before.name}.`} Win chance was {fight.odds}%.
              </p>
            </div>
          </div>
          <p className="font-mono text-label text-fg-muted">tx {shortAddress(result.hash)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Level" icon={<ChevronsUp className="size-4" />} value={cell(`${before.level} → ${after?.level ?? ''}`)} hint={after ? delta(before.level, after.level) : undefined} />
          <Stat label="Wins" icon={<Trophy className="size-4" />} value={cell(`${before.winCount} → ${after?.winCount ?? ''}`)} hint={after ? delta(before.winCount, after.winCount) : undefined} />
          <Stat label="Losses" icon={<Skull className="size-4" />} value={cell(`${before.lossCount} → ${after?.lossCount ?? ''}`)} hint={after ? delta(before.lossCount, after.lossCount) : undefined} />
          <Stat label="Next battle" icon={<Timer className="size-4" />} value={cell(wait ?? '')} hint={after ? 'cooldown from new readyTime' : undefined} />
        </div>

        {spawnedId !== null && (
          <p className="rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-fg">
            Spawned zombie #{spawnedId}.{' '}
            <Link to={`/zombie/${spawnedId}`} className="font-semibold text-green underline underline-offset-4">
              View it
            </Link>
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onAgain}>
            Battle again
          </Button>
          <Link to={`/zombie/${before.id}`} className={buttonClass('ghost', 'md')}>
            View {before.name}
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
