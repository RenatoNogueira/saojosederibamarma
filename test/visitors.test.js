const test = require('node:test');
const assert = require('node:assert/strict');
const { handler, redisConfig } = require('../api/visitors');

function fakeRes() {
  const res = { statusCode: 0, headers: {}, body: '' };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  res.end = b => { res.body = b; };
  return res;
}
const env = { KV_REST_API_URL: 'https://redis.example/', KV_REST_API_TOKEN: 'tok' };
const okFetch = (online, total, calls = []) => async (url, opt) => {
  calls.push({ url, opt });
  return { ok: true, json: async () => [{ result: 1 }, { result: 0 }, { result: online }, { result: total }, { result: 1 }] };
};
const post = body => ({ method: 'POST', body });

test('redisConfig aceita os dois nomes de variável e rejeita ausência', () => {
  assert.deepEqual(redisConfig({ KV_REST_API_URL: 'https://a/', KV_REST_API_TOKEN: 't' }), { url: 'https://a', token: 't' });
  assert.deepEqual(redisConfig({ UPSTASH_REDIS_REST_URL: 'https://b', UPSTASH_REDIS_REST_TOKEN: 'u' }), { url: 'https://b', token: 'u' });
  assert.deepEqual(redisConfig({ STORAGE_KV_REST_API_URL: 'https://c/', STORAGE_KV_REST_API_TOKEN: 'v', STORAGE_KV_REST_API_READ_ONLY_TOKEN: 'ro' }), { url: 'https://c', token: 'v' }, 'prefixo personalizado');
  assert.equal(redisConfig({ KV_REST_API_URL: 'https://d', KV_REST_API_READ_ONLY_TOKEN: 'ro' }), null, 'token somente leitura não serve');
  assert.equal(redisConfig({}), null);
});

test('GET é rejeitado com 405', async () => {
  const res = fakeRes();
  await handler({ method: 'GET' }, res, { env });
  assert.equal(res.statusCode, 405);
});

test('sem Redis configurado responde 503 (o front esconde o contador)', async () => {
  const res = fakeRes();
  await handler(post({ sid: 'abcdefgh1234' }), res, { env: {} });
  assert.equal(res.statusCode, 503);
});

test('id de sessão inválido responde 400 e não chama o Redis', async () => {
  for (const sid of [undefined, '', 'curto', 'COM MAIUSCULAS', 'a'.repeat(80), '<script>alert(1)</script>', 123]) {
    const calls = [];
    const res = fakeRes();
    await handler(post({ sid }), res, { env, fetch: okFetch(1, 1, calls) });
    assert.equal(res.statusCode, 400, `sid=${String(sid).slice(0, 20)}`);
    assert.equal(calls.length, 0);
  }
});

test('visita nova incrementa o total; retorno de heartbeat só lê', async () => {
  const calls = [];
  let res = fakeRes();
  await handler(post({ sid: 'abcdefgh1234', newVisit: true }), res, { env, now: () => 1_000_000, fetch: okFetch(3, 41, calls) });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body), { total: 41, online: 3 });
  assert.equal(res.headers['cache-control'], 'no-store');
  const sent = JSON.parse(calls[0].opt.body);
  assert.deepEqual(sent[0], ['ZADD', 'ribamar:online', '1000000', 'abcdefgh1234']);
  assert.deepEqual(sent[1], ['ZREMRANGEBYSCORE', 'ribamar:online', '-inf', String(1_000_000 - 70_000)]);
  assert.equal(sent[3][0], 'INCR');
  assert.equal(calls[0].opt.headers.Authorization, 'Bearer tok');
  assert.equal(calls[0].url, 'https://redis.example/pipeline');

  calls.length = 0; res = fakeRes();
  await handler(post({ sid: 'abcdefgh1234', newVisit: false }), res, { env, fetch: okFetch(2, 41, calls) });
  assert.equal(JSON.parse(calls[0].opt.body)[3][0], 'GET');
});

test('falha do Redis vira 502 sem vazar detalhes', async () => {
  let res = fakeRes();
  await handler(post({ sid: 'abcdefgh1234' }), res, { env, fetch: async () => { throw new Error('segredo-interno'); } });
  assert.equal(res.statusCode, 502);
  assert.doesNotMatch(res.body, /segredo/);

  res = fakeRes();
  await handler(post({ sid: 'abcdefgh1234' }), res, { env, fetch: async () => ({ ok: false, status: 500 }) });
  assert.equal(res.statusCode, 502);

  res = fakeRes();
  await handler(post({ sid: 'abcdefgh1234' }), res, { env, fetch: async () => ({ ok: true, json: async () => [{ error: 'WRONGTYPE' }] }) });
  assert.equal(res.statusCode, 502);
});

test('corpo em texto JSON inválido responde 400', async () => {
  const res = fakeRes();
  await handler({ method: 'POST', body: '{nao-json' }, res, { env, fetch: okFetch(1, 1) });
  assert.equal(res.statusCode, 400);
});
