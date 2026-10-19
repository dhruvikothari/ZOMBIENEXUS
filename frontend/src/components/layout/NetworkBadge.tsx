import { useWallet } from '@/lib/wallet';

export function NetworkBadge() {
  const { status, deployment } = useWallet();

  let label = deployment?.networkName ?? 'Ganache 1337';
  let tone = 'border-green/30 bg-green/10 text-green';
  if (status === 'rpc-down') {
    label = 'Chain offline';
    tone = 'border-danger/40 bg-danger/10 text-danger';
  } else if (status === 'wrong-network') {
    label = 'Wrong network';
    tone = 'border-warning/40 bg-warning/10 text-warning';
  } else if (status === 'no-contract') {
    label = 'No contracts';
    tone = 'border-warning/40 bg-warning/10 text-warning';
  }

  return (
    <span role="status" title={label} className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 font-display text-label font-bold whitespace-nowrap max-sm:px-3.5 ${tone}`}>
      <span className="size-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" aria-hidden="true" />
      <span className="max-sm:sr-only">{label}</span>
    </span>
  );
}
