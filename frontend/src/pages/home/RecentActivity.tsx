import { useMemo } from 'react';
import { Activity, ArrowRight, Biohazard, ChevronsUp, Dna, Send, Shield, Swords, UserCheck, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { shortAddress, timeAgo } from '@/lib/format';
import { useBlockTime } from '@/lib/chain';
import { useActivity } from '@/lib/hooks';
import type { ActivityItem, Zombie } from '@/lib/types';

const ICONS: Record<string, LucideIcon> = {
  NewZombie: Biohazard,
  Transfer: Send,
  Approval: UserCheck,
  LevelUp: ChevronsUp,
  Battle: Swords,
  AvengerBattle: Swords,
  AvengerFed: Dna,
  Birth: Shield,
};

const zombieIdOf = (i: ActivityItem) => i.args.zombieId ?? i.args._tokenId;

function describe(i: ActivityItem): string {
  const a = i.args;
  const z = zombieIdOf(i);
  const result = a.won === 'true' ? 'won' : 'lost';
  switch (i.event) {
    case 'NewZombie': return `${a.name} rose as zombie #${z}`;
    case 'Transfer': return `Zombie #${z} moved from ${shortAddress(a._from)} to ${shortAddress(a._to)}`;
    case 'Approval': return `${shortAddress(a._approved)} approved for zombie #${z}`;
    case 'LevelUp': return `Zombie #${z} reached level ${a.newLevel}`;
    case 'Battle': return `Zombie #${z} ${result} against zombie #${a.targetId}`;
    case 'AvengerBattle': return `Zombie #${z} ${result} against Avenger #${a.avengerId}`;
    case 'AvengerFed': return `Zombie #${z} infected by Avenger #${a.avengerId}`;
    case 'Birth': return `Avenger #${a.avengerId} summoned`;
    default: return i.event;
  }
}

function involves(i: ActivityItem, me: string, ids: Set<string>): boolean {
  const m = me.toLowerCase();
  if (i.from.toLowerCase() === m) return true;
  const a = i.args;
  if (Object.values(a).some((v) => v.toLowerCase() === m)) return true;
  return [a.zombieId, a._tokenId, a.targetId].some((v) => v !== undefined && ids.has(v));
}

export function RecentActivity({ address, owned }: { address: string; owned: Zombie[] | null }) {
  const activity = useActivity();
  const headTs = useBlockTime();
  const rows = useMemo(() => {
    if (!activity.data) return [];
    const ids = new Set((owned ?? []).map((z) => String(z.id)));
    return activity.data.filter((i) => involves(i, address, ids)).slice(0, 5);
  }, [activity.data, address, owned]);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-h3">Recent activity</h2>
        <Link
          to="/activity"
          className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-green hover:underline"
        >
          View all <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      <div className="mt-4">
        {activity.loading && !activity.data ? (
          <div aria-hidden className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} rounded="md" className="h-12" />
            ))}
          </div>
        ) : activity.error && !activity.data ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-fg-muted">
            <span>{activity.error.message}</span>
            <Button size="sm" variant="secondary" onClick={activity.refetch}>
              Retry
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="flex items-center gap-2 py-4 text-sm text-fg-muted">
            <Activity size={16} aria-hidden /> No on-chain activity for this address yet.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((item) => {
              const Icon = ICONS[item.event] ?? Activity;
              const z = zombieIdOf(item);
              const body = (
                <>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-green">
                    <Icon size={16} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{describe(item)}</span>
                  {headTs !== null && (
                    <span className="shrink-0 text-label text-fg-muted">{timeAgo(item.timestamp, headTs)}</span>
                  )}
                </>
              );
              const cls = 'flex items-center gap-3 py-3';
              return (
                <li key={item.key}>
                  {z !== undefined ? (
                    <Link to={`/zombie/${z}`} className={`${cls} rounded-md transition-colors hover:bg-raised/50`}>
                      {body}
                    </Link>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
