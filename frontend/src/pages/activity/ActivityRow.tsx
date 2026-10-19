import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Address } from '@/components/ui/Address';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { timeAgo } from '@/lib/format';
import type { ActivityItem } from '@/lib/types';
import { eventMeta } from './eventMeta';

const LINK = 'font-semibold text-green underline-offset-2 hover:underline';

const ZombieLink = ({ id }: { id: string }) => (
  <Link to={`/zombie/${id}`} className={LINK}>
    Zombie #{id}
  </Link>
);

const AvengerLink = ({ id }: { id: string }) => (
  <Link to="/avengers" className={LINK}>
    Avenger #{id}
  </Link>
);

const Outcome = ({ won }: { won: string }) =>
  won === 'true' ? <strong className="text-green">victory</strong> : <strong className="text-danger">defeat</strong>;

function Detail({ item }: { item: ActivityItem }): ReactNode {
  const a = item.args;
  switch (item.event) {
    case 'NewZombie':
      return (
        <>
          <ZombieLink id={a.zombieId} /> “{a.name}” was created
        </>
      );
    case 'LevelUp':
      return (
        <>
          <ZombieLink id={a.zombieId} /> reached level {a.newLevel}
        </>
      );
    case 'Transfer':
      return (
        <>
          <ZombieLink id={a._tokenId} /> sent from <Address address={a._from} /> to <Address address={a._to} />
        </>
      );
    case 'Approval':
      return (
        <>
          <ZombieLink id={a._tokenId} /> approved for <Address address={a._approved} />
        </>
      );
    case 'Battle':
      return (
        <>
          <ZombieLink id={a.zombieId} /> attacked <ZombieLink id={a.targetId} />: <Outcome won={a.won} />
        </>
      );
    case 'AvengerBattle':
      return (
        <>
          <ZombieLink id={a.zombieId} /> fought <AvengerLink id={a.avengerId} />: <Outcome won={a.won} />
        </>
      );
    case 'AvengerFed':
      return (
        <>
          <ZombieLink id={a.zombieId} /> fed on <AvengerLink id={a.avengerId} />
        </>
      );
    case 'Birth':
      return (
        <>
          <AvengerLink id={a.avengerId} /> summoned by <Address address={a.owner} />
        </>
      );
    default:
      return <span className="text-fg-muted">{item.event} on {item.contract}</span>;
  }
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="font-display text-label font-medium uppercase tracking-[0.08em] text-fg-muted">{label}</span>
      {children}
    </span>
  );
}

export function ActivityRow({ item, headTs }: { item: ActivityItem; headTs: number | null }) {
  const meta = eventMeta(item.event);
  const iso = new Date(item.timestamp * 1000).toISOString();
  return (
    <li>
      <Card className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <Badge tone={meta.tone} icon={meta.icon}>
              {meta.label}
            </Badge>
            <p className="min-w-0 break-words">
              <Detail item={item} />
            </p>
          </div>
          <time dateTime={iso} title={`Chain time ${iso}`} className="shrink-0 text-sm text-fg-muted">
            {headTs === null ? iso.slice(0, 10) : timeAgo(item.timestamp, headTs)}
          </time>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line pt-3">
          <Meta label="From">
            <Address address={item.from} copy />
          </Meta>
          <Meta label="Block">
            <span className="font-mono text-[0.8125rem] tabular-nums">{item.blockNumber}</span>
          </Meta>
          <Meta label="Gas">
            <span className="font-mono text-[0.8125rem] tabular-nums">{item.gasUsed.toLocaleString()}</span>
          </Meta>
          <Meta label="Tx">
            <Address address={item.txHash} copy />
          </Meta>
        </div>
      </Card>
    </li>
  );
}
