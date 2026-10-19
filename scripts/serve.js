// Static server on 127.0.0.1: the app (frontend/dist), the legacy page and deployment.json (SPEC 3.5).
// Usage: node scripts/serve.js. Only the whitelisted files below are ever served.
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'frontend', 'dist');
const DEPLOY_FILE = path.join(ROOT, 'frontend', 'public', 'deployment.json');
const LEGACY = {
  '/legacy/': path.join(ROOT, 'index.html'),
  '/legacy/cryptozombies_abi.js': path.join(ROOT, 'cryptozombies_abi.js'),
  '/legacy/favicon.ico': path.join(ROOT, 'favicon.ico'),
};
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function sendText(res, status, text, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(text);
}

function sendFile(req, res, file, headers = {}) {
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Content-Length': fs.statSync(file).size,
    ...headers,
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
}

function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendText(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  } catch {
    return sendText(res, 404, 'Not found');
  }

  if (pathname === '/legacy') {
    return sendText(res, 301, 'Moved', { Location: '/legacy/' });
  }
  if (pathname === '/deployment.json') {
    if (!fs.existsSync(DEPLOY_FILE)) return sendText(res, 404, 'Not found');
    return sendFile(req, res, DEPLOY_FILE, { 'Cache-Control': 'no-store' });
  }
  if (LEGACY[pathname]) return sendFile(req, res, LEGACY[pathname]);
  if (pathname.startsWith('/legacy/')) return sendText(res, 404, 'Not found');

  if (!fs.existsSync(DIST)) return sendText(res, 503, 'frontend/dist missing. Run npm run build');
  // Unknown extension-less paths get the SPA shell; anything with an extension must exist in dist.
  let file = path.join(DIST, pathname);
  if (!file.startsWith(DIST + path.sep)) return sendText(res, 404, 'Not found');
  if (path.extname(pathname) === '') file = path.join(DIST, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return sendText(res, 404, 'Not found');
  return sendFile(req, res, file);
}

// Resolves to the http.Server once it is listening; rejects if the port is busy.
function startServer({ port = 8080 } = {}) {
  const server = http.createServer(handle);
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

if (require.main === module) {
  startServer().then(
    () => {
      console.log('PASS  App http://127.0.0.1:8080/  Legacy http://127.0.0.1:8080/legacy/');
      if (!fs.existsSync(DIST)) console.log('WARN  frontend/dist missing: run npm run build');
    },
    (err) => {
      console.log(`FAIL  ${err.code === 'EADDRINUSE' ? 'port 8080 is busy' : err.message}`);
      process.exitCode = 1;
    },
  );
}

module.exports = { startServer };
