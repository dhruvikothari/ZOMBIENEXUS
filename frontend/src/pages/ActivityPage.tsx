import { Activity, Info, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StatusBanner } from '@/components/layout/StatusBanner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHead } from '@/lib/chain';
import { useActivity } from '@/lib/hooks';
import { useWallet } from '@/lib/wallet';
import { ActivityFilters } from './activity/ActivityFilters';
import { ActivityRow } from './activity/ActivityRow';
import { FILTERS, matchesFilter, type FilterId } from './activity/eventMeta';

export default function ActivityPage() {
  const { address, deployment } = useWallet();
  const head = useHead();
  const { data, loading, error, refetch } = useActivity();
  const [filter, setFilter] = useState<FilterId>('all');

  const counts = useMemo(() => {
    if (!data) return null;
    return Object.fromEntries(FILTERS.map((f) => [f.id, data.filter((i) => matchesFilter(i, f.id, address)).length])) as Record<FilterId, number>;
  }, [data, address]);
  const visible = useMemo(() => (data ?? []).filter((i) => matchesFilter(i, filter, address)), [data, filter, address]);

  const since = deployment ? `block ${deployment.deployedAtBlock}` : 'the deployment block';

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <StatusBanner />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-label font-medium uppercase tracking-[0.08em] text-green">On-chain event feed</p>
          <h1 className="mt-1 font-display text-h1 font-bold">Activity</h1>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw className="size-4" aria-hidden="true" />} loading={loading && !!data} onClick={refetch}>
          Refresh
        </Button>
      </header>

      <ActivityFilters value={filter} counts={counts} onChange={setFilter} />

      {loading && !data ? (
        <ul className="flex flex-col gap-3" aria-busy="true" aria-label="Loading activity">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton rounded="xl" className="h-[7.5rem] w-full" />
            </li>
          ))}
        </ul>
      ) : error && !data ? (
        <div role="alert">
          <Card className="flex flex-col items-start gap-3 p-6">
            <p className="font-display text-h3 font-bold">Could not load activity</p>
            <p className="text-fg-muted">{error.message}</p>
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </Card>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Activity aria-hidden="true" />}
          title="No events yet."
          description={
            data && data.length > 0
              ? filter === 'mine' && !address
                ? 'Connect MetaMask to see the events you caused or were part of.'
                : 'No events match this filter.'
              : 'Create a zombie or summon an Avenger and it will show up here.'
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((item) => (
            <ActivityRow key={item.key} item={item} headTs={head?.timestamp ?? null} />
          ))}
        </ul>
      )}

      <p className="flex items-start gap-2 text-sm text-fg-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Contract events indexed from this local chain since {since}. Not a full transaction history; Ganache transactions are not on Etherscan.
        </span>
      </p>
    </div>
  );
}
