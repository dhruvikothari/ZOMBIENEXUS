import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BrowserProvider, getAddress, type Eip1193Provider, type JsonRpcSigner } from 'ethers';
import { useToast } from '@/components/ui/Toast';
import { getReadProvider, useHead } from '@/lib/chain';
import { EXPECTED_CHAIN_ID, loadDeployment } from '@/lib/deployment';
import { mapError, NETWORK_MESSAGE } from '@/lib/errors';
import type { AppError, Deployment, WalletState, WalletStatus } from '@/lib/types';

export type WalletApi = WalletState & {
  deployment: Deployment | null;
  connect(): Promise<void>;
  disconnect(): void;
  switchNetwork(): Promise<void>;
  refresh(): Promise<void>;
  getSigner(): Promise<JsonRpcSigner>;
};

type Eip = Eip1193Provider & {
  isMetaMask?: boolean;
  on?: (event: string, handler: () => void) => void;
  removeListener?: (event: string, handler: () => void) => void;
};
type Announced = { info: { name: string; rdns: string }; provider: Eip };
type Picked = { eip: Eip; name: string };
type Chain = { state: 'checking' | 'down' | 'nocontract' | 'ok'; reason: string | null };
type Seen = { address: string | null; chainId: number | null; rpcOk: boolean };

const FLAG = 'zn.disconnected';
const CHAIN_HEX = `0x${EXPECTED_CHAIN_ID.toString(16)}`;
const POLL_MS = 4000;
const DISCOVERY_MS = 500;

const readFlag = () => {
  try {
    return localStorage.getItem(FLAG) === '1';
  } catch {
    return false;
  }
};
const writeFlag = (on: boolean) => {
  try {
    if (on) localStorage.setItem(FLAG, '1');
    else localStorage.removeItem(FLAG);
  } catch {
    // storage blocked: the disconnect then only lasts for this page session
  }
};

