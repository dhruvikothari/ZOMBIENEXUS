import { useState } from 'react';
import type { ReactNode } from 'react';
import { Biohazard, CircleCheck, Crown, FlaskConical, Shield, Skull, Wallet } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { TxStepper } from '@/components/ui/TxStepper';
import { AvengerArt } from '@/components/art/AvengerArt';
import { ZombieArt } from '@/components/art/ZombieArt';
import { useBlockTime } from '@/lib/chain';
import { parseReceipt, zombieWrite } from '@/lib/contracts';
import { heroDna } from '@/lib/dna';
import { formatDuration, isReady } from '@/lib/format';
import { useAvengers, useZombies } from '@/lib/hooks';
import { useTx } from '@/lib/tx';
import { useWallet } from '@/lib/wallet';
import { DnaDigits } from './DnaStrip';
import { Vat } from './factory';
import { LinkButton } from './LinkButton';
import { Picker } from './Picker';
import type { PickerItem } from './Picker';
import { HeroReveal } from './Reveal';

type Born = { id: number; dna: bigint; matched: boolean; hostName: string; hostDna: bigint; hostLevel: number; avengerName: string; avengerGenes: bigint };

const ART = 140;

function Slot({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 self-center text-center text-fg-muted">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-line-strong text-fg-faint">{icon}</span>
      <span className="text-body">{text}</span>
    </div>
  );
}

// Pipe arrow between vat and vial: vertical on mobile, horizontal from sm.
function Flow({ active }: { active: boolean }) {
  const common = { stroke: 'var(--color-gold)', strokeWidth: 2, fill: 'none', opacity: active ? 1 : 0.3 };
  const flow = active ? 'fz-flow' : undefined;
  return (
    <>
      <svg aria-hidden viewBox="0 0 24 48" className="h-12 w-6 shrink-0 md:hidden">
        <path d="M12 0V40" strokeDasharray="6 6" className={flow} {...common} />
        <path d="M5 36L12 46L19 36" {...common} />
      </svg>
      <svg aria-hidden viewBox="0 0 48 24" className="hidden h-6 w-12 shrink-0 md:block">
        <path d="M0 12H40" strokeDasharray="6 6" className={flow} {...common} />
        <path d="M36 5L46 12L36 19" {...common} />
      </svg>
    </>
  );
}

export function InfectTab({ onCreate }: { onCreate: () => void }) {
  const { address } = useWallet();
  if (!address) {
    return (
      <EmptyState
        icon={<Wallet className="h-8 w-8" />}
        title="Connect to infect"
        description="Pick one of your zombies, feed it an Avenger, and read the new DNA before you sign."
      />
    );
  }
  return <InfectBody address={address} onCreate={onCreate} />;
}

