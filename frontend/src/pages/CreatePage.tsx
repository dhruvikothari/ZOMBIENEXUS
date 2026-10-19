import { Biohazard, FlaskConical } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { StatusBanner } from '@/components/layout/StatusBanner';
import { Tabs } from '@/components/ui/Tabs';
import { useWallet } from '@/lib/wallet';
import { CreateTab } from './create/CreateTab';
import { FactoryStyles, Lamp } from './create/factory';
import { InfectTab } from './create/InfectTab';

const TABS = [
  { id: 'create', label: 'Create', icon: <FlaskConical className="h-4 w-4" /> },
  { id: 'infect', label: 'Infect', icon: <Biohazard className="h-4 w-4" /> },
];

export default function CreatePage() {
  const [params, setParams] = useSearchParams();
  const { status } = useWallet();
  const tab = params.get('tab') === 'infect' ? 'infect' : 'create';
  const chainUp = status !== 'rpc-down' && status !== 'no-contract';

  const select = (id: string) =>
    setParams(
      (prev) => {
        if (id !== 'infect') return new URLSearchParams();
        const next = new URLSearchParams(prev);
        next.set('tab', 'infect');
        return next;
      },
      { replace: true },
    );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <FactoryStyles />
      <StatusBanner />

      <header className="relative overflow-hidden rounded-xl border border-line bg-panel/60 p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to right, black, transparent 85%)',
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-h1 font-bold">Zombie Factory</h1>
            <p className="mt-1 max-w-xl text-fg-muted">
              {tab === 'create'
                ? 'Name a specimen and watch its DNA form before anything touches the chain.'
                : 'Feed a ready zombie an Avenger and mutate it into a hero.'}
            </p>
          </div>
          <ul className="flex flex-wrap gap-2 text-label text-fg-muted">
            <li className="flex items-center gap-2 rounded-full border border-line bg-bg/60 px-3 py-1.5">
              <Lamp on={chainUp} /> {chainUp ? 'Chain online' : 'Chain offline'}
            </li>
            <li className="flex items-center gap-2 rounded-full border border-line bg-bg/60 px-3 py-1.5">
              <Lamp on={status === 'ready'} tone="gold" /> {status === 'ready' ? 'Wallet ready' : 'Wallet not ready'}
            </li>
          </ul>
        </div>
      </header>

      <Tabs tabs={TABS} value={tab} onChange={select} />

      <div role="tabpanel" aria-label={tab === 'create' ? 'Create' : 'Infect'}>
        {tab === 'create' ? (
          <CreateTab onInfect={() => select('infect')} />
        ) : (
          <InfectTab onCreate={() => select('create')} />
        )}
      </div>
    </div>
  );
}
