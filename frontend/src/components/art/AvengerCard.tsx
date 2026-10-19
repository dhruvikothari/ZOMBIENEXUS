import type { ReactNode } from 'react';
import { AvengerArt } from '@/components/art/AvengerArt';
import { ArtFrame } from '@/components/art/ZombieCard';
import { heroName, powerOf } from '@/lib/roster';
import type { Avenger } from '@/lib/types';

export function AvengerFront({ genes, id, selected = false, size = 190, animated = false }: { genes: bigint; id: number; selected?: boolean; size?: number; animated?: boolean }) {
  return (
    <ArtFrame tone={selected ? 'selected' : 'avenger'} label={`AVENGER #${id}`}>
      <AvengerArt genes={genes} size={size} animated={animated} />
    </ArtFrame>
  );
}

export function AvengerCard({ avenger, actions, selected = false }: { avenger: Avenger; actions?: ReactNode; selected?: boolean }) {
  const power = powerOf(avenger.genes);
  const born = new Date(avenger.birthTime * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <article className="flex min-w-0 flex-col" data-testid="avenger-card" data-avenger-id={avenger.id} aria-current={selected || undefined}>
      <AvengerFront genes={avenger.genes} id={avenger.id} selected={selected} />
      <div className="glass mt-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-display text-h3 font-bold">{heroName(avenger.genes)}</h3>
          <span className="font-mono text-xs text-fg-muted">#{avenger.id}</span>
        </div>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="font-display uppercase tracking-[0.08em] text-fg-muted">Power</dt>
            <dd className="flex items-center gap-2 font-display font-bold text-purple">
              <span className="flex gap-[3px]" aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={`h-2 w-1.5 rounded-sm ${i < power ? 'bg-purple' : 'bg-line-strong'}`} />
                ))}
              </span>
              <span>{power}/10</span>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="font-display uppercase tracking-[0.08em] text-fg-muted">Genes</dt>
            <dd className="break-all text-right font-mono text-fg">{avenger.genes.toString()}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="font-display uppercase tracking-[0.08em] text-fg-muted">Born</dt>
            <dd className="text-right text-fg">{born}</dd>
          </div>
        </dl>
        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </article>
  );
}
