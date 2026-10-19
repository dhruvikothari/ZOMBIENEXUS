import type { AppError, ErrorKind } from '@/lib/types';

const KINDS: readonly ErrorKind[] = ['rejected', 'funds', 'network', 'reverted', 'unknown'];

const REASONS: Record<string, string> = {
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

export const NETWORK_MESSAGE =
  'Wrong network: switch MetaMask to Ganache (chain 1337, RPC http://127.0.0.1:7545).';
const NONCE_MESSAGE =
  'MetaMask is out of sync with the local chain. Settings > Advanced > Clear activity tab data, then retry.';
const FALLBACK_REASON = 'it reverted without a reason.';

export function friendlyReason(reason: string): string {
  return REASONS[reason.trim()] ?? reason;
}

export function revertedError(reason?: string, detail?: string): AppError {
  return {
    kind: 'reverted',
    message: `The contract rejected this action: ${reason ? friendlyReason(reason) : FALLBACK_REASON}`,
    detail,
  };
}

type Loose = Record<string, any> | null | undefined;
const REVERT_RE = /revert(?:ed)?(?: with reason string)?[: ]+'?([^'"\n]+)/;

function isAppError(e: unknown): e is AppError {
  const o = e as Loose;
  return !!o && typeof o.message === 'string' && KINDS.includes(o.kind) && !('code' in o);
}

function messages(e: Loose): string[] {
  return [e?.info?.error?.message, e?.error?.message, e?.shortMessage, e?.message].filter(
    (m): m is string => typeof m === 'string',
  );
}

function codes(e: Loose): unknown[] {
  return [e?.code, e?.info?.error?.code, e?.error?.code, e?.data?.originalError?.code];
}

function extractReason(e: Loose): string | null {
  // ethers puts non-revert tags in `reason` too (e.g. TIMEOUT -> "timeout"); trust it only for reverts.
  const isEthersOther = typeof e?.code === 'string' && e.code !== 'CALL_EXCEPTION';
  if (!isEthersOther && typeof e?.reason === 'string' && e.reason) return e.reason;
  const arg = e?.revert?.args?.[0];
  if (typeof arg === 'string' && arg) return arg;
  for (const m of messages(e)) {
    const hit = REVERT_RE.exec(m)?.[1]?.trim();
    // Skip ethers' "(unknown custom error)" and "without a reason" noise.
    if (hit && !hit.startsWith('(') && !/^without a reason/i.test(hit) && !/^data\b/i.test(hit)) return hit;
  }
  return null;
}

export function mapError(err: unknown): AppError {
  if (isAppError(err)) return err;
  const e = err as Loose;
  const cs = codes(e).map(String);
  const text = messages(e).join(' | ');
  const detail = text ? text.slice(0, 300) : undefined;

  if (cs.includes('ACTION_REJECTED') || cs.includes('4001')) {
    return { kind: 'rejected', message: 'You rejected the request in MetaMask. Nothing was sent.', detail };
  }
  if (cs.includes('INSUFFICIENT_FUNDS') || /insufficient funds/i.test(text)) {
    return { kind: 'funds', message: 'This account does not have enough test ETH for gas and fees.', detail };
  }
  const reason = extractReason(e);
  if (!reason && (/nonce/i.test(text) || cs.some((c) => /nonce/i.test(c)))) {
    return { kind: 'network', message: NONCE_MESSAGE, detail };
  }
  if (!reason && (cs.includes('4902') || cs.includes('NETWORK_ERROR'))) {
    return { kind: 'network', message: NETWORK_MESSAGE, detail };
  }
  if (reason || cs.includes('CALL_EXCEPTION') || /VM Exception/i.test(text)) {
    return revertedError(reason ?? undefined, detail);
  }
  return {
    kind: 'unknown',
    message: 'Something went wrong talking to the local chain. Is `npm run demo` running?',
    detail,
  };
}