const WalletContext = createContext<WalletApi | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const head = useHead();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [chain, setChain] = useState<Chain>({ state: 'checking', reason: null });
  const [discovering, setDiscovering] = useState(true);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [seen, setSeen] = useState<Seen | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [bal, setBal] = useState<{ address: string; value: bigint } | null>(null);

  // Latest values for stable callbacks and event handlers.
  const pickedRef = useRef(picked);
  const deploymentRef = useRef(deployment);
  const toastRef = useRef(toast);
  const sessionOffRef = useRef(readFlag());
  const reqId = useRef(0);
  pickedRef.current = picked;
  deploymentRef.current = deployment;
  toastRef.current = toast;

  // Read-provider health: deployment present, RPC answers, contract has code. Keeps polling so
  // a chain that starts (or dies) later is noticed without a reload.
  useEffect(() => {
    let cancelled = false;
    let running = false;
    const check = async () => {
      if (running) return;
      running = true;
      let dep: Deployment | null = null;
      let next: Chain;
      try {
        dep = await loadDeployment();
        const p = getReadProvider(dep);
        await p.send('eth_chainId', []);
        const code = await p.getCode(dep.contracts.ZombieOwnership.address);
        next = { state: code === '0x' ? 'nocontract' : 'ok', reason: null };
      } catch {
        next = { state: 'down', reason: dep ? 'RPC unreachable' : 'deployment.json missing' };
      }
      running = false;
      if (cancelled) return;
      if (dep) setDeployment(dep);
      setChain((prev) => (prev.state === next.state && prev.reason === next.reason ? prev : next));
    };
    void check();
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') void check();
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  // EIP-6963 discovery, then window.ethereum fallback.
  useEffect(() => {
    const found: Announced[] = [];
    const onAnnounce = (ev: Event) => {
      const d = (ev as CustomEvent<Announced>).detail;
      if (d?.info && d?.provider) found.push(d);
    };
    window.addEventListener('eip6963:announceProvider', onAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    const t = setTimeout(() => {
      const hit = found.find((f) => f.info.rdns === 'io.metamask') ?? found[0];
      const legacy = (window as unknown as { ethereum?: Eip }).ethereum;
      setPicked(
        hit
          ? { eip: hit.provider, name: hit.info.name }
          : legacy
            ? { eip: legacy, name: legacy.isMetaMask ? 'MetaMask' : 'Browser wallet' }
            : null,
      );
      setDiscovering(false);
    }, DISCOVERY_MS);
    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce);
      clearTimeout(t);
    };
  }, []);

  // Re-reads accounts + chain. Only the newest call may write state (chainChanged can fire mid-connect).
  const refresh = useCallback(async () => {
    const w = pickedRef.current?.eip;
    if (!w) return;
    const id = ++reqId.current;
    let next: Seen;
    try {
      const [accounts, chainHex] = await Promise.all([
        w.request({ method: 'eth_accounts' }),
        w.request({ method: 'eth_chainId' }),
      ]);
      const chainId = Number(chainHex);
      const dep = deploymentRef.current;
      let rpcOk = true;
      if (chainId === EXPECTED_CHAIN_ID && dep) {
        // MetaMask's chain-1337 entry may point at another RPC (e.g. Localhost 8545) with no contracts.
        try {
          const code = await w.request({
            method: 'eth_getCode',
            params: [dep.contracts.ZombieOwnership.address, 'latest'],
          });
          rpcOk = code !== '0x';
        } catch {
          rpcOk = false;
        }
      }
      const first = Array.isArray(accounts) && accounts[0] ? getAddress(accounts[0]) : null;
      next = { address: sessionOffRef.current ? null : first, chainId, rpcOk };
    } catch {
      next = { address: null, chainId: null, rpcOk: true };
    }
    if (id !== reqId.current) return;
    setSeen((prev) =>
      prev && prev.address === next.address && prev.chainId === next.chainId && prev.rpcOk === next.rpcOk ? prev : next,
    );
  }, []);

  // Silent initial read, then on every new block (also re-checks the wallet's own RPC).
  useEffect(() => {
    void refresh();
  }, [refresh, picked, deployment, head?.blockNumber]);

  // Registered once per selected provider, removed on cleanup. Payloads are ignored on purpose.
  useEffect(() => {
    const w = picked?.eip;
    if (!w?.on) return;
    const handler = () => void refresh();
    const events = ['accountsChanged', 'chainChanged', 'disconnect'];
    events.forEach((e) => w.on?.(e, handler));
    return () => events.forEach((e) => w.removeListener?.(e, handler));
  }, [picked, refresh]);

  const { status, reason } = useMemo((): { status: WalletStatus; reason: string | null } => {
    if (chain.state === 'checking') return { status: 'connecting', reason: null };
    if (chain.state === 'down') return { status: 'rpc-down', reason: chain.reason };
    if (chain.state === 'nocontract') return { status: 'no-contract', reason: null };
    if (discovering) return { status: 'connecting', reason: null };
    if (!picked) return { status: 'no-metamask', reason: null };
    if (connecting || !seen) return { status: 'connecting', reason: null };
    if (!seen.address) return { status: 'disconnected', reason: null };
    if (seen.chainId !== EXPECTED_CHAIN_ID) return { status: 'wrong-network', reason: 'chain' };
    if (!seen.rpcOk) return { status: 'wrong-network', reason: 'rpc' };
    return { status: 'ready', reason: null };
  }, [chain, discovering, picked, connecting, seen]);

  const address = seen?.address ?? null;
  const chainId = seen?.chainId ?? null;
  const live = useRef({ status, address, picked });
  live.current = { status, address, picked };

  // Balance comes from the read provider, so it works on any wallet network.
  useEffect(() => {
    if (!address || !deployment || chain.state !== 'ok') return;
    let cancelled = false;
    getReadProvider(deployment)
      .getBalance(address)
      .then((value) => {
        if (!cancelled) setBal({ address, value });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [address, deployment, chain.state, head?.blockNumber]);
  const balance = bal && bal.address === address ? bal.value : null;

  const notifyError = useCallback((title: string, e: unknown) => {
    const err = mapError(e);
    toastRef.current({
      kind: err.kind === 'rejected' ? 'warning' : 'error',
      title,
      description: err.message,
    });
  }, []);

  const connect = useCallback(async () => {
    const w = pickedRef.current?.eip;
    if (!w) return;
    sessionOffRef.current = false;
    writeFlag(false);
    setConnecting(true);
    try {
      await w.request({ method: 'eth_requestAccounts' });
    } catch (e) {
      if ((e as { code?: number })?.code === -32002) {
        toastRef.current({
          kind: 'info',
          title: 'MetaMask is waiting',
          description: 'A connection request is already open. Open the MetaMask window to answer it.',
        });
      } else {
        notifyError('Could not connect', e);
      }
    }
    try {
      await refresh();
    } finally {
      setConnecting(false);
    }
  }, [refresh, notifyError]);

  const disconnect = useCallback(() => {
    sessionOffRef.current = true;
    writeFlag(true);
    reqId.current++; // drop any refresh still in flight
    setSeen((prev) => (prev ? { ...prev, address: null } : prev));
  }, []);

  const switchNetwork = useCallback(async () => {
    const w = pickedRef.current?.eip;
    if (!w) return;
    try {
      await w.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] });
    } catch (e) {
      const x = e as { code?: number; data?: { originalError?: { code?: number } } };
      if (x?.code === 4902 || x?.data?.originalError?.code === 4902) {
        try {
          await w.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CHAIN_HEX,
                chainName: 'Ganache 1337 (ZOMBIENEXUS)',
                rpcUrls: [deploymentRef.current?.rpcUrl ?? 'http://127.0.0.1:7545'],
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              },
            ],
          });
        } catch (e2) {
          notifyError('Could not add the network', e2);
        }
      } else {
        notifyError('Could not switch network', e);
      }
    }
    await refresh();
  }, [refresh, notifyError]);

  const getSigner = useCallback(async () => {
    const { status: s, address: a, picked: p } = live.current;
    if (s !== 'ready' || !a || !p) {
      throw { kind: 'network', message: NETWORK_MESSAGE } satisfies AppError;
    }
    return new BrowserProvider(p.eip).getSigner(a);
  }, []);

  const value = useMemo<WalletApi>(
    () => ({
      status,
      address,
      chainId,
      balance,
      reason,
      providerName: picked?.name ?? null,
      deployment,
      connect,
      disconnect,
      switchNetwork,
      refresh,
      getSigner,
    }),
    [status, address, chainId, balance, reason, picked, deployment, connect, disconnect, switchNetwork, refresh, getSigner],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletApi {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
