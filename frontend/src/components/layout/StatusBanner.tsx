import type { ReactNode } from 'react';
import { LoaderCircle, TriangleAlert, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { mapError } from '@/lib/errors';
import { useWallet } from '@/lib/wallet';
import type { WalletStatus } from '@/lib/types';

const DEFAULT_RPC = 'http://127.0.0.1:7545';

const code = (text: string) => <code className="rounded bg-raised px-1.5 py-0.5 font-mono text-[0.8125rem] text-fg">{text}</code>;

/** SPEC 6 copy, shared with WalletModal. Null when the wallet is ready. */
export function statusMessage(w: { status: WalletStatus; chainId: number | null; reason: string | null }, rpcUrl: string = DEFAULT_RPC): ReactNode {
  switch (w.status) {
    case 'rpc-down':
      return <>Local chain offline at {rpcUrl}. Start it with {code('npm run demo')}.</>;
    case 'no-contract':
      return <>Contracts not found on this chain. Run {code('npm run demo')} (deploys and seeds automatically).</>;
    case 'no-metamask':
      return 'MetaMask not detected in this browser. You can still browse the Gallery and Activity.';
    case 'disconnected':
      return 'Connect MetaMask to command your army.';
    case 'connecting':
      return 'Waiting for MetaMask…';
    case 'wrong-network':
      return w.reason === 'rpc'
        ? `MetaMask's chain 1337 entry does not point at ${rpcUrl}. Edit that network's RPC URL in MetaMask.`
        : `MetaMask is on chain ${w.chainId ?? 'unknown'}. ZOMBIENEXUS runs on Ganache (chain 1337).`;
    case 'ready':
      return null;
  }
}

const TONE = {
  danger: 'border-danger/40 bg-danger/10 text-danger',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info: 'border-info/40 bg-info/10 text-info',
} as const;

const ICON_TONE = { danger: 'text-danger', warning: 'text-warning', info: 'text-info' } as const;

const KIND: Record<Exclude<WalletStatus, 'ready'>, keyof typeof TONE> = {
  'rpc-down': 'danger',
  'no-contract': 'danger',
  'no-metamask': 'warning',
  'wrong-network': 'warning',
  disconnected: 'info',
  connecting: 'info',
};

export function StatusBanner({ compact = false }: { compact?: boolean }) {
  const w = useWallet();
  const { toast } = useToast();
  if (w.status === 'ready') return null;

  const tone = KIND[w.status];
  const message = statusMessage(w, w.deployment?.rpcUrl ?? DEFAULT_RPC);
  const Icon = w.status === 'connecting' ? LoaderCircle : w.status === 'disconnected' ? Wallet : TriangleAlert;

  const run = (fn: () => Promise<void>) => {
    fn().catch((e: unknown) => toast({ kind: 'error', title: 'Wallet request failed', description: mapError(e).message }));
  };

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex flex-col gap-3 rounded-xl border sm:flex-row sm:items-center sm:justify-between ${compact ? 'px-3 py-2' : 'px-4 py-3'} ${TONE[tone]}`}
    >
      <p className="flex items-start gap-3 text-fg">
        <Icon className={`mt-0.5 size-5 shrink-0 ${w.status === 'connecting' ? 'animate-spin' : ''} ${ICON_TONE[tone]}`} aria-hidden="true" />
        <span className={compact ? 'text-sm' : ''}>{message}</span>
      </p>
      {w.status === 'disconnected' && (
        <Button size="sm" onClick={() => run(w.connect)}>
          Connect
        </Button>
      )}
      {w.status === 'wrong-network' && w.reason !== 'rpc' && (
        <Button size="sm" variant="secondary" onClick={() => run(w.switchNetwork)}>
          Switch network
        </Button>
      )}
    </div>
  );
}
