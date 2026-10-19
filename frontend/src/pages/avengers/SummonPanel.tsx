import { RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AvengerArt } from '@/components/art/AvengerArt';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { TxStepper } from '@/components/ui/TxStepper';
import { avengerWrite, parseReceipt } from '@/lib/contracts';
import { heroName, powerOf, randomGenes } from '@/lib/roster';
import { useTx } from '@/lib/tx';
import { useWallet } from '@/lib/wallet';

const UINT256_LIMIT = 2n ** 256n;

// Returns the parsed genes, or the reason the text is not valid.
function parseGenes(text: string): { genes: bigint } | { error: string } {
  const t = text.trim();
  if (t === '') return { error: 'Enter digits, or reroll.' };
  if (!/^\d+$/.test(t)) return { error: 'Digits only (0-9).' };
  const genes = BigInt(t);
  if (genes >= UINT256_LIMIT) return { error: 'Too large: genes must fit in 256 bits.' };
  return { genes };
}

const WALLET_HINT: Record<string, string> = {
  'no-metamask': 'MetaMask is not detected in this browser.',
  disconnected: 'Connect MetaMask to summon.',
  connecting: 'Waiting for MetaMask...',
  'wrong-network': 'Switch MetaMask to Ganache (chain 1337) to summon.',
  'no-contract': 'Contracts not found on this chain.',
  'rpc-down': 'Local chain is offline.',
};

export function SummonPanel({ onSummoned }: { onSummoned: (id: number | null) => void }) {
  const { status, deployment } = useWallet();
  const { toast } = useToast();
  const tx = useTx();
  const [text, setText] = useState(() => randomGenes().toString());

  const parsed = parseGenes(text);
  const genes = 'genes' in parsed ? parsed.genes : null;
  const walletReady = status === 'ready' && deployment !== null;

  const reroll = () => {
    setText(randomGenes().toString());
    if (!tx.busy) tx.reset();
  };

  const summon = async () => {
    if (genes === null || !deployment) return;
    const receipt = await tx.run('Summon Avenger', async (signer) =>
      avengerWrite(deployment, signer).createAvenger(genes),
    );
    if (!receipt) return;
    const birth = parseReceipt(deployment, receipt).find((e) => e.name === 'Birth');
    const id = birth ? Number(birth.args.avengerId) : null;
    toast({
      kind: 'success',
      title: `${heroName(genes)} summoned`,
      description: id === null ? undefined : `Avenger #${id} joined the roster with power ${powerOf(genes)}.`,
    });
    onSummoned(id);
  };

  return (
    <Card className="p-5 lg:p-6">
      <h2 className="font-display text-h2 text-fg">Summon an Avenger</h2>
      <p className="mt-1 text-fg-muted">
        The genes decide everything: hero type and power. Roll them or type your own.
      </p>

      <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-line bg-panel-2 p-5">
        {genes === null ? (
          <div className="flex h-[200px] w-[180px] items-center justify-center text-center text-fg-muted">
            Valid genes show a live preview here.
          </div>
        ) : (
          <>
            <AvengerArt genes={genes} size={180} animated />
            <div className="text-center">
              <p className="font-display text-h3 text-fg" aria-live="polite">
                {heroName(genes)}
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <Badge tone="purple">Power {powerOf(genes)} / 10</Badge>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-5">
        <Input
          label="Genes"
          mono
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (!tx.busy) tx.reset();
          }}
          error={'error' in parsed ? parsed.error : undefined}
          hint="Any whole number from 0. Hero = genes mod 6. Power = last digit + 1."
          disabled={tx.busy}
        />
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          variant="secondary"
          icon={<RefreshCw size={16} aria-hidden />}
          onClick={reroll}
          disabled={tx.busy}
        >
          Reroll
        </Button>
        <Button
          fullWidth
          icon={<Sparkles size={16} aria-hidden />}
          loading={tx.busy}
          disabled={genes === null || !walletReady || tx.busy}
          onClick={summon}
          title={walletReady ? undefined : WALLET_HINT[status]}
        >
          Summon
        </Button>
      </div>
      {!walletReady && <p className="mt-3 text-label text-fg-muted">{WALLET_HINT[status] ?? 'Wallet not ready.'}</p>}

      {tx.state.status !== 'idle' && (
        <div className="mt-4">
          <TxStepper state={tx.state} compact />
        </div>
      )}
    </Card>
  );
}
