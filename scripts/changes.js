// Compares the project with .baseline/MANIFEST.sha256 (the starter snapshot).
// Usage: node scripts/changes.js [--json]. Exit 1 if a NO-TOUCH file changed or is missing.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = [
  '.git', '.baseline', '.checkpoints', 'node_modules', '.tools', '.home', '.tmp',
  '.npm-cache', '.ganache', '.chrome-profile', 'graphify-out', 'build', 'frontend/dist', '.DS_Store',
];
const NO_TOUCH = [
  'contracts/ownable.sol', 'contracts/safemath.sol',
  'contracts/erc721.sol', 'contracts/Migrations.sol', 'migrations/1_initial_migration.js',
  'cryptozombies_abi.js', 'web3.min.js', 'favicon.ico',
  'CryptoZombieCard.jpeg', 'Midterm project-Guidelines.pdf', 'project-guideline.mp4',
];

const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const baseline = {};
const manifest = path.join(ROOT, '.baseline', 'MANIFEST.sha256');
for (const line of fs.readFileSync(manifest, 'utf8').split('\n')) {
  const m = line.match(/^([0-9a-f]{64})\s+(?:\.\/)?(.+)$/);
  if (m) baseline[m[2]] = m[1];
}

const current = {};
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    if (EXCLUDE.includes(rel) || EXCLUDE.includes(entry.name)) continue;
    if (entry.isDirectory()) walk(abs);
    else if (entry.isFile()) current[rel] = sha(abs);
  }
})(ROOT);

const created = Object.keys(current).filter((f) => !(f in baseline)).sort();
const modified = Object.keys(current).filter((f) => f in baseline && baseline[f] !== current[f]).sort();
const removed = Object.keys(baseline).filter((f) => !(f in current)).sort();
const violations = NO_TOUCH.filter((f) => modified.includes(f) || removed.includes(f));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ created, modified, removed, noTouchViolations: violations }, null, 2));
} else {
  for (const [title, list] of [['Created', created], ['Modified', modified], ['Removed', removed]]) {
    console.log(`${title} (${list.length})`);
    for (const f of list) console.log(`  ${f}`);
  }
  console.log(violations.length ? `NO-TOUCH VIOLATIONS: ${violations.join(', ')}` : 'NO-TOUCH ok');
}
process.exit(violations.length ? 1 : 0);
