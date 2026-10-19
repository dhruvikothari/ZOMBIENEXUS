import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Skull, Swords, Timer, TriangleAlert, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClass } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { AvengerArt } from '@/components/art/AvengerArt';
import { ZombieArt } from '@/components/art/ZombieArt';
import { formatDuration, isReady, shortAddress } from '@/lib/format';
import { PVP_WIN_CHANCE, winChance } from '@/lib/roster';
import type { AppError, Avenger, Zombie } from '@/lib/types';

type Load = { initial: boolean; error: AppError | null; onRetry: () => void };

function Shell({ title, count, load, children }: { title: string; count: number | null; load: Load; children: ReactNode }) {
  return (
    <Card className="flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-label uppercase tracking-[0.08em] text-fg-muted">{title}</h2>
        {count !== null && <span className="font-mono text-label text-fg-muted">{count}</span>}
      </div>
      {load.error ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-danger/40 bg-danger/10 p-3" role="alert">
          <p className="flex items-start gap-2 text-sm text-fg">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
            {load.error.message}
          </p>
          <Button size="sm" variant="secondary" onClick={load.onRetry}>
            Retry
          </Button>
        </div>
      ) : load.initial ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" rounded="xl" />
          ))}
        </div>
      ) : (
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-1">{children}</div>
      )}
    </Card>
  );
}

function Row({
  selected,
  disabled,
  onClick,
  art,
  title,
  sub,
  right,
}: {
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  art: ReactNode;
  title: string;
  sub: string;
  right: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-lg border p-2 text-left transition-[border-color,background-color,box-shadow] duration-200 ease-out-expo disabled:cursor-not-allowed ${
        selected
          ? 'border-green bg-green/10 shadow-glow-green'
          : `border-line bg-panel-2/60 enabled:hover:border-line-strong enabled:hover:bg-raised ${disabled ? 'opacity-60' : ''}`
      }`}
    >
      <span className="grid h-12 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-raised">{art}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-bold text-fg">{title}</span>
        <span className="block truncate font-mono text-label text-fg-muted">{sub}</span>
      </span>
      <span className="shrink-0">{right}</span>
    </button>
  );
}

function Thumb({ z }: { z: Zombie }) {
  return <ZombieArt dna={z.dna} level={z.level} size={40} label={`${z.name}, level ${z.level}`} />;
}

export function ZombiePicker({
  zombies,
  load,
  connected,
  selectedId,
  headTs,
  locked,
  onSelect,
}: {
  zombies: Zombie[];
  load: Load;
  connected: boolean;
  selectedId: number | null;
  headTs: number | null;
  locked: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <Shell title="Your zombies" count={connected ? zombies.length : null} load={load}>
      {zombies.length === 0 ? (
        <EmptyState
          icon={<Skull className="size-6" />}
          title={connected ? 'No zombies yet' : 'Wallet not connected'}
          description={connected ? 'Every address gets one free zombie.' : 'Connect MetaMask to pick a fighter.'}
          action={
            connected ? (
              <Link to="/create" className={buttonClass('primary', 'sm')}>
                Create zombie
              </Link>
            ) : undefined
          }
        />
      ) : (
        zombies.map((z) => {
          const ready = headTs !== null && isReady(z, headTs);
          return (
            <Row
              key={z.id}
              selected={z.id === selectedId}
              disabled={locked || !ready}
              onClick={() => onSelect(z.id)}
              art={<Thumb z={z} />}
              title={z.name}
              sub={`#${z.id} · Lv ${z.level} · ${z.winCount}W ${z.lossCount}L`}
              right={
                ready ? (
                  <Badge tone="green" icon={<Zap className="size-3" />}>
                    Ready
                  </Badge>
                ) : (
                  <Badge tone="warning" icon={<Timer className="size-3" />}>
                    {headTs === null ? '…' : formatDuration(z.readyTime - headTs)}
                  </Badge>
                )
              }
            />
          );
        })
      )}
    </Shell>
  );
}

export function AvengerPicker({
  avengers,
  load,
  selectedId,
  zombieLevel,
  locked,
  onSelect,
}: {
  avengers: Avenger[];
  load: Load;
  selectedId: number | null;
  zombieLevel: number | null;
  locked: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <Shell title="Avengers" count={avengers.length} load={load}>
      {avengers.length === 0 ? (
        <EmptyState
          icon={<Swords className="size-6" />}
          title="No Avengers yet"
          description="Summon the first one."
          action={
            <Link to="/avengers" className={buttonClass('primary', 'sm')}>
              Open Avengers
            </Link>
          }
        />
      ) : (
        avengers.map((a) => {
          const odds = zombieLevel === null ? null : winChance(zombieLevel, a.power);
          return (
            <Row
              key={a.id}
              selected={a.id === selectedId}
              disabled={locked}
              onClick={() => onSelect(a.id)}
              art={<AvengerArt genes={a.genes} size={40} />}
              title={a.heroName}
              sub={`#${a.id} · Power ${a.power}`}
              right={odds === null ? null : <Badge tone={odds >= 60 ? 'green' : odds >= 40 ? 'warning' : 'danger'}>{odds}%</Badge>}
            />
          );
        })
      )}
    </Shell>
  );
}

export function RivalPicker({
  zombies,
  load,
  selectedId,
  locked,
  onSelect,
}: {
  zombies: Zombie[];
  load: Load;
  selectedId: number | null;
  locked: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <Shell title="Rival zombies" count={zombies.length} load={load}>
      {zombies.length === 0 ? (
        <EmptyState icon={<Skull className="size-6" />} title="No rivals yet" description="Zombies owned by other addresses appear here." />
      ) : (
        zombies.map((z) => (
          <Row
            key={z.id}
            selected={z.id === selectedId}
            disabled={locked}
            onClick={() => onSelect(z.id)}
            art={<Thumb z={z} />}
            title={z.name}
            sub={`#${z.id} · Lv ${z.level} · ${shortAddress(z.owner)}`}
            right={<Badge tone="neutral">{PVP_WIN_CHANCE}%</Badge>}
          />
        ))
      )}
    </Shell>
  );
}
