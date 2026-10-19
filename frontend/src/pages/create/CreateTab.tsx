import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CircleCheck, Dna, FlaskConical, Skull } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TxStepper } from '@/components/ui/TxStepper';
import { ZombieArt } from '@/components/art/ZombieArt';
import { previewDna, rarityOf } from '@/lib/dna';
import { parseReceipt, zombieWrite } from '@/lib/contracts';
import { useTx } from '@/lib/tx';
import { useWallet } from '@/lib/wallet';
import { DnaDigits, DnaLegend } from './DnaStrip';
import { Vat, Lamp } from './factory';
import { LinkButton } from './LinkButton';
import { CreateReveal } from './Reveal';
import { useOwnedCount } from './useOwnedCount';

type Created = { id: number; name: string; dna: bigint; matched: boolean };

const NOT_READY: Record<string, string> = {
  disconnected: 'Connect MetaMask to claim your free zombie.',
  connecting: 'Waiting for MetaMask…',
  'wrong-network': 'Switch MetaMask to Ganache (chain 1337) to create.',
};

const RARITY_TONE = { common: 'neutral', rare: 'gold', hero: 'purple' } as const;

export function CreateTab({ onInfect }: { onInfect: () => void }) {
  const { deployment, address, status } = useWallet();
  const owned = useOwnedCount(deployment, address);
  const tx = useTx();
  const [name, setName] = useState('');
  const [created, setCreated] = useState<Created | null>(null);

  const trimmed = name.trim();
  const len = [...trimmed].length;
  const valid = len >= 1 && len <= 32;
  const nameError = name.length > 0 ? (len === 0 ? 'Enter a name.' : len > 32 ? 'Names are 1 to 32 characters.' : undefined) : undefined;
  const preview = useMemo(() => (trimmed ? previewDna(trimmed) : null), [trimmed]);

  const ready = status === 'ready';
  const alreadyOwns = ready && owned.checked && owned.count !== null && owned.count > 0;
  const checking = ready && !owned.checked;
  const canCreate = ready && valid && !alreadyOwns && !checking && !tx.busy;
  const hint = !ready ? (NOT_READY[status] ?? 'Wallet not ready.') : checking ? 'Checking eligibility…' : !valid ? 'Enter a name to continue.' : '';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canCreate || !deployment) return;
    const submitted = trimmed;
    const receipt = await tx.run('Create zombie', (signer) => zombieWrite(deployment, signer).createRandomZombie(submitted));
    if (!receipt) return;
    const ev = parseReceipt(deployment, receipt).find((x) => x.name === 'NewZombie');
    if (!ev) return;
    const dna = BigInt(ev.args.dna);
    setCreated({ id: Number(ev.args.zombieId), name: ev.args.name, dna, matched: dna === previewDna(submitted) });
  }

  const shownDna = created ? created.dna : preview;
  const rarity = shownDna === null ? null : rarityOf(shownDna);
  const artLabel = created ? `${created.name}, new zombie` : `Preview of ${trimmed || 'unnamed'} zombie`;

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
      <section aria-label="Specimen vat" className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <Vat label="Vat 01" busy={tx.busy} minHeight={320}>
          {created ? (
            <CreateReveal dna={created.dna} size={220} label={artLabel} />
          ) : preview === null ? (
            <div className="relative flex flex-col items-center">
              <div className="opacity-20 grayscale">
                <ZombieArt dna={previewDna('')} size={200} label="Empty vat" />
              </div>
              <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-h3 text-fg-muted">
                Name a specimen
                <span className="mt-1 block text-body font-normal text-fg-muted">The vat fills as you type.</span>
              </p>
            </div>
          ) : (
            <ZombieArt dna={preview} size={220} animated label={artLabel} />
          )}
        </Vat>
      </section>

      <div className="lg:col-start-1 lg:row-start-1">
        {created ? (
          <Card glow="green" className="space-y-5 p-6">
            <div>
              <Badge tone="green" icon={<Skull className="h-3.5 w-3.5" />}>Alive on-chain</Badge>
              <h2 className="mt-3 font-display text-h2">{created.name} is alive</h2>
              <p className="mt-1 text-fg-muted">Zombie #{created.id} is now in your army, cooling down for 24 hours.</p>
            </div>
            <p className={`flex items-center gap-2 text-body ${created.matched ? 'text-green' : 'text-warning'}`}>
              <CircleCheck className="h-5 w-5 shrink-0" aria-hidden />
              {created.matched ? 'Preview matched on-chain DNA' : 'Preview differed from on-chain DNA'}
            </p>
            <LinkButton to={`/zombie/${created.id}`} icon={<Skull className="h-4 w-4" />}>
              Open zombie #{created.id}
            </LinkButton>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={submit} className="space-y-5" noValidate>
              <div>
                <h2 className="font-display text-h2">Create your zombie</h2>
                <p className="mt-1 text-fg-muted">The name is hashed into DNA, so the same name always grows the same zombie.</p>
              </div>
              <Input
                label="Zombie name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={nameError}
                hint={`${len}/32 characters`}
                autoComplete="off"
                spellCheck={false}
                disabled={tx.busy}
              />
              <div className="flex items-start gap-2.5 rounded-lg border border-line bg-panel-2 p-3 text-body" role="status">
                <span className="mt-1.5">
                  <Lamp on={ready && !alreadyOwns && !checking} tone="green" />
                </span>
                {alreadyOwns ? (
                  <div className="space-y-2">
                    <p className="text-fg">One free zombie per address. This wallet already owns {owned.count}.</p>
                    <div className="flex flex-wrap gap-2">
                      <Link to="/" className="text-green underline-offset-4 hover:underline">View your army</Link>
                      <button type="button" onClick={onInfect} className="text-gold underline-offset-4 hover:underline">
                        Infect one with an Avenger
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-fg-muted">
                    {ready ? (checking ? 'Checking this wallet…' : 'Your free zombie is available.') : (NOT_READY[status] ?? 'Wallet not ready.')}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" fullWidth loading={tx.busy} disabled={!canCreate} title={hint} icon={<FlaskConical className="h-4 w-4" />}>
                Create zombie
              </Button>
              {tx.state.status !== 'idle' && <TxStepper state={tx.state} />}
            </form>
          </Card>
        )}
      </div>

      <Card className="space-y-5 p-6 lg:col-start-1 lg:row-start-2 lg:self-start">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-h3">
            <Dna className="h-5 w-5 text-green" aria-hidden />
            Genome readout
          </h2>
          {rarity && <Badge tone={RARITY_TONE[rarity]}>{rarity}</Badge>}
        </div>
        <DnaDigits dna={shownDna} large />
        <DnaLegend dna={shownDna} />
        <p className="border-t border-line pt-4 text-label text-fg-muted">
          DNA = keccak256(name) mod 10^16 with the last two digits zeroed, the same math as the contract. A leading pair of 90 or more makes a rare.
        </p>
      </Card>
    </div>
  );
}
