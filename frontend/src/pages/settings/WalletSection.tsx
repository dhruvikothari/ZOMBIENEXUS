import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Address } from '@/components/ui/Address';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { mapError } from '@/lib/errors';
import { formatEth } from '@/lib/format';
import type { WalletStatus } from '@/lib/types';
import { useWallet } from '@/lib/wallet';
import { Row, Section } from './Section';

const STATUS: Record<WalletStatus, { label: string; tone: BadgeTone }> = {
  ready: { label: 'Connected', tone: 'green' },
  connecting: { label: 'Connecting', tone: 'info' },
  disconnected: { label: 'Not connected', tone: 'neutral' },
  'wrong-network': { label: 'Wrong network', tone: 'warning' },
  'no-metamask': { label: 'MetaMask not detected', tone: 'neutral' },
  'no-contract': { label: 'Contracts not found', tone: 'danger' },
  'rpc-down': { label: 'Chain offline', tone: 'danger' },
};

export function WalletSection() {
  const w = useWallet();
  const { toast } = useToast();
  const [busy, setBusy] = useState<'connect' | 'switch' | null>(null);
  const s = STATUS[w.status];

  async function run(kind: 'connect' | 'switch', fn: () => Promise<void>) {
    setBusy(kind);
    try {
      await fn();
    } catch (err) {
      toast({ kind: 'error', title: kind === 'connect' ? 'Could not connect' : 'Could not switch network', description: mapError(err).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Section icon={<Wallet />} title="Wallet" action={<Badge tone={s.tone}>{s.label}</Badge>}>
      <dl>
        <Row label="Provider">{w.providerName ?? <span className="text-fg-muted">None</span>}</Row>
        <Row label="Address">{w.address ? <Address address={w.address} short={false} copy /> : <span className="text-fg-muted">Not connected</span>}</Row>
        <Row label="Chain ID">{w.chainId !== null ? <span className="font-mono">{w.chainId}</span> : <span className="text-fg-muted">Unknown</span>}</Row>
        <Row label="Balance">{w.balance !== null ? <span className="font-mono">{formatEth(w.balance)} ETH</span> : <span className="text-fg-muted">Unknown</span>}</Row>
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        {!w.address && w.status !== 'no-metamask' && (
          <Button loading={busy === 'connect' || w.status === 'connecting'} onClick={() => run('connect', w.connect)}>
            Connect MetaMask
          </Button>
        )}
        {w.status === 'wrong-network' && (
          <Button variant="gold" loading={busy === 'switch'} onClick={() => run('switch', w.switchNetwork)}>
            Switch network
          </Button>
        )}
        {w.address && (
          <Button variant="secondary" onClick={w.disconnect}>
            Disconnect app session
          </Button>
        )}
      </div>
      {w.address && <p className="mt-3 text-sm text-fg-muted">This only signs the app out. MetaMask permission stays granted; revoke it inside MetaMask.</p>}
      {w.status === 'no-metamask' && <p className="mt-3 text-sm text-fg-muted">Install or unlock MetaMask in this browser. You can still browse the Gallery and Activity.</p>}
    </Section>
  );
}
