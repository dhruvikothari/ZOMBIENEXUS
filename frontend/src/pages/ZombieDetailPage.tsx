import { motion } from 'motion/react';
import { ArrowLeft, Biohazard, Lock, Skull, Swords, TriangleAlert } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ZombieCard } from '@/components/art/ZombieCard';
import { StatusBanner } from '@/components/layout/StatusBanner';
import { Button, buttonClass } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBlockTime } from '@/lib/chain';
import { isReady } from '@/lib/format';
import { useZombie } from '@/lib/hooks';
import { useWallet } from '@/lib/wallet';
import { ApprovePanel } from './detail/ApprovePanel';
import { DetailSkeleton } from './detail/DetailSkeleton';
import { DnaTable } from './detail/DnaTable';
import { LevelUpPanel } from './detail/LevelUpPanel';
import { OwnerCard } from './detail/OwnerCard';
import { RenamePanel } from './detail/RenamePanel';
import { TransferPanel } from './detail/TransferPanel';
import { rise } from './home/rise';

function Missing({ id }: { id: string | undefined }) {
  return (
    <EmptyState
      icon={<Skull aria-hidden />}
      title={`Zombie #${(id ?? '').slice(0, 24)} does not exist.`}
      description="Check the number, or head back to the army to pick a zombie."
      action={
        <Link to="/" className={buttonClass()}>
          Back to army
        </Link>
      }
    />
  );
}

function ZombieDetail({ id }: { id: number }) {
  const { address } = useWallet();
  const headTs = useBlockTime();
  const { data: zombie, error, refetch } = useZombie(id);

  if (!zombie) {
    if (error) {
      if (/no such zombie|does not exist/i.test(`${error.message} ${error.detail ?? ''}`)) {
        return (
          <>
            <h1 className="sr-only">Zombie #{id}</h1>
            <Missing id={String(id)} />
          </>
        );
      }
      return (
        <>
          <h1 className="sr-only">Zombie #{id}</h1>
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <p className="flex items-center gap-3 text-fg-muted">
              <TriangleAlert size={20} className="shrink-0 text-danger" aria-hidden />
              {error.message}
            </p>
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </Card>
        </>
      );
    }
    return (
      <>
        <h1 className="sr-only">Zombie #{id}</h1>
        <DetailSkeleton />
      </>
    );
  }

  const isOwner = !!address && zombie.owner.toLowerCase() === address.toLowerCase();
  const ready = isReady(zombie, headTs);

  const ownerActions = (
    <div className="grid w-full grid-cols-2 gap-2">
      {ready ? (
        <Link to={`/battle?mode=avengers&zombie=${id}`} className={`${buttonClass('primary', 'md', true)} gap-2`}>
          <Swords size={16} aria-hidden /> Battle
        </Link>
      ) : (
        <Button fullWidth icon={<Swords size={16} aria-hidden />} disabled title="Still cooling down">
          Battle
        </Button>
      )}
      {ready ? (
        <Link to={`/create?tab=infect&zombie=${id}`} className={`${buttonClass('secondary', 'md', true)} gap-2`}>
          <Biohazard size={16} aria-hidden /> Infect
        </Link>
      ) : (
        <Button fullWidth variant="secondary" icon={<Biohazard size={16} aria-hidden />} disabled title="Still cooling down">
          Infect
        </Button>
      )}
    </div>
  );

  return (
    <motion.div {...rise(0)} className="space-y-6">
      <h1 className="sr-only">
        {zombie.name} (zombie #{id})
      </h1>
      <ZombieCard zombie={zombie} headTs={headTs} variant="detail" actions={isOwner ? ownerActions : undefined} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="space-y-6">
          <OwnerCard zombie={zombie} headTs={headTs} isOwner={isOwner} />
          <DnaTable dna={zombie.dna} />
        </div>
        <div className="space-y-4">
          <LevelUpPanel zombie={zombie} onDone={refetch} />
          {isOwner ? (
            <>
              <RenamePanel zombie={zombie} onDone={refetch} />
              <ApprovePanel zombie={zombie} onDone={refetch} />
              <TransferPanel zombie={zombie} onDone={refetch} />
            </>
          ) : (
            <Card className="flex items-start gap-3 p-5 sm:p-6">
              <Lock size={18} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
              <p className="text-sm text-fg-muted">
                Read-only view. Only the owner can rename, approve, transfer or battle with this zombie.
              </p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ZombieDetailPage() {
  const { id } = useParams();
  const n = id !== undefined && /^\d{1,9}$/.test(id) ? Number(id) : null;
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <StatusBanner />
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-fg-muted transition-colors hover:text-fg"
      >
        <ArrowLeft size={16} aria-hidden /> Army
      </Link>
      {n === null ? (
        <>
          <h1 className="sr-only">Zombie #{id}</h1>
          <Missing id={id} />
        </>
      ) : (
        <ZombieDetail key={n} id={n} />
      )}
    </div>
  );
}
