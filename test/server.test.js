const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer, resolvePublic } = require('../lib/server');

function listen(render) {
  return new Promise(resolve => {
    const server = createServer(render).listen(0, '127.0.0.1', () => resolve(server));
  });
}
/* requisição crua (permite caminhos que o cliente HTTP normalizaria) */
function raw(port, pathName, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: pathName, method }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('resolvePublic: rejeita saída da pasta e entradas inválidas', () => {
  assert.equal(resolvePublic('/../package.json'), resolvePublic('/package.json'), '.. é neutralizado dentro de /public');
  assert.equal(resolvePublic('/%E0%A4%A'), null, 'URL malformada');
  assert.equal(resolvePublic('/a%00b'), null, 'byte nulo');
  assert.ok(resolvePublic('/css/main.css').endsWith('main.css'));
  const outside = resolvePublic('/..%2f..%2fpackage.json');
  assert.ok(outside === null || outside.includes('public'), 'não escapa de /public');
});

test('servidor responde, entrega assets e não cai com URL malformada', async () => {
  const server = await listen(async () => '<!doctype html><h1>ok</h1>');
  const { port } = server.address();
  try {
    const home = await raw(port, '/');
    assert.equal(home.status, 200);
    assert.match(home.headers['content-type'], /text\/html/);
    assert.equal(home.headers['x-content-type-options'], 'nosniff');

    const css = await raw(port, '/css/main.css');
    assert.equal(css.status, 200);
    assert.match(css.headers['content-type'], /text\/css/);

    assert.equal((await raw(port, '/nao-existe.png')).status, 404);
    assert.equal((await raw(port, '/css')).status, 404, 'diretório não é servido');
    assert.equal((await raw(port, '/%E0%A4%A')).status, 400, 'URL malformada vira 400');
    assert.equal((await raw(port, '/..%2f..%2fpackage.json')).status, 404, 'path traversal bloqueado');
    assert.equal((await raw(port, '/', 'POST')).status, 405);
    assert.equal((await raw(port, '/', 'HEAD')).status, 200);

    /* o servidor continua vivo depois de tudo isso */
    assert.equal((await raw(port, '/')).status, 200);
  } finally {
    server.close();
  }
});

test('erro de renderização vira 500 sem derrubar o servidor', async () => {
  const server = await listen(async () => { throw new Error('falha simulada'); });
  const { port } = server.address();
  const origError = console.error;
  console.error = () => {};
  try {
    const r = await raw(port, '/');
    assert.equal(r.status, 500);
    assert.match(r.body, /falha simulada/);
    assert.equal((await raw(port, '/css/main.css')).status, 200);
  } finally {
    console.error = origError;
    server.close();
  }
});
