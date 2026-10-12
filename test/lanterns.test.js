const test = require('node:test');
const assert = require('node:assert/strict');
const { check } = require('../api/_moderate');
const { handler } = require('../api/lanterns');

/* ---------- moderação ---------- */
test('moderação aceita orações, lembranças e termos locais legítimos', () => {
  [
    'Obrigado, São José, pela saúde da minha família.',
    'Em memória do meu pai, que morreu em março. Saudade eterna.',
    'Peço paz para as casas de Ribamar e proteção para os pescadores.',
    'Vou matar a saudade da minha terra no festejo de setembro!',
    'Amo o tambor de crioula e o bumba-meu-boi de matraca.',
    'Computador, culinária e cuidado não são ofensas.',
    'Que a Sagrada Família abençoe a nossa casa em 2026.'
  ].forEach(t => assert.deepEqual(check(t), { ok: true }, t));
});

test('moderação bloqueia ofensas, inclusive disfarçadas', () => {
  [
    'Isso é uma merda', 'seu idiota', 'vai tomar no cu', 'p u t a', 'caaaralho', 'f0d4-s3', 'PQP', 'que viadinho'
  ].forEach(t => assert.equal(check(t).reason, 'language', t));
});

test('moderação bloqueia links, contatos, spam e texto vazio', () => {
  assert.equal(check('acesse www.meusite.com agora').reason, 'link');
  assert.equal(check('veja https://exemplo.org/x').reason, 'link');
  assert.equal(check('chama no wa.me/5598').reason, 'link');
  assert.equal(check('meu email é maria@exemplo.com').reason, 'contact');
  assert.equal(check('liga 98 99999-1234 por favor').reason, 'contact');
  assert.equal(check('cpf 123.456.789-09').reason, 'contact');
  assert.equal(check('aaaaaaaaaaaa').reason, 'spam');
  assert.equal(check('ok ok ok ok ok ok ok ok').reason, 'spam');
  assert.equal(check('  ').reason, 'short');
  assert.equal(check('a'.repeat(141)).reason, 'long');
});

/* ---------- API (Redis simulado em memória) ---------- */
function fakeRedis() {
  const z = new Map(), kv = new Map(), sets = new Map();
  const zget = k => { if (!z.has(k)) z.set(k, new Map()); return z.get(k); };
  const run = ([cmd, key, ...a]) => {
    switch (cmd) {
      case 'INCR': kv.set(key, (Number(kv.get(key)) || 0) + 1); return kv.get(key);
      case 'EXPIRE': return 1;
      case 'SET': if (a.includes('NX') && kv.has(key)) return null; kv.set(key, a[0]); return 'OK';
      case 'ZADD': zget(key).set(a[1], Number(a[0])); return 1;
      case 'ZREMRANGEBYSCORE': { const m = zget(key); const max = Number(a[1]); [...m].forEach(([k, v]) => { if (v <= max) m.delete(k); }); return 0; }
      case 'ZREMRANGEBYRANK': {
        const m = zget(key); const sorted = [...m].sort((x, y) => x[1] - y[1]); const stop = Number(a[1]);
        const end = stop < 0 ? sorted.length + stop : stop; sorted.slice(Number(a[0]), end + 1).forEach(([k]) => m.delete(k)); return 0;
      }
      case 'ZRANGEBYSCORE': return [...zget(key)].filter(([, v]) => v >= Number(a[0])).sort((x, y) => x[1] - y[1]).map(([k]) => k);
      case 'ZRANGE': return [...zget(key)].sort((x, y) => x[1] - y[1]).map(([k]) => k);
      case 'ZREM': return zget(key).delete(a[0]) ? 1 : 0;
      case 'SADD': { if (!sets.has(key)) sets.set(key, new Set()); sets.get(key).add(a[0]); return 1; }
      case 'SCARD': return (sets.get(key) || new Set()).size;
      default: throw new Error('comando não simulado ' + cmd);
    }
  };
  return { z, fetch: async (url, opt) => ({ ok: true, json: async () => JSON.parse(opt.body).map(c => ({ result: run(c) })) }) };
}
const env = { KV_REST_API_URL: 'https://r.example', KV_REST_API_TOKEN: 't' };
function fakeRes() {
  const res = { statusCode: 0, headers: {}, body: '' };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  res.end = b => { res.body = b; };
  res.json = () => JSON.parse(res.body);
  return res;
}
const call = async (rd, req, deps = {}) => { const res = fakeRes(); await handler(req, res, { env, fetch: rd.fetch, ...deps }); return res; };
const post = (body, ip = '1.1.1.1') => ({ method: 'POST', body, headers: { 'x-forwarded-for': ip } });
const sid = n => 'sessao' + String(n).padStart(6, '0');

