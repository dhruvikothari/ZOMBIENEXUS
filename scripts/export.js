// Writes frontend/public/deployment.json from the Truffle artifacts (SPEC 3.3).
// Usage: node scripts/export.js. Exit 1 if artifacts are missing or the chain is not reachable.
const fs = require('fs');
const path = require('path');
const { JsonRpcProvider, getAddress } = require('ethers');

const ROOT = path.resolve(__dirname, '..');
const RPC_URL = 'http://127.0.0.1:7545';
const CHAIN_ID = 1337;
const DEPLOY_FILE = path.join(ROOT, 'frontend', 'public', 'deployment.json');

function readArtifact(name) {
  const file = path.join(ROOT, 'build', 'contracts', `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`${path.relative(ROOT, file)} missing: run npm run compile`);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const net = json.networks[CHAIN_ID];
  if (!net) throw new Error(`${name} is not deployed on network ${CHAIN_ID}: run npm run migrate`);
  return { abi: json.abi, address: getAddress(net.address), txHash: net.transactionHash };
}

async function exportDeployment() {
  const zombie = readArtifact('ZombieOwnership');
  const avenger = readArtifact('AvengerContract');
  // staticNetwork: no network detection loop when the chain is down.
  const provider = new JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });
  try {
    try {
      await provider.send('eth_chainId', []);
    } catch {
      throw new Error(`RPC ${RPC_URL} is not answering: run npm run chain`);
    }
    const receipt = await provider.send('eth_getTransactionReceipt', [zombie.txHash]);
    if (!receipt) throw new Error('ZombieOwnership deploy tx not on chain: run npm run migrate');

    const deployment = {
      chainId: CHAIN_ID,
      networkName: `Ganache ${CHAIN_ID}`,
      rpcUrl: RPC_URL,
      deployedAtBlock: Number(receipt.blockNumber),
      generatedAt: new Date().toISOString(),
      contracts: {
        ZombieOwnership: { address: zombie.address, abi: zombie.abi },
        AvengerContract: { address: avenger.address, abi: avenger.abi },
      },
    };
    fs.mkdirSync(path.dirname(DEPLOY_FILE), { recursive: true });
    fs.writeFileSync(DEPLOY_FILE, JSON.stringify(deployment, null, 2) + '\n');
    return deployment;
  } finally {
    provider.destroy();
  }
}

if (require.main === module) {
  exportDeployment().then(
    () => console.log(`PASS  wrote ${path.relative(ROOT, DEPLOY_FILE)}`),
    (err) => {
      console.log(`FAIL  ${err.message}`);
      process.exitCode = 1;
    },
  );
}

module.exports = { exportDeployment, readArtifact, ROOT, DEPLOY_FILE, RPC_URL, CHAIN_ID };
