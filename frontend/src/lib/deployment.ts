import type { ContractInfo, Deployment } from '@/lib/types';

export const EXPECTED_CHAIN_ID = 1337;

function isContract(c: any): c is ContractInfo {
  return !!c && typeof c.address === 'string' && Array.isArray(c.abi);
}

function isDeployment(d: any): d is Deployment {
  return (
    !!d &&
    typeof d.chainId === 'number' &&
    typeof d.networkName === 'string' &&
    typeof d.rpcUrl === 'string' &&
    typeof d.deployedAtBlock === 'number' &&
    typeof d.generatedAt === 'string' &&
    isContract(d.contracts?.ZombieOwnership) &&
    isContract(d.contracts?.AvengerContract)
  );
}

let cached: Promise<Deployment> | null = null;

export function loadDeployment(): Promise<Deployment> {
  if (!cached) {
    cached = fetch('/deployment.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('deployment.json missing');
        return r.json();
      })
      .then((d: unknown) => {
        if (!isDeployment(d)) throw new Error('deployment.json missing');
        return d;
      })
      .catch(() => {
        cached = null; // let the next caller retry once the chain/export exists
        throw new Error('deployment.json missing');
      });
  }
  return cached;
}
