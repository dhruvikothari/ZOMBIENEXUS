import { describe, expect, it, vi } from 'vitest';
import type { TransactionReceipt } from 'ethers';
import type { AppError, TxState } from '@/lib/types';

// tx.ts also holds the useTx hook; stub its heavy imports so the pure reducer loads alone.
vi.mock('@/lib/chain', () => ({ getReadProvider: vi.fn(), refreshHead: vi.fn() }));
vi.mock('@/lib/wallet', () => ({ useWallet: vi.fn() }));
vi.mock('@/components/ui/Toast', () => ({ useToast: vi.fn() }));

const { INITIAL_TX, txReducer } = await import('@/lib/tx');

const receipt = (status: number) => ({ status, blockNumber: 7 }) as unknown as TransactionReceipt;
const err = (kind: AppError['kind']): AppError => ({ kind, message: `m-${kind}` });

describe('txReducer', () => {
  it('starts idle', () => {
    expect(INITIAL_TX).toEqual({ status: 'idle', label: '', hash: null, receipt: null, error: null });
  });

  it('start -> awaiting-signature with label, clearing old state', () => {
    const dirty: TxState = { ...INITIAL_TX, status: 'failed', hash: '0xold', error: err('unknown') };
    const s = txReducer(dirty, { type: 'start', label: 'Level up' });
    expect(s).toEqual({ status: 'awaiting-signature', label: 'Level up', hash: null, receipt: null, error: null });
  });

  it('sent -> pending with hash, keeps label', () => {
    const s = txReducer(txReducer(INITIAL_TX, { type: 'start', label: 'L' }), { type: 'sent', hash: '0xabc' });
    expect(s).toMatchObject({ status: 'pending', hash: '0xabc', label: 'L' });
  });

  it('mined status 1 -> confirmed', () => {
    const pending = txReducer(txReducer(INITIAL_TX, { type: 'start', label: 'L' }), { type: 'sent', hash: '0x1' });
    const r = receipt(1);
    const s = txReducer(pending, { type: 'mined', receipt: r });
    expect(s).toMatchObject({ status: 'confirmed', receipt: r, error: null, hash: '0x1' });
  });

  it('mined status 0 -> reverted with a reverted error', () => {
    const s = txReducer(INITIAL_TX, { type: 'mined', receipt: receipt(0) });
    expect(s.status).toBe('reverted');
    expect(s.error?.kind).toBe('reverted');
    expect(s.receipt?.status).toBe(0);
  });

  it('error kinds: rejected / reverted / everything else -> failed', () => {
    expect(txReducer(INITIAL_TX, { type: 'error', error: err('rejected') }).status).toBe('rejected');
    expect(txReducer(INITIAL_TX, { type: 'error', error: err('reverted') }).status).toBe('reverted');
    for (const k of ['funds', 'network', 'unknown'] as const) {
      expect(txReducer(INITIAL_TX, { type: 'error', error: err(k) }).status).toBe('failed');
    }
  });

  it('error stores the error object', () => {
    const e = err('funds');
    expect(txReducer(INITIAL_TX, { type: 'error', error: e }).error).toBe(e);
  });

  it('reset -> INITIAL_TX from any state', () => {
    const s = txReducer(INITIAL_TX, { type: 'mined', receipt: receipt(1) });
    expect(txReducer(s, { type: 'reset' })).toEqual(INITIAL_TX);
  });
});
