/* Servidor de desenvolvimento: renderiza o EJS a cada requisição e serve /public.
   Mantido separado de server.js para poder ser testado (test/server.test.js). */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
};
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN'
};

/* em desenvolvimento, recarrega módulos de dados e renderização a cada requisição */
function freshRender() {
  const lib = path.join(ROOT, 'lib') + path.sep;
  const data = path.join(ROOT, 'data') + path.sep;
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(lib) || key.startsWith(data)) delete require.cache[key];
  }
  return require('./render').render();
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, SECURITY, headers));
  res.end(body);
}

/* resolve a URL para um arquivo dentro de /public, ou null se for inválida/fora da pasta */
function resolvePublic(rawUrl) {
  let pathname;
  try { pathname = decodeURIComponent(rawUrl.split('?')[0].split('#')[0]); } catch { return null; }
  if (pathname.includes('\0')) return null;
  const file = path.resolve(PUBLIC, '.' + path.posix.normalize('/' + pathname));
  if (file !== PUBLIC && !file.startsWith(PUBLIC + path.sep)) return null;
  return file;
}

function handler(render = freshRender) {
  return async (req, res) => {
    try {
      const apiPath = req.url ? req.url.split('?')[0] : '';
      if (apiPath === '/api/visitors') return require('../api/visitors')(req, res);
      if (apiPath === '/api/lanterns') return require('../api/lanterns')(req, res);
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método não permitido', { Allow: 'GET, HEAD' });
      const url = req.url || '/';
      const clean = url.split('?')[0];

      if (clean === '/' || clean === '/index.html') {
        const html = await render();
        return send(res, 200, req.method === 'HEAD' ? undefined : html, { 'Content-Type': TYPES['.html'] });
      }
      const file = resolvePublic(url);
      if (!file) return send(res, 400, 'Requisição inválida');
      let stat;
      try { stat = fs.statSync(file); } catch { stat = null; }
      if (!stat || !stat.isFile()) return send(res, 404, 'Não encontrado');

      res.writeHead(200, Object.assign({
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Content-Length': stat.size, 'Cache-Control': 'no-store'
      }, SECURITY));
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
    } catch (err) {
      console.error(err);
      send(res, 500, 'Erro ao renderizar: ' + err.message);
    }
  };
}

function createServer(render) {
  const server = http.createServer(handler(render));
  server.on('clientError', (err, socket) => {
    if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
  });
  return server;
}

module.exports = { createServer, handler, resolvePublic, TYPES };
