import type { Contract } from 'ethers';
import { zombieWrite } from '@/lib/contracts';
import { useTx } from '@/lib/tx';
import type { WalletStatus } from '@/lib/types';
import { useWallet } from '@/lib/wallet';

// Why write buttons are disabled; shown as visible hint text next to the button.
const GATE: Partial<Record<WalletStatus, string>> = {
  'no-metamask': 'Install MetaMask to send transactions.',
  disconnected: 'Connect your wallet to do this.',
  connecting: 'Waiting for MetaMask…',
  'wrong-network': 'Switch MetaMask to Ganache (chain 1337).',
  'no-contract': 'Contracts not found on this chain.',
  'rpc-down': 'The local chain is offline.',
};

/** One tx lifecycle per panel. useTx().run already toasts sent/confirmed/failed; we refetch on success. */
export function useZombieAction(onDone: () => void) {
  const { status, address, deployment } = useWallet();
  const tx = useTx();
  const gate = GATE[status] ?? (deployment ? null : 'Deployment not loaded.');

  async function act(label: string, send: (c: Contract) => Promise<{ hash: string }>): Promise<boolean> {
    if (!deployment) return false;
    const receipt = await tx.run(label, (signer) => send(zombieWrite(deployment, signer)));
    if (receipt) onDone();
    return receipt !== null;
  }

  return { tx, gate, act, address };
}
