import { Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { AvengerCard } from '@/components/art/AvengerCard';
import { StatusBanner } from '@/components/layout/StatusBanner';
import { Button, buttonClass } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAvengers } from '@/lib/hooks';
import { AvengersHeader } from './avengers/AvengersHeader';
import { PowerLegend } from './avengers/PowerLegend';
import { SummonPanel } from './avengers/SummonPanel';

export default function AvengersPage() {
  const { data, loading, error, refetch } = useAvengers();
  const [newId, setNewId] = useState<number | null>(null);

  // Newest first so a fresh summon is visible without scrolling.
  const avengers = data ? [...data].reverse() : [];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <StatusBanner />
      <AvengersHeader />

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="lg:sticky lg:top-24">
          <SummonPanel
            onSummoned={(id) => {
              setNewId(id);
              refetch();
            }}
          />
        </aside>

        <section aria-labelledby="roster-title" className="flex min-w-0 flex-col gap-6 lg:gap-8">
          <h2 id="roster-title" className="font-display text-h2 text-fg">
            Roster{data ? <span className="ml-2 text-fg-muted">{data.length}</span> : null}
          </h2>

          {loading && !data ? (
            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3 lg:gap-6" aria-busy="true" aria-label="Loading Avengers">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <Skeleton rounded="xl" className="h-[26rem] w-full" />
                </li>
              ))}
            </ul>
          ) : error && !data ? (
            <div role="alert">
              <Card className="flex flex-col items-start gap-3 p-6">
                <p className="font-display text-h3 text-fg">Could not load the Avengers</p>
                <p className="text-fg-muted">{error.message}</p>
                <Button variant="secondary" onClick={refetch}>
                  Retry
                </Button>
              </Card>
            </div>
          ) : avengers.length === 0 ? (
            <EmptyState
              icon={<Shield size={32} aria-hidden />}
              title="No Avengers yet"
              description="Summon the first one."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3 lg:gap-6">
              {avengers.map((avenger, i) => (
                <motion.li
                  key={avenger.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  <AvengerCard
                    avenger={avenger}
                    selected={avenger.id === newId}
                    actions={
                      <>
                        <Link to={`/battle?mode=avengers&avenger=${avenger.id}`} className={buttonClass('primary', 'sm')}>
                          Battle
                        </Link>
                        <Link to={`/create?tab=infect&avenger=${avenger.id}`} className={buttonClass('secondary', 'sm')}>
                          Infect
                        </Link>
                      </>
                    }
                  />
                </motion.li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <PowerLegend />
    </div>
  );
}
