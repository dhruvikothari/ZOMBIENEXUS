import { useCallback, useReducer, useRef } from 'react';
import type { JsonRpcSigner, TransactionReceipt } from 'ethers';
import { getReadProvider, refreshHead } from '@/lib/chain';
import { mapError, revertedError } from '@/lib/errors';
import { useToast } from '@/components/ui/Toast';
import { useWallet } from '@/lib/wallet';
import type { AppError, TxState } from '@/lib/types';

export const INITIAL_TX: TxState = { status: 'idle', label: '', hash: null, receipt: null, error: null };

export type TxAction =
  | { type: 'start'; label: string }
  | { type: 'sent'; hash: string }
  | { type: 'mined'; receipt: TransactionReceipt }
  | { type: 'error'; error: AppError }
  | { type: 'reset' };

export function txReducer(s: TxState, a: TxAction): TxState {
  switch (a.type) {
    case 'start':
      return { ...INITIAL_TX, status: 'awaiting-signature', label: a.label };
    case 'sent':
      return { ...s, status: 'pending', hash: a.hash };
    case 'mined':
      return a.receipt.status === 1
        ? { ...s, status: 'confirmed', receipt: a.receipt, error: null }
        : { ...s, status: 'reverted', receipt: a.receipt, error: revertedError() };
    case 'error':
      return {
        ...s,
        status: a.error.kind === 'rejected' ? 'rejected' : a.error.kind === 'reverted' ? 'reverted' : 'failed',
        error: a.error,
      };
    case 'reset':
      return INITIAL_TX;
  }
}

export function useTx(): {
  state: TxState;
  busy: boolean;
  run(label: string, send: (signer: JsonRpcSigner) => Promise<{ hash: string }>): Promise<TransactionReceipt | null>;
  reset(): void;
} {
  const [state, dispatch] = useReducer(txReducer, INITIAL_TX);
  const { deployment, getSigner } = useWallet();
  const { toast } = useToast();
  // Synchronous lock: state is stale between two clicks in the same tick.
  const busyRef = useRef(false);
  const latest = useRef({ deployment, getSigner, toast });
  latest.current = { deployment, getSigner, toast };

  const run = useCallback(
    async (label: string, send: (signer: JsonRpcSigner) => Promise<{ hash: string }>) => {
      if (busyRef.current) return null;
      busyRef.current = true;
      dispatch({ type: 'start', label });
      try {
        const { deployment: dep, getSigner: signer, toast: notify } = latest.current;
        const { hash } = await send(await signer());
        dispatch({ type: 'sent', hash });
        notify({ kind: 'info', title: label, description: 'Transaction sent. Waiting for confirmation…', hash });
        if (!dep) throw { kind: 'network', message: 'Deployment not loaded.' } satisfies AppError;
        const receipt = await getReadProvider(dep).waitForTransaction(hash, 1, 120000);
        if (!receipt || receipt.status !== 1) {
          const error = revertedError();
          dispatch(receipt ? { type: 'mined', receipt } : { type: 'error', error });
          notify({ kind: 'error', title: `${label} failed`, description: error.message, hash });
          return null;
        }
        dispatch({ type: 'mined', receipt });
        await refreshHead();
        notify({ kind: 'success', title: `${label} confirmed`, hash });
        return receipt;
      } catch (e) {
        const error = mapError(e);
        dispatch({ type: 'error', error });
        latest.current.toast({
          kind: error.kind === 'rejected' ? 'warning' : 'error',
          title: error.kind === 'rejected' ? 'Request rejected' : `${label} failed`,
          description: error.message,
        });
        return null;
      } finally {
        busyRef.current = false;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    if (!busyRef.current) dispatch({ type: 'reset' });
  }, []);

  return { state, busy: state.status === 'awaiting-signature' || state.status === 'pending', run, reset };
}
