import { useCallback, useEffect, useRef, useState } from 'react';
import { EventLog } from 'ethers';
import { getReadProvider, useHead } from '@/lib/chain';
import { avengerRead, fetchAvenger, fetchZombie, zombieRead } from '@/lib/contracts';
import { loadDeployment } from '@/lib/deployment';
import { mapError } from '@/lib/errors';
import type { ActivityItem, AppError, Avenger, Deployment, Loadable, Zombie } from '@/lib/types';

const ACTIVITY_CAP = 300;

type Slot<T> = { key: string; data: T | null; error: AppError | null; loading: boolean };

// One fetch per (key, head block, refetch call). Data from a previous head is kept while refetching;
// data from a different key (other id/owner) is never shown.
function useChainData<T>(key: string, enabled: boolean, fetcher: (dep: Deployment) => Promise<T>): Loadable<T> {
  const head = useHead();
  const [slot, setSlot] = useState<Slot<T>>({ key, data: null, error: null, loading: enabled });
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const blockNumber = head?.blockNumber;

  useEffect(() => {
    if (!enabled) {
      setSlot({ key, data: null, error: null, loading: false });
      return;
    }
    let stale = false;
    setSlot((s) => (s.key === key ? { ...s, loading: true } : { key, data: null, error: null, loading: true }));
    loadDeployment()
      .then((dep) => fetcherRef.current(dep))
      .then((data) => {
        if (!stale) setSlot({ key, data, error: null, loading: false });
      })
      .catch((e) => {
        if (!stale) setSlot((s) => ({ key, data: s.key === key ? s.data : null, error: mapError(e), loading: false }));
      });
    return () => {
      stale = true;
    };
  }, [key, enabled, blockNumber, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  if (slot.key !== key) return { data: null, error: null, loading: enabled, refetch };
  return { data: slot.data, error: slot.error, loading: slot.loading, refetch };
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export function useZombies(owner?: string): Loadable<Zombie[]> {
  return useChainData(`zombies:${owner ?? '*'}`, true, async (dep) => {
    const c = zombieRead(dep);
    const ids: number[] = owner
      ? (await c.getZombiesByOwner(owner)).map(Number)
      : range(Number(await c.getZombieCount()));
    return Promise.all(ids.map((id) => fetchZombie(dep, id)));
  });
}

export function useZombie(id: number): Loadable<Zombie> {
  return useChainData(`zombie:${id}`, true, async (dep) => {
    const count = Number(await zombieRead(dep).getZombieCount());
    if (!Number.isInteger(id) || id < 0 || id >= count) {
      throw { kind: 'reverted', message: 'no such zombie' } satisfies AppError;
    }
    return fetchZombie(dep, id);
  });
}

export function useAvengers(): Loadable<Avenger[]> {
  return useChainData('avengers', true, async (dep) => {
    const total = Number(await avengerRead(dep).totalAvengers());
    return Promise.all(range(total).map((id) => fetchAvenger(dep, id)));
  });
}

export function useBalance(address: string | null | undefined): Loadable<bigint> {
  return useChainData(`balance:${address ?? ''}`, !!address, (dep) => getReadProvider(dep).getBalance(address!));
}

// Block timestamps and receipts never change once mined, so cache them for the page lifetime.
// Blocks are keyed by hash so a chain reset cannot serve stale times.
const blockTimes = new Map<string, Promise<number>>();
const txInfo = new Map<string, Promise<{ from: string; gasUsed: bigint }>>();

function memo<K, V>(cache: Map<K, Promise<V>>, k: K, load: () => Promise<V>): Promise<V> {
  let p = cache.get(k);
  if (!p) {
    p = load();
    p.catch(() => cache.delete(k));
    cache.set(k, p);
  }
  return p;
}

async function fetchActivity(dep: Deployment): Promise<ActivityItem[]> {
  const provider = getReadProvider(dep);
  const names = ['ZombieOwnership', 'AvengerContract'] as const;
  const logs = (
    await Promise.all(
      names.map(async (contract) => {
        const c = contract === 'ZombieOwnership' ? zombieRead(dep) : avengerRead(dep);
        const events = await c.queryFilter('*', dep.deployedAtBlock, 'latest');
        return events.filter((e): e is EventLog => e instanceof EventLog).map((event) => ({ contract, event }));
      }),
    )
  )
    .flat()
    .sort((a, b) => b.event.blockNumber - a.event.blockNumber || b.event.index - a.event.index)
    .slice(0, ACTIVITY_CAP);

  return Promise.all(
    logs.map(async ({ contract, event }) => {
      const [timestamp, info] = await Promise.all([
        memo(blockTimes, event.blockHash, async () => (await provider.getBlock(event.blockNumber))!.timestamp),
        memo(txInfo, event.transactionHash, async () => {
          const r = (await provider.getTransactionReceipt(event.transactionHash))!;
          return { from: r.from, gasUsed: r.gasUsed };
        }),
      ]);
      const args: Record<string, string> = {};
      event.fragment.inputs.forEach((input, i) => {
        args[input.name] = String(event.args[i]);
      });
      return {
        key: `${event.transactionHash}:${event.index}`,
        event: event.eventName,
        contract,
        args,
        blockNumber: event.blockNumber,
        timestamp,
        txHash: event.transactionHash,
        from: info.from,
        gasUsed: info.gasUsed,
      };
    }),
  );
}

export function useActivity(): Loadable<ActivityItem[]> {
  return useChainData('activity', true, fetchActivity);
}
