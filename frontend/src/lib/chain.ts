import { useSyncExternalStore } from 'react';
import { JsonRpcProvider } from 'ethers';
import { loadDeployment } from '@/lib/deployment';
import type { Deployment, Head } from '@/lib/types';

const POLL_MS = 4000;

let provider: JsonRpcProvider | null = null;
let providerKey = '';

export function getReadProvider(dep: Deployment): JsonRpcProvider {
  const key = `${dep.rpcUrl}|${dep.chainId}`;
  if (!provider || providerKey !== key) {
    provider?.destroy();
    // cacheTimeout -1: ethers' 250 ms request de-dup would hide a block mined right after a read.
    provider = new JsonRpcProvider(dep.rpcUrl, dep.chainId, { staticNetwork: true, cacheTimeout: -1 });
    providerKey = key;
  }
  return provider;
}

// --- head store -----------------------------------------------------------
let head: Head | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let seq = 0; // drops results of ticks that were overtaken by a newer one
let applied = 0;

async function tick(): Promise<void> {
  const mine = ++seq;
  try {
    const p = getReadProvider(await loadDeployment());
    const blockNumber = await p.getBlockNumber();
    if (head && head.blockNumber === blockNumber) return;
    const block = await p.getBlock(blockNumber);
    if (!block || mine < applied) return;
    applied = mine;
    head = { blockNumber, timestamp: block.timestamp };
    listeners.forEach((l) => l());
  } catch {
    // Chain offline or deployment missing: keep the last head; wallet.tsx reports the status.
  }
}

function startTimer() {
  if (timer === null && document.visibilityState === 'visible') timer = setInterval(() => void tick(), POLL_MS);
}

function stopTimer() {
  if (timer !== null) clearInterval(timer);
  timer = null;
}

function onVisibility() {
  if (document.visibilityState === 'visible') {
    startTimer();
    void tick();
  } else {
    stopTimer();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', onVisibility);
    startTimer();
    void tick();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      document.removeEventListener('visibilitychange', onVisibility);
      stopTimer();
    }
  };
}

const getSnapshot = () => head;

export function useHead(): Head | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useBlockTime(): number | null {
  return useHead()?.timestamp ?? null;
}

export function refreshHead(): Promise<void> {
  return tick();
}
