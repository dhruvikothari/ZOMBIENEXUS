import { Contract, Interface, type ContractRunner, type TransactionReceipt } from 'ethers';
import { getReadProvider } from '@/lib/chain';
import { heroIndex, heroName, powerOf } from '@/lib/roster';
import type { Avenger, Deployment, Zombie } from '@/lib/types';

export const BATTLE_GAS_LIMIT = 300000n;

const make = (dep: Deployment, name: 'ZombieOwnership' | 'AvengerContract', runner: ContractRunner) =>
  new Contract(dep.contracts[name].address, dep.contracts[name].abi, runner);

export const zombieRead = (dep: Deployment) => make(dep, 'ZombieOwnership', getReadProvider(dep));
export const avengerRead = (dep: Deployment) => make(dep, 'AvengerContract', getReadProvider(dep));
export const zombieWrite = (dep: Deployment, signer: ContractRunner) => make(dep, 'ZombieOwnership', signer);
export const avengerWrite = (dep: Deployment, signer: ContractRunner) => make(dep, 'AvengerContract', signer);

export async function fetchZombie(dep: Deployment, id: number): Promise<Zombie> {
  const c = zombieRead(dep);
  const [z, owner] = await Promise.all([c.zombies(id), c.zombieToOwner(id)]);
  return {
    id,
    name: z[0],
    dna: z[1],
    level: Number(z[2]),
    readyTime: Number(z[3]),
    winCount: Number(z[4]),
    lossCount: Number(z[5]),
    owner,
  };
}

export async function fetchAvenger(dep: Deployment, id: number): Promise<Avenger> {
  const a = await avengerRead(dep).getAvenger(id);
  const genes: bigint = a[9];
  return {
    id,
    genes,
    birthTime: Number(a[5]),
    heroIndex: heroIndex(genes),
    heroName: heroName(genes),
    power: powerOf(genes),
  };
}

export function parseReceipt(dep: Deployment, receipt: TransactionReceipt): { name: string; args: Record<string, string> }[] {
  const out: { name: string; args: Record<string, string> }[] = [];
  for (const log of receipt.logs) {
    const info = Object.values(dep.contracts).find((c) => c.address.toLowerCase() === log.address.toLowerCase());
    if (!info) continue;
    try {
      const parsed = new Interface(info.abi).parseLog({ topics: [...log.topics], data: log.data });
      if (!parsed) continue;
      const args: Record<string, string> = {};
      parsed.fragment.inputs.forEach((input, i) => {
        args[input.name] = String(parsed.args[i]);
      });
      out.push({ name: parsed.name, args });
    } catch {
      // not decodable with this ABI: skip
    }
  }
  return out;
}
