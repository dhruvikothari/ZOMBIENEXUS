// Environment check: Node version, installed dependencies, free ports, npm registry (SPEC 3.5).
// Usage: node scripts/doctor.js. Exit 1 on any FAIL; WARN does not fail.
const fs = require('fs');
const net = require('net');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let failed = false;
const line = (status, text) => {
  if (status === 'FAIL') failed = true;
  console.log(`${status}  ${text}`);
};

function atLeast(version, [major, minor]) {
  const [maj, min] = version.split('.').map(Number);
  return maj > major || (maj === major && min >= minor);
}

function portFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)));
  });
}

async function main() {
  const node = process.versions.node;
  if (!atLeast(node, [20, 19])) line('FAIL', `Node ${node}: need 20.19+`);
  else if (!atLeast(node, [22, 22])) line('WARN', `Node ${node}: npm run test:ui needs Node 22.22+`);
  else line('PASS', `Node ${node}`);

  const solc = path.join(ROOT, 'node_modules', 'solc', 'soljson.js');
  if (fs.existsSync(solc)) line('PASS', 'node_modules installed');
  else line('FAIL', 'node_modules/solc/soljson.js missing: run npm ci');

  for (const port of [7545, 8080]) {
    if (await portFree(port)) line('PASS', `port ${port} free`);
    else line('WARN', `port ${port} busy`);
  }

  try {
    await fetch('https://registry.npmjs.org/', { signal: AbortSignal.timeout(3000) });
    line('PASS', 'npm registry reachable');
  } catch {
    line('WARN', 'npm registry not reachable within 3 s');
  }
}

main().then(() => {
  process.exitCode = failed ? 1 : 0;
});
