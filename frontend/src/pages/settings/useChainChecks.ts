import { useEffect, useState } from 'react';
import { getReadProvider, useHead } from '@/lib/chain';
import { avengerRead, zombieRead } from '@/lib/contracts';
import { EXPECTED_CHAIN_ID } from '@/lib/deployment';
import { formatDuration, formatEth, shortAddress } from '@/lib/format';
import type { Deployment } from '@/lib/types';

export type Check = { id: string; label: string; status: 'pass' | 'fail' | 'na'; detail: string };

const reason = (e: unknown) => {
  const m = e instanceof Error ? ((e as { shortMessage?: string }).shortMessage ?? e.message) : String(e);
  return m.length > 140 ? `${m.slice(0, 140)}…` : m;
};

async function check(id: string, label: string, fn: () => Promise<string>): Promise<Check> {
  try {
    return { id, label, status: 'pass', detail: await fn() };
  } catch (e) {
    return { id, label, status: 'fail', detail: reason(e) };
  }
}

// Order matters: Diagnostics inserts the two wallet checks after the first five.
function runChainChecks(dep: Deployment): Promise<Check[]> {
  const provider = getReadProvider(dep);
  const zombies = zombieRead(dep);
  const avengers = avengerRead(dep);
  const hasCode = async (address: string) => {
    if ((await provider.getCode(address)) === '0x') throw new Error(`no contract code at ${shortAddress(address)}`);
    return shortAddress(address);
  };

  return Promise.all([
    check('rpc', 'RPC reachable', async () => `${dep.rpcUrl} · block ${await provider.getBlockNumber()}`),
    check('chain', `Chain ID ${EXPECTED_CHAIN_ID}`, async () => {
      const id = Number(BigInt(await provider.send('eth_chainId', [])));
      if (id !== EXPECTED_CHAIN_ID) throw new Error(`chain is ${id}`);
      return `chain ${id}`;
    }),
    check('code-zombie', 'Code at ZombieOwnership', () => hasCode(dep.contracts.ZombieOwnership.address)),
    check('code-avenger', 'Code at AvengerContract', () => hasCode(dep.contracts.AvengerContract.address)),
    check('wiring', 'avengerContract() wiring', async () => {
      const wired: string = await zombies.avengerContract();
      if (wired.toLowerCase() !== dep.contracts.AvengerContract.address.toLowerCase()) throw new Error(`points at ${shortAddress(wired)}`);
      return 'points at AvengerContract';
    }),
    check('fee', 'levelUpFee()', async () => `${formatEth(await zombies.levelUpFee())} ETH`),
    check('zombies', 'getZombieCount()', async () => String(await zombies.getZombieCount())),
    check('avengers', 'totalAvengers()', async () => String(await avengers.totalAvengers())),
    check('block', 'Latest block and chain time', async () => {
      const b = await provider.getBlock('latest');
      if (!b) throw new Error('no block returned');
      const ahead = b.timestamp - Math.floor(Date.now() / 1000);
      const drift = ahead > 3600 ? ` (${formatDuration(ahead)} ahead of your clock)` : '';
      return `#${b.number} · ${new Date(b.timestamp * 1000).toISOString()}${drift}`;
    }),
  ]);
}

// Re-runs on every new head, on dep change and on demand; keeps old results meanwhile.
export function useChainChecks(dep: Deployment | null) {
  const blockNumber = useHead()?.blockNumber ?? null;
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [running, setRunning] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!dep) return;
    let cancelled = false;
    setRunning(true);
    void runChainChecks(dep).then((r) => {
      if (cancelled) return;
      setChecks(r);
      setRunning(false);
    });
    return () => {
      cancelled = true;
    };
  }, [dep, blockNumber, nonce]);

  return { checks, running, rerun: () => setNonce((n) => n + 1) };
}
