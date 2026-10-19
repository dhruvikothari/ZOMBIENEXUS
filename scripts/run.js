// Runs a command with HOME/TMPDIR/XDG/npm cache pinned inside the project,
// so npm/truffle/ganache never write config outside it.
// Usage: node scripts/run.js <cmd> [args...]
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOME = path.join(ROOT, '.home');
const TMP = path.join(ROOT, '.tmp');
fs.mkdirSync(HOME, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('usage: node scripts/run.js <cmd> [args...]');
  process.exit(2);
}

const env = {
  ...process.env,
  HOME,
  TMPDIR: TMP,
  XDG_CONFIG_HOME: path.join(HOME, '.config'),
  XDG_CACHE_HOME: path.join(HOME, '.cache'),
  PATH: path.join(ROOT, 'node_modules', '.bin') + path.delimiter + (process.env.PATH || ''),
  npm_config_update_notifier: 'false',
};

const child = spawn(cmd, args, { cwd: ROOT, env, shell: false, stdio: 'inherit' });
child.on('error', (e) => {
  console.error(`run.js: cannot start "${cmd}": ${e.message}`);
  process.exit(127);
});
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => child.kill(sig));
child.on('exit', (code, signal) => {
  if (signal) {
    process.removeAllListeners(signal);
    process.kill(process.pid, signal);
  } else {
    process.exit(code === null ? 1 : code);
  }
});
