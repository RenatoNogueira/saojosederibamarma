/* Céu compartilhado de lanternas (função serverless da Vercel).
     GET  /api/lanterns                 → { lanterns: [{ id, m, k, f, t }, ...] }   (últimas, até 7 dias)
     POST /api/lanterns {sid,m,k,f}     → { id, t }                                  (publica)
     POST /api/lanterns {sid,report}    → { ok, hidden }                             (denúncia)
   Armazenamento: Redis (sorted set por data). Não guarda IP: só um hash curto, por 1 h, para limitar abuso. */

const crypto = require('crypto');
const { redisConfig, pipeline, readBody, json } = require('./_redis');
const { check, MESSAGES } = require('./_moderate');

const KEY = 'ribamar:lanterns';
const TTL_MS = 7 * 24 * 3600 * 1000;      /* lanternas somem em 7 dias */
const MAX_STORED = 100;
const MAX_RETURN = 40;
const PER_HOUR = 5;                       /* publicações por pessoa (hash de IP) por hora */
const COOLDOWN_S = 20;                    /* intervalo mínimo entre duas publicações da mesma sessão */
const REPORTS_TO_HIDE = 3;
const KINDS = new Set(['gratidao', 'pedido', 'lembranca']);
const SID_RE = /^[a-z0-9]{8,40}$/;
const ID_RE = /^[a-z0-9]{6,16}$/;

const clientHash = (req, env) => {
  const h = req.headers || {};
  const ip = String(h['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || 'desconhecido').split(',')[0].trim();
  return crypto.createHash('sha256').update(ip + '|' + (env.LANTERN_SALT || 'ribamar')).digest('hex').slice(0, 20);
};

function parseMember(s) {
  try {
    const o = JSON.parse(s);
    if (o && ID_RE.test(o.id) && typeof o.m === 'string' && KINDS.has(o.k) && Number.isFinite(o.t)) return { id: o.id, m: o.m, k: o.k, f: typeof o.f === 'string' ? o.f : '', t: o.t };
  } catch { /* ignora membro corrompido */ }
  return null;
}

async function handler(req, res, deps = {}) {
  const env = deps.env || process.env;
  const fetchImpl = deps.fetch || fetch;
  const now = deps.now ? deps.now() : Date.now();
  const cfg = redisConfig(env);
  const run = cmds => pipeline(cfg, cmds, fetchImpl);

  if (req.method !== 'GET' && req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { error: 'method_not_allowed' }); }
  if (!cfg) return json(res, 503, { error: 'unconfigured' });

  try {
    /* ---------- leitura ---------- */
    if (req.method === 'GET') {
      const [members] = await run([['ZRANGEBYSCORE', KEY, String(now - TTL_MS), '+inf']]);
      const lanterns = (Array.isArray(members) ? members : []).map(parseMember).filter(Boolean)
        .sort((a, b) => a.t - b.t).slice(-MAX_RETURN);
      return json(res, 200, { lanterns }, { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' });
    }

    /* ---------- escrita ---------- */
    const body = await readBody(req);
    if (!body || typeof body !== 'object' || typeof body.sid !== 'string' || !SID_RE.test(body.sid)) return json(res, 400, { error: 'bad_request' });

    /* denúncia */
    if (body.report !== undefined) {
      if (typeof body.report !== 'string' || !ID_RE.test(body.report)) return json(res, 400, { error: 'bad_request' });
      const repKey = 'ribamar:rep:' + body.report;
      const [, , count] = await run([['SADD', repKey, body.sid], ['EXPIRE', repKey, String(TTL_MS / 1000)], ['SCARD', repKey]]);
      let hidden = false;
      if (Number(count) >= REPORTS_TO_HIDE) {
        const [all] = await run([['ZRANGE', KEY, '0', '-1']]);
        const target = (Array.isArray(all) ? all : []).find(s => { const o = parseMember(s); return o && o.id === body.report; });
        if (target) { await run([['ZREM', KEY, target]]); hidden = true; }
      }
      return json(res, 200, { ok: true, hidden });
    }

    /* publicação */
    if (typeof body.m !== 'string' || !KINDS.has(body.k)) return json(res, 400, { error: 'bad_request' });
    const m = body.m.replace(/\s+/g, ' ').trim();
    const f = typeof body.f === 'string' ? body.f.replace(/\s+/g, ' ').trim().slice(0, 30) : '';
    const verdict = check(m);
    if (!verdict.ok) return json(res, 422, { error: 'moderation', reason: verdict.reason, message: MESSAGES[verdict.reason] });
    if (f) {
      const v2 = check(f.length < 3 ? f + '   ' : f);
      if (!v2.ok && v2.reason !== 'short') return json(res, 422, { error: 'moderation', reason: v2.reason, message: MESSAGES[v2.reason] });
    }

    const rl = 'ribamar:rl:' + clientHash(req, env);
    const cd = 'ribamar:cd:' + body.sid;
    const [n, , cooldown] = await run([['INCR', rl], ['EXPIRE', rl, '3600'], ['SET', cd, '1', 'NX', 'EX', String(COOLDOWN_S)]]);
    if (Number(n) > PER_HOUR) return json(res, 429, { error: 'rate_limited', message: 'Você acendeu muitas lanternas. Tente de novo mais tarde.' });
    if (cooldown === null) return json(res, 429, { error: 'too_fast', message: 'Aguarde alguns segundos antes de acender outra.' });

    const id = (deps.randomId ? deps.randomId() : crypto.randomBytes(6).toString('hex'));
    const member = JSON.stringify({ id, m, k: body.k, f, t: now });
    await run([
      ['ZADD', KEY, String(now), member],
      ['ZREMRANGEBYSCORE', KEY, '-inf', String(now - TTL_MS)],
      ['ZREMRANGEBYRANK', KEY, '0', String(-(MAX_STORED + 1))]
    ]);
    return json(res, 200, { id, t: now });
  } catch {
    return json(res, 502, { error: 'upstream' });
  }
}

module.exports = (req, res) => handler(req, res);
module.exports.handler = handler;
