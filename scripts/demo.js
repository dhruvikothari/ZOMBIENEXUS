// One-command demo: chain -> migrate+seed (empty chain only) -> build -> export -> check -> serve (SPEC 3.5).
// Usage: node scripts/demo.js (Ctrl+C stops everything this script started).
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { startChain, isRunning, rpc } = require('./chain');

const ROOT = path.resolve(__dirname, '..');
const RUN = path.join(__dirname, 'run.js');

function runStep(...args) {
  return new Promise((resolve) => {
    spawn(process.execPath, [RUN, ...args], { cwd: ROOT, stdio: 'inherit' }).on('exit', (code) => resolve(code === 0));
  });
}

async function main() {
  let chain = null; // only set when this script started the chain
  let server = null;
  const stop = async (code) => {
    if (server) await new Promise((r) => server.close(r));
    if (chain) await chain.close();
    process.exit(code);
  };
  process.on('SIGINT', () => stop(0));

  const fail = (msg) => {
    console.log(`FAIL  ${msg}`);
    return stop(1);
  };

  if (await isRunning()) console.log('PASS  reusing chain at http://127.0.0.1:7545');
  else {
    chain = await startChain();
    console.log('PASS  chain started at http://127.0.0.1:7545');
  }

  if (parseInt(await rpc('eth_blockNumber'), 16) === 0) {
    if (!(await runStep('truffle', 'migrate', '--reset', '--network', 'development'))) return fail('migrate failed');
    await require('./seed').seed();
  }

  if (!fs.existsSync(path.join(ROOT, 'frontend', 'dist', 'index.html'))) {
    console.log('PASS  frontend/dist missing, building');
    if (!(await runStep('tsc', '--noEmit', '-p', 'frontend/tsconfig.json'))) return fail('type check failed');
    if (!(await runStep('vite', 'build', '--config', 'frontend/vite.config.ts'))) return fail('vite build failed');
  }

  await require('./export').exportDeployment();
  if (!(await require('./check').runChecks())) return fail('checks failed');
  server = await require('./serve').startServer();
  console.log('App http://127.0.0.1:8080/  Legacy http://127.0.0.1:8080/legacy/');
}

main().catch((err) => {
  console.log(`FAIL  ${err.message}`);
  process.exit(1);
});
