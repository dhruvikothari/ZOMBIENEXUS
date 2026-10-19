// Deterministic demo seed (SPEC 2.3). Run once on a freshly migrated chain.
// Usage: node scripts/seed.js. Exit 1 on any failure or when already seeded.
const fs = require('fs');
const path = require('path');
const { JsonRpcProvider, Contract, getAddress } = require('ethers');

const ROOT = path.resolve(__dirname, '..');
const RPC_URL = 'http://127.0.0.1:7545';
const NETWORK_ID = '1337';
// Roster order == avenger ids 0..5 (SPEC 2.1).
const AVENGER_GENES = [7319028465120486n, 1846203957461125n, 9902671358840708n, 4471935026689137n, 2638470915573364n, 5560218743309963n];
const DAY_AND_A_BIT = 90000;

function artifact(name) {
  const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'contracts', `${name}.json`), 'utf8'));
  const net = json.networks[NETWORK_ID];
  if (!net) throw new Error(`${name} is not deployed on network ${NETWORK_ID}: run npm run migrate`);
  return { abi: json.abi, address: net.address };
}

async function seed(rpcUrl = RPC_URL) {
  // staticNetwork: no detection loop; pollingInterval: tx.wait() returns fast on an automining chain.
  const provider = new JsonRpcProvider(rpcUrl, 1337, { staticNetwork: true, pollingInterval: 100 });
  try {
    const zo = artifact('ZombieOwnership');
    const av = artifact('AvengerContract');
    const [dAddr, aAddr] = (await provider.send('eth_accounts', [])).map(getAddress);
    const D = await provider.getSigner(dAddr);
    const A = await provider.getSigner(aAddr);
    const zombies = new Contract(zo.address, zo.abi, D);
    const zombiesA = zombies.connect(A);
    const avengers = new Contract(av.address, av.abi, D);

    if ((await zombies.getZombieCount()) !== 0n) throw new Error('already seeded');

    const send = async (txPromise) => (await txPromise).wait();
    const passTime = async () => {
      await provider.send('evm_increaseTime', [DAY_AND_A_BIT]);
      await provider.send('evm_mine', []);
    };
    const levelUp = async (id, times) => {
      const fee = await zombies.levelUpFee();
      for (let i = 0; i < times; i++) await send(zombies.levelUp(id, { value: fee }));
    };

    for (const genes of AVENGER_GENES) await send(avengers.createAvenger(genes)); // 1
    for (const [id, name] of ['Rotfang', 'Grimjaw', 'Mossbelly', 'Duskwalker'].entries()) { // 2
      await send(zombies.createRandomZombie(name));
      await send(zombies.transferFrom(dAddr, aAddr, id));
    }
    await send(zombies.createRandomZombie('The Warden')); // 3: id 4, stays with D
    await levelUp(0, 1); // 4
    await levelUp(2, 4);
    await levelUp(3, 7);
    await levelUp(4, 2);
    await passTime(); // 5
    await send(zombiesA.feedOnAvenger(0, 2)); // 6: Rotfang eats Thor -> id 5
    await levelUp(5, 1); // 7
    await send(zombiesA.changeName(5, 'Thunderrot'));
    await passTime(); // 8

    // 9: assert and print
    const now = Number((await provider.getBlock('latest')).timestamp);
    const rows = [];
    for (let id = 0; id < 6; id++) {
      const [name, dna, level, readyTime] = await zombies.zombies(id);
      const owner = await zombies.zombieToOwner(id);
      rows.push({ id, name, owner: owner === aAddr ? 'A' : owner === dAddr ? 'D' : owner, level: Number(level), dna: dna.toString(), ready: Number(readyTime) <= now });
    }
    console.log('id  name         owner  level  dna               ready');
    for (const r of rows) console.log(`${String(r.id).padEnd(4)}${r.name.padEnd(13)}${r.owner.padEnd(7)}${String(r.level).padEnd(7)}${r.dna.padEnd(18)}${r.ready}`);

    const checks = [
      ['getZombieCount() == 6', (await zombies.getZombieCount()) === 6n],
      ['balanceOf(A) == 5', (await zombies.balanceOf(aAddr)) === 5n],
      ['balanceOf(D) == 1', (await zombies.balanceOf(dAddr)) === 1n],
      ['zombies(5).dna == 6212148620395099', rows[5].dna === '6212148620395099'],
      ['totalAvengers() == 6', (await avengers.totalAvengers()) === 6n],
      ['all 6 zombies ready', rows.every((r) => r.ready)],
    ];
    let ok = true;
    for (const [label, pass] of checks) {
      console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}`);
      ok = ok && pass;
    }
    if (!ok) throw new Error('seed assertions failed');
  } finally {
    provider.destroy();
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.log(`FAIL  ${err.message}`);
    process.exit(1);
  });
}

module.exports = { seed };
