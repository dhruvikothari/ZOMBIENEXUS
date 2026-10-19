// Health checks for the running demo: chain, contracts, index.html line 34, deployment.json (SPEC 3.5).
// Usage: node scripts/check.js. Exit 1 on any FAIL.
const fs = require('fs');
const path = require('path');
const { JsonRpcProvider, Contract } = require('ethers');
const { readArtifact, ROOT, DEPLOY_FILE, RPC_URL, CHAIN_ID } = require('./export');

async function runChecks() {
  let ok = true;
  const line = (status, text) => {
    if (status === 'FAIL') ok = false;
    console.log(`${status}  ${text}`);
  };
  // Prints PASS, or SKIP when fn returns a reason; any throw is a FAIL.
  const check = async (label, fn) => {
    try {
      const skip = await fn();
      if (skip) line('SKIP', `${label}: ${skip}`);
      else line('PASS', label);
    } catch (err) {
      line('FAIL', `${label}: ${err.message}`);
    }
  };

  const provider = new JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });
  try {
    const zo = readArtifact('ZombieOwnership');
    const av = readArtifact('AvengerContract');
    const zoContract = new Contract(zo.address, zo.abi, provider);

    await check('net_version is 1337', async () => {
      const v = await provider.send('net_version', []);
      if (v !== String(CHAIN_ID)) throw new Error(`got ${v}`);
    });
    await check('eth_chainId is 0x539', async () => {
      const v = await provider.send('eth_chainId', []);
      if (parseInt(v, 16) !== CHAIN_ID) throw new Error(`got ${v}`);
    });
    for (const [name, c] of [['ZombieOwnership', zo], ['AvengerContract', av]]) {
      await check(`code at ${name} ${c.address}`, async () => {
        if ((await provider.getCode(c.address)) === '0x') throw new Error('no code');
      });
    }
    await check('avengerContract() is AvengerContract', async () => {
      const addr = await zoContract.avengerContract();
      if (addr !== av.address) throw new Error(`got ${addr}`);
    });
    await check('index.html line 34 has ZombieOwnership address', async () => {
      const line34 = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n')[33] || '';
      if (!line34.toLowerCase().includes(zo.address.toLowerCase())) throw new Error(`no ${zo.address}`);
    });
    await check('deployment.json matches artifacts', async () => {
      if (!fs.existsSync(DEPLOY_FILE)) throw new Error('missing: run npm run export');
      const dep = JSON.parse(fs.readFileSync(DEPLOY_FILE, 'utf8'));
      const pairs = [['ZombieOwnership', zo], ['AvengerContract', av]];
      for (const [name, c] of pairs) {
        const got = dep.contracts?.[name]?.address || '';
        if (got.toLowerCase() !== c.address.toLowerCase()) throw new Error(`${name} ${got} != ${c.address}`);
      }
    });
    await check('getZombieCount() >= 6', async () => {
      const n = Number(await zoContract.getZombieCount());
      return n < 6 ? `${n} zombies, expected 6: run npm run seed` : '';
    });
  } catch (err) {
    line('FAIL', err.message);
  } finally {
    provider.destroy();
  }
  return ok;
}

if (require.main === module) {
  runChecks().then((ok) => {
    process.exitCode = ok ? 0 : 1;
  });
}

module.exports = { runChecks };
