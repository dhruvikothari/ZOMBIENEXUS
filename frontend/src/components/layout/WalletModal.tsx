import { useState } from 'react';
import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Address } from '@/components/ui/Address';
import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { statusMessage } from '@/components/layout/StatusBanner';
import { mapError } from '@/lib/errors';
import { formatEth } from '@/lib/format';
import { useWallet } from '@/lib/wallet';
import type { WalletStatus } from '@/lib/types';

const BADGE: Record<WalletStatus, { tone: BadgeTone; label: string }> = {
  ready: { tone: 'green', label: 'Connected' },
  'wrong-network': { tone: 'warning', label: 'Wrong network' },
  'rpc-down': { tone: 'danger', label: 'Chain offline' },
  'no-contract': { tone: 'danger', label: 'No contracts' },
  'no-metamask': { tone: 'warning', label: 'No MetaMask' },
  disconnected: { tone: 'neutral', label: 'Not connected' },
  connecting: { tone: 'info', label: 'Connecting' },
};

type Action = 'connect' | 'switch' | 'refresh';

export function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const w = useWallet();
  const { toast } = useToast();
  const [busy, setBusy] = useState<Action | null>(null);

  async function act(name: Action, fn: () => Promise<void>) {
    setBusy(name);
    try {
      await fn();
    } catch (e) {
      toast({ kind: 'error', title: 'Wallet request failed', description: mapError(e).message });
    } finally {
      setBusy(null);
    }
  }

  const connected = w.address !== null && (w.status === 'ready' || w.status === 'wrong-network');
  const badge = BADGE[w.status];
  const message = statusMessage(w, w.deployment?.rpcUrl);

  const rows: [string, ReactNode][] = connected
    ? [
        ['Address', <Address key="a" address={w.address!} short={false} copy />],
        ['Network', w.deployment?.networkName ?? 'Unknown'],
        ['Chain ID', <span key="c" className="font-mono">{w.chainId ?? 'Unknown'}</span>],
        ['Balance', <span key="b" className="font-mono">{w.balance !== null ? `${formatEth(w.balance)} ETH` : 'Unknown'}</span>],
        ['Wallet', w.providerName ?? 'Unknown'],
      ]
    : [];

  const footer = connected ? (
    <>
      <Button variant="ghost" onClick={() => { w.disconnect(); onClose(); }}>
        Disconnect app session
      </Button>
      <Button variant="secondary" icon={<RefreshCw className="size-4" aria-hidden="true" />} loading={busy === 'refresh'} onClick={() => act('refresh', w.refresh)}>
        Refresh
      </Button>
      {w.status === 'wrong-network' && w.reason !== 'rpc' && (
        <Button onClick={() => { onClose(); void w.switchNetwork(); }}>
          Switch network
        </Button>
      )}
    </>
  ) : w.status === 'disconnected' ? (
    <Button onClick={() => { onClose(); void w.connect(); }}>
      Connect MetaMask
    </Button>
  ) : undefined;

  return (
    <Modal open={open} onClose={onClose} title="Wallet" footer={footer}>
      <div className="space-y-5">
        <Badge tone={badge.tone}>{badge.label}</Badge>

        {message && <p className="text-fg-muted">{message}</p>}

        {connected && (
          <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-display text-label font-medium uppercase tracking-[0.08em] text-fg-muted">{k}</dt>
                <dd className="min-w-0 break-words">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {connected && <p className="text-sm text-fg-muted">Disconnecting only signs this page out. MetaMask permission stays granted.</p>}
      </div>
    </Modal>
  );
}
