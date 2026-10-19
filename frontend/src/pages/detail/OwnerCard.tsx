import { Timer, UserRound } from 'lucide-react';
import { Address } from '@/components/ui/Address';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDuration, isReady } from '@/lib/format';
import type { Zombie } from '@/lib/types';

type Props = { zombie: Zombie; headTs: number | null; isOwner: boolean };

export function OwnerCard({ zombie, headTs, isOwner }: Props) {
  const ready = isReady(zombie, headTs);
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-display text-h3 font-bold">Ownership</h2>
      <dl className="mt-4 space-y-4">
        <div className="flex items-start gap-3">
          <UserRound size={18} className="mt-0.5 shrink-0 text-green" aria-hidden />
          <div className="min-w-0">
            <dt className="text-label font-display uppercase tracking-[0.08em] text-fg-muted">Owner</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2">
              <Address address={zombie.owner} copy />
              {isOwner && <Badge tone="green">You</Badge>}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Timer size={18} className={`mt-0.5 shrink-0 ${ready ? 'text-green' : 'text-warning'}`} aria-hidden />
          <div>
            <dt className="text-label font-display uppercase tracking-[0.08em] text-fg-muted">Cooldown</dt>
            <dd className="mt-1 text-sm">
              {headTs === null
                ? 'Reading chain time…'
                : ready
                  ? 'Ready now. This zombie can battle or be infected.'
                  : `Cooling down. Ready in ${formatDuration(zombie.readyTime - headTs)} (chain time).`}
            </dd>
          </div>
        </div>
      </dl>
    </Card>
  );
}