function InfectBody({ address, onCreate }: { address: string; onCreate: () => void }) {
  const { deployment, status } = useWallet();
  const zombies = useZombies(address);
  const avengers = useAvengers();
  const headTs = useBlockTime();
  const tx = useTx();
  const [params, setParams] = useSearchParams();
  const [born, setBorn] = useState<Born | null>(null);

  const zParam = params.get('zombie') ?? '';
  const aParam = params.get('avenger') ?? '';
  const setParam = (key: string, value: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      return next;
    }, { replace: true });

  const host = zombies.data?.find((z) => String(z.id) === zParam) ?? null;
  const hostReady = host !== null && headTs !== null && isReady(host, headTs);
  const avenger = avengers.data?.find((a) => String(a.id) === aParam) ?? null;
  const picked = hostReady ? host : null;
  const afterDna = picked && avenger ? heroDna(picked.dna, avenger.genes) : null;

  const canInfect = status === 'ready' && afterDna !== null && !tx.busy && !born;

  async function infect() {
    if (!canInfect || !deployment || !picked || !avenger || afterDna === null) return;
    const snapshot = { hostName: picked.name, hostDna: picked.dna, hostLevel: picked.level, avengerName: avenger.heroName, avengerGenes: avenger.genes };
    const expected = afterDna;
    const receipt = await tx.run('Infect with Avenger', (signer) => zombieWrite(deployment, signer).feedOnAvenger(picked.id, avenger.id));
    if (!receipt) return;
    const ev = parseReceipt(deployment, receipt).find((x) => x.name === 'NewZombie');
    if (!ev) return;
    const dna = BigInt(ev.args.dna);
    setBorn({ id: Number(ev.args.zombieId), dna, matched: dna === expected, ...snapshot });
  }

  function again() {
    setBorn(null);
    tx.reset();
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('zombie');
      return next;
    }, { replace: true });
  }

  const zombieItems: PickerItem[] = (zombies.data ?? []).map((z) => {
    const ready = headTs !== null && isReady(z, headTs);
    return {
      value: String(z.id),
      title: `${z.name} #${z.id}`,
      sub: ready ? `Level ${z.level} · Ready` : headTs === null ? `Level ${z.level}` : `Level ${z.level} · cooling ${formatDuration(z.readyTime - headTs)}`,
      disabled: !ready,
      art: <ZombieArt dna={z.dna} level={z.level} size={46} label={`${z.name}, level ${z.level}`} />,
    };
  });
  const avengerItems: PickerItem[] = (avengers.data ?? []).map((a) => ({
    value: String(a.id),
    title: a.heroName,
    sub: `#${a.id} · Power ${a.power}`,
    art: <AvengerArt genes={a.genes} size={46} />,
  }));

  const beforeDna = born ? born.hostDna : (picked?.dna ?? null);
  const showDna = born ? born.dna : afterDna;
  const beforeName = born ? born.hostName : picked?.name;
  const avengerName = born ? born.avengerName : avenger?.heroName;
  const vialGenes = born ? born.avengerGenes : avenger?.genes;
  const busy = tx.busy;

  const pickers = (
    <Card className="space-y-6 p-6 lg:col-start-1 lg:row-start-2 lg:self-start">
      {zombies.loading && !zombies.data ? (
        <div className="space-y-2" aria-label="Loading your zombies">
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-[4.5rem]" rounded="md" />
            <Skeleton className="h-[4.5rem]" rounded="md" />
          </div>
        </div>
      ) : zombies.error ? (
        <div className="space-y-3">
          <p className="text-danger">{zombies.error.message}</p>
          <Button variant="secondary" size="sm" onClick={zombies.refetch}>Retry</Button>
        </div>
      ) : zombieItems.length === 0 ? (
        <EmptyState
          icon={<Skull className="h-8 w-8" />}
          title="No zombies to infect"
          description="Every address gets one free zombie. Create yours first."
          action={<Button onClick={onCreate} icon={<FlaskConical className="h-4 w-4" />}>Create zombie</Button>}
        />
      ) : (
        <Picker legend="1 · Host zombie (ready only)" name="infect-zombie" items={zombieItems} value={picked ? zParam : ''} onChange={(v) => setParam('zombie', v)} />
      )}
      {host && !hostReady && headTs !== null && (
        <p className="text-label text-warning">{host.name} is cooling down for {formatDuration(host.readyTime - headTs)}.</p>
      )}

      {avengers.loading && !avengers.data ? (
        <div className="space-y-2" aria-label="Loading Avengers">
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-[4.5rem]" rounded="md" />
            <Skeleton className="h-[4.5rem]" rounded="md" />
          </div>
        </div>
      ) : avengers.error ? (
        <div className="space-y-3">
          <p className="text-danger">{avengers.error.message}</p>
          <Button variant="secondary" size="sm" onClick={avengers.refetch}>Retry</Button>
        </div>
      ) : avengerItems.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="No Avengers yet"
          description="Summon the first one, then come back to infect."
          action={<LinkButton to="/avengers" variant="secondary">Open Avengers</LinkButton>}
        />
      ) : (
        <Picker legend="2 · Avenger" name="infect-avenger" tone="purple" items={avengerItems} value={avenger ? aParam : ''} onChange={(v) => setParam('avenger', v)} />
      )}
    </Card>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {pickers}

      <section aria-label="Infection chamber" className="lg:col-span-2 lg:row-start-1">
        <Card className="p-6">
          <div className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-3">
            <div className="w-full max-w-[13rem]">
              <Vat label="Host" minHeight={210} busy={busy}>
                {beforeDna !== null ? (
                  <ZombieArt dna={beforeDna} level={born ? born.hostLevel : picked?.level} size={ART} label={`${beforeName}, before infection`} />
                ) : (
                  <Slot icon={<Skull className="h-6 w-6" />} text="Choose a host" />
                )}
              </Vat>
            </div>
            <Flow active={busy || afterDna !== null} />
            <div className="flex w-28 flex-col items-center gap-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-purple/60 bg-bg/60 shadow-glow-purple">
                {vialGenes !== undefined ? <AvengerArt genes={vialGenes} size={48} /> : <Shield className="h-6 w-6 text-fg-faint" aria-hidden />}
              </span>
              <span className="font-display text-label uppercase tracking-[0.08em] text-fg-muted">{avengerName ?? 'Avenger'}</span>
            </div>
            <Flow active={busy || afterDna !== null} />
            <div className="w-full max-w-[13rem]">
              <Vat label="Hero" tone="gold" minHeight={210} busy={busy}>
                {born ? (
                  <HeroReveal dna={born.dna} size={ART} label={`New hero zombie #${born.id}`} />
                ) : afterDna !== null ? (
                  <ZombieArt dna={afterDna} level={1} size={ART} animated label="Predicted hero zombie" />
                ) : (
                  <Slot icon={<Biohazard className="h-6 w-6" />} text="Choose an Avenger" />
                )}
              </Vat>
            </div>
          </div>
        </Card>
      </section>

      <section aria-label="Result and action" className="space-y-5 lg:col-start-2 lg:row-start-2 lg:self-start">
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-h3">{born ? 'Result' : 'Before and after'}</h2>
            {showDna !== null && <Badge tone="gold" icon={<Crown className="h-3.5 w-3.5" />}>Hero</Badge>}
          </div>
          <div className="space-y-3">
            <div>
              <p className="mb-1 font-display text-label uppercase tracking-[0.08em] text-fg-muted">{beforeName ? `${beforeName} (host)` : 'Host DNA'}</p>
              <DnaDigits dna={beforeDna} />
            </div>
            <div>
              <p className="mb-1 font-display text-label uppercase tracking-[0.08em] text-fg-muted">{avengerName ? `Offspring with ${avengerName}` : 'Offspring DNA'}</p>
              <DnaDigits dna={showDna} compare={beforeDna ?? undefined} />
            </div>
          </div>
          <p className="border-t border-line pt-4 text-label text-fg-muted">
            The offspring averages the host DNA with the Avenger genes, then ends in 99. Underlined pairs changed. It is born as “NoName” at level 1, and the host goes on cooldown.
          </p>
        </Card>

        {born ? (
          <Card glow="gold" className="space-y-4 p-6">
            <h2 className="font-display text-h2">Hero zombie #{born.id} is born</h2>
            <p className={`flex items-center gap-2 text-body ${born.matched ? 'text-green' : 'text-warning'}`}>
              <CircleCheck className="h-5 w-5 shrink-0" aria-hidden />
              {born.matched ? 'Preview matched on-chain DNA' : 'Preview differed from on-chain DNA'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton to={`/zombie/${born.id}`} variant="gold" icon={<Crown className="h-4 w-4" />}>
                Open zombie #{born.id}
              </LinkButton>
              <Button variant="secondary" onClick={again}>Infect another</Button>
              <Link to="/" className="inline-flex h-11 items-center px-2 text-fg-muted underline-offset-4 hover:text-fg hover:underline">View army</Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            <Button
              variant="gold"
              size="lg"
              fullWidth
              loading={busy}
              disabled={!canInfect}
              title={status !== 'ready' ? 'Connect and switch to Ganache first.' : afterDna === null ? 'Choose a ready zombie and an Avenger.' : undefined}
              onClick={infect}
              icon={<Biohazard className="h-4 w-4" />}
            >
              {avenger ? `Infect with ${avenger.heroName}` : 'Infect'}
            </Button>
            {tx.state.status !== 'idle' && <TxStepper state={tx.state} />}
          </div>
        )}
      </section>
    </div>
  );
}
