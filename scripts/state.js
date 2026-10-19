// Chain state management (SPEC 3.5): reset | snapshot | restore. Refuses while port 7545 is in use.
// Usage: node scripts/state.js <reset|snapshot|restore>
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { portBusy, GANACHE_DIR, PORT } = require('./chain');

const DB = path.join(GANACHE_DIR, 'db');
const SNAP_DIR = path.join(GANACHE_DIR, 'snapshots');
const GOLDEN = path.join(SNAP_DIR, 'golden.tar');

const actions = {
  reset() {
    fs.rmSync(DB, { recursive: true, force: true });
    fs.rmSync(path.join(GANACHE_DIR, 'keys.json'), { force: true });
    return 'chain state deleted (.ganache/db, keys.json)';
  },
  snapshot() {
    if (!fs.existsSync(DB)) throw new Error('no .ganache/db to snapshot');
    fs.mkdirSync(SNAP_DIR, { recursive: true });
    execFileSync('tar', ['-cf', GOLDEN, '-C', GANACHE_DIR, 'db']);
    return 'saved .ganache/snapshots/golden.tar';
  },
  restore() {
    if (!fs.existsSync(GOLDEN)) throw new Error('no .ganache/snapshots/golden.tar: run npm run snapshot first');
    fs.rmSync(DB, { recursive: true, force: true });
    execFileSync('tar', ['-xf', GOLDEN, '-C', GANACHE_DIR]);
    return 'restored .ganache/db from golden.tar';
  },
};

(async () => {
  const action = Object.hasOwn(actions, process.argv[2]) && actions[process.argv[2]];
  if (!action || process.argv.length !== 3) {
    console.log('usage: node scripts/state.js <reset|snapshot|restore>');
    process.exit(2);
  }
  try {
    if (await portBusy()) throw new Error(`port ${PORT} is in use: stop the chain first`);
    console.log(`PASS  ${action()}`);
  } catch (err) {
    console.log(`FAIL  ${err.message}`);
    process.exit(1);
  }
})();
