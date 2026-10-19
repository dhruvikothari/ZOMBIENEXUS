import { describe, expect, it } from 'vitest';
import { friendlyReason, mapError } from '@/lib/errors';

describe('mapError', () => {
  it('EIP-1193 4001 -> rejected', () => {
    const e = mapError({ code: 4001, message: 'User rejected the request.' });
    expect(e.kind).toBe('rejected');
    expect(e.message).toBe('You rejected the request in MetaMask. Nothing was sent.');
  });

  it('ethers ACTION_REJECTED -> rejected', () => {
    expect(mapError({ code: 'ACTION_REJECTED', shortMessage: 'user rejected action' }).kind).toBe('rejected');
  });

  it('INSUFFICIENT_FUNDS and text match -> funds', () => {
    const msg = 'This account does not have enough test ETH for gas and fees.';
    expect(mapError({ code: 'INSUFFICIENT_FUNDS', message: 'x' })).toMatchObject({ kind: 'funds', message: msg });
    expect(mapError(new Error('Insufficient funds for gas * price + value')).kind).toBe('funds');
  });

  it('CALL_EXCEPTION with reason -> reverted with friendly text', () => {
    const e = mapError({ code: 'CALL_EXCEPTION', reason: 'zombie is not ready', message: 'execution reverted' });
    expect(e.kind).toBe('reverted');
    expect(e.message).toBe('The contract rejected this action: This zombie is still cooling down.');
  });

  it('CALL_EXCEPTION reason read from revert.args', () => {
    const e = mapError({ code: 'CALL_EXCEPTION', revert: { args: ['level too low'] } });
    expect(e.message).toContain("This zombie's level is too low for that.");
  });

  it('CALL_EXCEPTION without reason -> fallback text', () => {
    const e = mapError({ code: 'CALL_EXCEPTION', message: 'call failed' });
    expect(e.kind).toBe('reverted');
    expect(e.message).toBe('The contract rejected this action: it reverted without a reason.');
  });

  it('Ganache "VM Exception ... revert <reason>" -> reverted', () => {
    const e = mapError(new Error('VM Exception while processing transaction: revert zombie is not ready'));
    expect(e.kind).toBe('reverted');
    expect(e.message).toContain('This zombie is still cooling down.');
  });

  it('ethers "missing revert data" prefers the Ganache reason in info.error.message', () => {
    const base = {
      code: 'CALL_EXCEPTION',
      reason: null,
      shortMessage: 'missing revert data',
      message: 'missing revert data (action="estimateGas", data=null, reason=null)',
    };
    const withReason = mapError({
      ...base,
      info: { error: { message: 'VM Exception while processing transaction: revert not the zombie owner' } },
    });
    expect(withReason.kind).toBe('reverted');
    expect(withReason.message).toBe('The contract rejected this action: You do not own this zombie.');
    const bare = mapError({
      ...base,
      info: { error: { message: 'VM Exception while processing transaction: revert' } },
    });
    expect(bare.message).toBe('The contract rejected this action: it reverted without a reason.');
  });

  it('nonce problems -> network with clear-activity hint', () => {
    const e = mapError(new Error("Nonce too high. Expected nonce to be 3 but got 9."));
    expect(e.kind).toBe('network');
    expect(e.message).toContain('Clear activity tab data');
  });

  it('4902 and NETWORK_ERROR -> network', () => {
    expect(mapError({ code: 4902, message: 'Unrecognized chain ID' }).kind).toBe('network');
    const e = mapError({ code: 'NETWORK_ERROR', message: 'network changed' });
    expect(e.kind).toBe('network');
    expect(e.message).toContain('http://127.0.0.1:7545');
  });

  it('anything else -> unknown', () => {
    const e = mapError(new Error('Failed to fetch'));
    expect(e.kind).toBe('unknown');
    expect(e.message).toContain('npm run demo');
    expect(mapError(undefined).kind).toBe('unknown');
    expect(mapError('boom').kind).toBe('unknown');
  });

  it('passes an AppError through unchanged', () => {
    const a = { kind: 'network' as const, message: 'Deployment not loaded.' };
    expect(mapError(a)).toBe(a);
  });
});

describe('friendlyReason', () => {
  it('maps every catalogue reason and leaves unknown ones verbatim', () => {
    const known: Record<string, string> = {
      'not the zombie owner': 'You do not own this zombie.',
      'only one free zombie per address': 'This address already owns a zombie; one free zombie per address.',
      'zombie is not ready': 'This zombie is still cooling down.',
      'level too low': "This zombie's level is too low for that.",
      'no such zombie': 'That zombie does not exist.',
      'no such target': 'That zombie does not exist.',
      'no such avenger': 'That Avenger does not exist.',
      'wrong level up fee': 'Level up costs exactly 0.001 ETH.',
      'not owner or approved': 'Only the owner or the approved address can transfer this zombie.',
      'from is not the owner': 'The sender does not own this zombie.',
      'zero address': 'Cannot transfer to the zero address.',
      'avenger contract not set': 'The Avenger contract is not connected.',
    };
    for (const [k, v] of Object.entries(known)) expect(friendlyReason(k)).toBe(v);
    expect(friendlyReason('something odd')).toBe('something odd');
  });
});
