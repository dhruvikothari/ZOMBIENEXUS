import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronsUp, Skull, Timer, TriangleAlert, Wallet } from 'lucide-react';
import { Link } from 'react-router';
import { Address } from '@/components/ui/Address';
import { Button, buttonClass } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Stat } from '@/components/ui/Stat';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBlockTime, refreshHead } from '@/lib/chain';
import { formatEth, isReady } from '@/lib/format';
import { useZombies } from '@/lib/hooks';
import { useWallet } from '@/lib/wallet';
import { ArmyGrid, ArmySkeleton } from './ArmyGrid';
import { ArmyToolbar } from './ArmyToolbar';
import { RecentActivity } from './RecentActivity';
import { FILTERS, matchesFilter, sortZombies, type FilterKey, type SortKey } from './armyUtils';
import { rise } from './rise';

export function Army({ address }: { address: string }) {
  const { balance } = useWallet();
  const zombies = useZombies(address);
  const headTs = useBlockTime();
  const [sort, setSort] = useState<SortKey>('level-desc');
  const [filter, setFilter] = useState<FilterKey>('all');

  const list = zombies.data;
  const firstLoad = zombies.loading && !list;

  const { counts, visible, totalLevels, readyNow } = useMemo(() => {
    const all = list ?? [];
    const c = Object.fromEntries(
      FILTERS.map((f) => [f.id, all.filter((z) => matchesFilter(z, f.id, headTs)).length]),
    ) as Record<FilterKey, number>;
    return {
      counts: c,
      visible: sortZombies(all.filter((z) => matchesFilter(z, filter, headTs)), sort),
      totalLevels: all.reduce((n, z) => n + z.level, 0),
      readyNow: all.filter((z) => isReady(z, headTs)).length,
    };
  }, [list, filter, sort, headTs]);

  const refresh = () => {
    zombies.refetch();
    void refreshHead();
  };

  const skel = <Skeleton rounded="md" className="h-8 w-16" />;

  return (
    <div className="space-y-8">
      <motion.header {...rise(0)} className="space-y-2">
        <p className="text-label font-display uppercase tracking-[0.08em] text-green">Command center</p>
        <h1 className="font-display text-h1 font-bold">Welcome back, commander.</h1>
        <p className="flex flex-wrap items-center gap-x-2 text-fg-muted">
          Connected as <Address address={address} copy />
        </p>
      </motion.header>

      <motion.section {...rise(1)} aria-label="Army summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <Stat
          label="Balance"
          icon={<Wallet size={18} aria-hidden />}
          value={balance === null ? skel : formatEth(balance)}
          hint="ETH on Ganache"
        />
        <Stat
          label="Zombies owned"
          icon={<Skull size={18} aria-hidden />}
          value={firstLoad ? skel : (list?.length ?? 0)}
        />
        <Stat
          label="Total levels"
          icon={<ChevronsUp size={18} aria-hidden />}
          value={firstLoad ? skel : totalLevels}
          hint="Summed across your army"
        />
        <Stat
          label="Ready now"
          icon={<Timer size={18} aria-hidden />}
          value={firstLoad || headTs === null ? skel : readyNow}
          hint="Off cooldown at chain time"
        />
      </motion.section>

      <motion.section {...rise(2)} aria-label="Your army" className="space-y-6">
        {zombies.error && !list ? (
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <p className="flex items-center gap-3 text-fg-muted">
              <TriangleAlert size={20} className="shrink-0 text-danger" aria-hidden />
              {zombies.error.message}
            </p>
            <Button variant="secondary" onClick={zombies.refetch}>
              Retry
            </Button>
          </Card>
        ) : firstLoad ? (
          <ArmySkeleton />
        ) : list && list.length === 0 ? (
          <EmptyState
            icon={<Skull size={32} aria-hidden />}
            title="No zombies yet"
            description="Every address gets one free zombie."
            action={
              <Link to="/create" className={buttonClass()}>
                Create zombie
              </Link>
            }
          />
        ) : (
          <>
            <ArmyToolbar
              sort={sort}
              onSort={setSort}
              filter={filter}
              onFilter={setFilter}
              counts={counts}
              onRefresh={refresh}
              refreshing={zombies.loading}
            />
            {visible.length === 0 ? (
              <EmptyState
                icon={<Skull size={32} aria-hidden />}
                title="No zombies match this filter"
                description="Try another filter to see the rest of your army."
                action={
                  <Button variant="secondary" onClick={() => setFilter('all')}>
                    Show all
                  </Button>
                }
              />
            ) : (
              <ArmyGrid zombies={visible} headTs={headTs} />
            )}
          </>
        )}
      </motion.section>

      <motion.div {...rise(3)}>
        <RecentActivity address={address} owned={list} />
      </motion.div>
    </div>
  );
}
