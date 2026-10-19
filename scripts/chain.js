// Persistent local Ganache chain on 127.0.0.1:7545 (SPEC 3.4, 3.5).
// Usage: node scripts/chain.js   (runs until Ctrl+C)
const fs = require('fs');
const net = require('net');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GANACHE_DIR = path.join(ROOT, '.ganache');
const PORT = 7545;
const HOST = '127.0.0.1';
const URL = `http://${HOST}:${PORT}`;

async function rpc(method, params = []) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(2000),
  });
  const body = await res.json();
  if (body.error) throw new Error(body.error.message);
  return body.result;
}

async function isRunning() {
  try {
    return (await rpc('eth_chainId')) === '0x539';
  } catch {
    return false;
  }
}

function portBusy(port = PORT) {
  return new Promise((resolve) => {
    const s = net.connect(port, HOST);
    s.once('connect', () => (s.destroy(), resolve(true)));
    s.once('error', () => resolve(false));
  });
}

async function startChain() {
  fs.mkdirSync(path.join(GANACHE_DIR, 'db'), { recursive: true }); // ganache does not create parents
  const ganache = require('ganache'); // lazy: state.js imports this file and must stay light
  const server = ganache.server({
    chain: { chainId: 1337, networkId: 1337 },
    wallet: {
      deterministic: true,
      totalAccounts: 10,
      defaultBalance: 1000,
      accountKeysPath: path.join(GANACHE_DIR, 'keys.json'),
    },
    database: { dbPath: path.join(GANACHE_DIR, 'db') },
    logging: { quiet: true },
  });
  await server.listen(PORT, HOST);
  const request = (method, params = []) => server.provider.request({ method, params });

  // Keep chain time monotonic across restarts (seed pushes it ~50 h past wall time).
  // Skipped on an empty chain: demo.js treats block 0 as "needs migrate + seed".
  const latest = await request('eth_getBlockByNumber', ['latest', false]);
  if (parseInt(latest.number, 16) > 0) {
    await request('evm_setTime', [Math.max(Date.now(), parseInt(latest.timestamp, 16) * 1000 + 1000)]);
    await request('evm_mine');
  }

  const accounts = await request('eth_accounts');
  return {
    server,
    url: URL,
    accounts,
    close: () => server.close(),
  };
}

if (require.main === module) {
  (async () => {
    if (await isRunning()) {
      console.log(`PASS  already running at ${URL}`);
      return;
    }
    let chain;
    try {
      chain = await startChain();
    } catch (err) {
      console.log(`FAIL  cannot start chain on ${URL}: ${err.message}`);
      process.exit(1);
    }
    console.log(`PASS  Ganache chain 1337 listening at ${chain.url}`);
    ['D deployer/seeder/opponent', 'A army (main demo wallet)', 'B fresh (live Create, receives transfer)', 'C legacy page'].forEach(
      (role, i) => console.log(`      [${i}] ${chain.accounts[i]}  ${role}`),
    );
    process.on('SIGINT', async () => {
      await chain.close();
      process.exit(0);
    });
  })();
}

module.exports = { startChain, isRunning, portBusy, rpc, URL, PORT, GANACHE_DIR };
