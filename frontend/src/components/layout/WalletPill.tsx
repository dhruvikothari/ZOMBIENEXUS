import { useState } from 'react';
import { LoaderCircle, Wallet } from 'lucide-react';
import { WalletModal } from '@/components/layout/WalletModal';
import { formatEth, shortAddress } from '@/lib/format';
import { useWallet } from '@/lib/wallet';

export function WalletPill() {
  const { status, address, balance } = useWallet();
  const [open, setOpen] = useState(false);

  const showAddress = address !== null && (status === 'ready' || status === 'wrong-network');
  const tone =
    status === 'ready'
      ? 'border-green/40 bg-panel text-fg hover:border-green hover:shadow-glow-green'
      : status === 'wrong-network'
        ? 'border-warning/50 bg-warning/10 text-warning hover:border-warning'
        : status === 'rpc-down' || status === 'no-contract'
          ? 'border-danger/40 bg-danger/10 text-danger hover:border-danger'
          : status === 'disconnected'
            ? 'border-transparent bg-green text-on-accent hover:shadow-glow-green hover:brightness-110'
            : 'border-line-strong bg-panel text-fg-muted hover:border-fg-faint';

  const label = showAddress ? shortAddress(address) : status === 'connecting' ? 'Connecting' : 'Connect';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={showAddress ? `Wallet ${address}` : 'Connect wallet'}
        className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 font-display text-sm font-bold whitespace-nowrap transition-[box-shadow,border-color,filter] duration-200 ${tone}`}
      >
        {status === 'connecting' ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Wallet className="size-4" aria-hidden="true" />}
        <span className={showAddress ? 'font-mono text-[0.8125rem]' : ''}>{label}</span>
        {status === 'ready' && balance !== null && (
          <span className="border-l border-line pl-2 font-mono text-[0.8125rem] text-fg-muted max-sm:hidden">{formatEth(balance)} ETH</span>
        )}
      </button>
      <WalletModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
