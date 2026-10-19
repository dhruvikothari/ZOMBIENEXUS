import { CircleCheck, CircleX, Minus, RefreshCw, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EXPECTED_CHAIN_ID } from '@/lib/deployment';
import type { Deployment } from '@/lib/types';
import { useWallet } from '@/lib/wallet';
import { Section } from './Section';
import { useChainChecks, type Check } from './useChainChecks';

function useWalletChecks(): Check[] {
  const { status, chainId, reason } = useWallet();
  const na = (id: string, label: string, detail: string): Check => ({ id, label, status: 'na', detail });

  const onChain = chainId === EXPECTED_CHAIN_ID;
  const chain: Check =
    chainId === null
      ? na('wallet-chain', `Wallet on chain ${EXPECTED_CHAIN_ID}`, status === 'no-metamask' ? 'MetaMask not detected' : 'Connect a wallet to check')
      : { id: 'wallet-chain', label: `Wallet on chain ${EXPECTED_CHAIN_ID}`, status: onChain ? 'pass' : 'fail', detail: `wallet is on chain ${chainId}` };

  const label = 'Wallet RPC sees the contract';
  const rpc: Check =
    status === 'ready'
      ? { id: 'wallet-rpc', label, status: 'pass', detail: "MetaMask's RPC returns contract code" }
      : status === 'wrong-network' && reason === 'rpc'
        ? { id: 'wallet-rpc', label, status: 'fail', detail: "MetaMask's chain 1337 entry points at a different RPC" }
        : na('wallet-rpc', label, onChain ? 'Not checked yet' : 'Needs the wallet on chain 1337');
  return [chain, rpc];
}

const BADGE = {
  pass: { tone: 'green', icon: <CircleCheck />, text: 'PASS' },
  fail: { tone: 'danger', icon: <CircleX />, text: 'FAIL' },
  na: { tone: 'neutral', icon: <Minus />, text: 'N/A' },
} as const;

export function Diagnostics({ dep }: { dep: Deployment | null }) {
  const { checks, running, rerun } = useChainChecks(dep);
  const walletChecks = useWalletChecks();
  const all = checks ? [...checks.slice(0, 5), ...walletChecks, ...checks.slice(5)] : null;
  const failing = all?.filter((c) => c.status === 'fail').length ?? 0;

  return (
    <Section
      icon={<Stethoscope />}
      title="Diagnostics"
      action={
        <div className="flex items-center gap-3">
          {all && (
            <span aria-live="polite">
              <Badge tone={failing ? 'danger' : 'green'}>{failing ? `${failing} failing` : 'All passing'}</Badge>
            </span>
          )}
          <Button variant="secondary" size="sm" icon={<RefreshCw className="size-4" aria-hidden="true" />} loading={running && !!all} onClick={rerun}>
            Re-run
          </Button>
        </div>
      }
    >
      {all ? (
        <ul>
          {all.map((c) => {
            const b = BADGE[c.status];
            return (
              <li key={c.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[5.5rem_minmax(0,16rem)_minmax(0,1fr)]">
                <Badge tone={b.tone} icon={b.icon}>
                  {b.text}
                </Badge>
                <span className="font-display font-bold">{c.label}</span>
                <span className={`col-span-2 min-w-0 break-words font-mono text-[0.8125rem] sm:col-span-1 ${c.status === 'fail' ? 'text-danger' : 'text-fg-muted'}`}>{c.detail}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Running diagnostics">
          {Array.from({ length: 11 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      )}
    </Section>
  );
}