test('publica, lista e respeita a ordem; o cache é curto e não vaza dados da sessão', async () => {
  const rd = fakeRedis();
  let t = 1_000_000;
  const ok = await call(rd, post({ sid: sid(1), m: 'Obrigado pela saúde.', k: 'gratidao', f: 'Maria' }), { now: () => t, randomId: () => 'abc123' });
  assert.equal(ok.statusCode, 200);
  assert.deepEqual(ok.json(), { id: 'abc123', t });

  t += 60_000;
  await call(rd, post({ sid: sid(2), m: 'Peço proteção para os pescadores.', k: 'pedido' }, '2.2.2.2'), { now: () => t, randomId: () => 'def456' });

  const list = await call(rd, { method: 'GET', headers: {} }, { now: () => t + 1000 });
  assert.equal(list.statusCode, 200);
  assert.match(list.headers['cache-control'], /s-maxage=20/);
  const items = list.json().lanterns;
  assert.deepEqual(items.map(x => x.id), ['abc123', 'def456']);
  assert.deepEqual(Object.keys(items[0]).sort(), ['f', 'id', 'k', 'm', 't']);
  assert.ok(!/sessao/.test(list.body), 'sem id de sessão na resposta');
});

test('moderação é aplicada no servidor (422) e nada é gravado', async () => {
  const rd = fakeRedis();
  const r = await call(rd, post({ sid: sid(1), m: 'veja www.spam.com', k: 'pedido' }));
  assert.equal(r.statusCode, 422);
  assert.equal(r.json().reason, 'link');
  assert.equal([...(rd.z.get('ribamar:lanterns') || [])].length, 0);

  const sig = await call(rd, post({ sid: sid(2), m: 'Mensagem boa e bonita', k: 'pedido', f: 'zap 98 98888-7777' }, '3.3.3.3'));
  assert.equal(sig.statusCode, 422, 'assinatura também passa pela moderação');
});

test('entradas inválidas respondem 400', async () => {
  const rd = fakeRedis();
  for (const body of [null, {}, { sid: 'x' }, { sid: sid(1), m: 'texto ok válido', k: 'xpto' }, { sid: sid(1), m: 123, k: 'pedido' }, { sid: sid(1), report: '<x>' }]) {
    const r = await call(rd, post(body));
    assert.equal(r.statusCode, 400, JSON.stringify(body));
  }
});

test('limite por pessoa (hash de IP) e intervalo mínimo por sessão', async () => {
  const rd = fakeRedis();
  const same = n => post({ sid: sid(n), m: `Mensagem número ${n} de teste`, k: 'gratidao' }, '9.9.9.9');
  let last;
  for (let i = 1; i <= 5; i++) { last = await call(rd, same(i)); assert.equal(last.statusCode, 200, 'envio ' + i); }
  last = await call(rd, same(6));
  assert.equal(last.statusCode, 429);
  assert.equal(last.json().error, 'rate_limited');

  const rd2 = fakeRedis();
  assert.equal((await call(rd2, post({ sid: sid(1), m: 'Primeira lanterna aqui', k: 'pedido' }, '4.4.4.4'))).statusCode, 200);
  const fast = await call(rd2, post({ sid: sid(1), m: 'Segunda lanterna aqui', k: 'pedido' }, '4.4.4.4'));
  assert.equal(fast.statusCode, 429);
  assert.equal(fast.json().error, 'too_fast');
});

test('3 denúncias de pessoas diferentes ocultam a lanterna', async () => {
  const rd = fakeRedis();
  await call(rd, post({ sid: sid(1), m: 'Mensagem a ser denunciada', k: 'lembranca' }), { randomId: () => 'aaa111' });
  const rep = n => call(rd, post({ sid: sid(10 + n), report: 'aaa111' }, '5.5.5.' + n));
  assert.equal((await rep(1)).json().hidden, false);
  assert.equal((await rep(1)).json().hidden, false, 'mesma sessão não conta duas vezes');
  assert.equal((await rep(2)).json().hidden, false);
  assert.equal((await rep(3)).json().hidden, true);
  const list = await call(rd, { method: 'GET', headers: {} });
  assert.equal(list.json().lanterns.length, 0);
});

test('lanternas com mais de 7 dias não aparecem; falha do Redis vira 502', async () => {
  const rd = fakeRedis();
  const day = 24 * 3600 * 1000;
  await call(rd, post({ sid: sid(1), m: 'Mensagem antiga de teste', k: 'pedido' }), { now: () => 1_000_000, randomId: () => 'old111' });
  const list = await call(rd, { method: 'GET', headers: {} }, { now: () => 1_000_000 + 8 * day });
  assert.equal(list.json().lanterns.length, 0);

  const res = fakeRes();
  await handler({ method: 'GET', headers: {} }, res, { env, fetch: async () => { throw new Error('segredo'); } });
  assert.equal(res.statusCode, 502);
  assert.doesNotMatch(res.body, /segredo/);

  const none = fakeRes();
  await handler({ method: 'GET', headers: {} }, none, { env: {} });
  assert.equal(none.statusCode, 503);
  const put = fakeRes();
  await handler({ method: 'PUT', headers: {} }, put, { env });
  assert.equal(put.statusCode, 405);
});
