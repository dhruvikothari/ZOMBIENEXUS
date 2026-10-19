// Runs the Truffle suite against a throwaway in-memory Ganache on 8545 (SPEC 3.5).
// Usage: node scripts/test.js [extra truffle test args]. Exits with truffle's exit code.
const path = require('path');
const { spawn } = require('child_process');
const ganache = require('ganache');

const PORT = 8545;

function listen(server) {
  return new Promise((resolve, reject) => {
    server.listen(PORT, '127.0.0.1', (err) => (err ? reject(err) : resolve()));
  });
}

async function main() {
  const server = ganache.server({
    chain: { chainId: 1337, networkId: 1337 },
    wallet: { deterministic: true, defaultBalance: 1000 },
    logging: { quiet: true },
  });
  try {
    await listen(server);
  } catch (err) {
    console.log(`FAIL  port ${PORT} busy (${err.code || err.message})`);
    return 1;
  }

  const args = [path.join(__dirname, 'run.js'), 'truffle', 'test', '--network', 'test', ...process.argv.slice(2)];
  const code = await new Promise((resolve) => {
    spawn(process.execPath, args, { stdio: 'inherit' }).on('exit', (c) => resolve(c === null ? 1 : c));
  });
  server.close();
  return code;
}

if (require.main === module) {
  main().then((code) => {
    process.exitCode = code;
  });
}
