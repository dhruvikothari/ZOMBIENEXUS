import { useEffect, useState } from 'react';
import { useHead } from '@/lib/chain';
import { zombieRead } from '@/lib/contracts';
import type { Deployment } from '@/lib/types';

// balanceOf(address), refetched on every new block. checked=false until the first answer or failure.
export function useOwnedCount(dep: Deployment | null, address: string | null) {
  const block = useHead()?.blockNumber;
  const [state, setState] = useState<{ address: string | null; count: number | null; checked: boolean }>({
    address: null,
    count: null,
    checked: false,
  });

  useEffect(() => {
    if (!dep || !address) {
      setState({ address, count: null, checked: false });
      return;
    }
    let live = true;
    zombieRead(dep)
      .balanceOf(address)
      .then((v: bigint) => live && setState({ address, count: Number(v), checked: true }))
      // Unknown count: let the user try, the contract enforces the rule.
      .catch(() => live && setState({ address, count: null, checked: true }));
    return () => {
      live = false;
    };
  }, [dep, address, block]);

  // Key by address so a wallet switch never shows the previous wallet's count.
  return state.address === address ? { count: state.count, checked: state.checked } : { count: null, checked: false };
}
