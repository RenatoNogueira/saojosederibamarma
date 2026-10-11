/* Contador de visitantes (função serverless da Vercel).
   POST /api/visitors   { sid: "<id aleatório da sessão>", newVisit: true|false }
   → { total: <visitas>, online: <pessoas com a página aberta agora> }

   Armazenamento: Redis via REST (Upstash / Vercel Marketplace). Variáveis aceitas:
     KV_REST_API_URL + KV_REST_API_TOKEN            (integração Upstash na Vercel)
     UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
   Privacidade: não guarda IP, cookie nem dado pessoal; só um id aleatório que expira em 90 s. */

const ONLINE_KEY = 'ribamar:online';
const TOTAL_KEY = 'ribamar:visits';
const WINDOW_MS = 70 * 1000;          /* quem não "bateu ponto" nos últimos 70 s sai da contagem */
const SID_RE = /^[a-z0-9]{8,40}$/;

function redisConfig(env = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return null; } }
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 2048) return null;       /* corpo grande demais para este endpoint */
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return null; }
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

async function handler(req, res, deps = {}) {
  const fetchImpl = deps.fetch || fetch;
  const now = deps.now ? deps.now() : Date.now();
  const cfg = redisConfig(deps.env || process.env);

  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'method_not_allowed' }); }
  if (!cfg) return json(res, 503, { error: 'unconfigured' });

  const body = await readBody(req);
  if (!body || typeof body.sid !== 'string' || !SID_RE.test(body.sid)) return json(res, 400, { error: 'bad_request' });
  const newVisit = body.newVisit === true;

  /* uma única ida ao Redis (pipeline) */
  const commands = [
    ['ZADD', ONLINE_KEY, String(now), body.sid],
    ['ZREMRANGEBYSCORE', ONLINE_KEY, '-inf', String(now - WINDOW_MS)],
    ['ZCARD', ONLINE_KEY],
    newVisit ? ['INCR', TOTAL_KEY] : ['GET', TOTAL_KEY],
    ['EXPIRE', ONLINE_KEY, '300']
  ];
  let results;
  try {
    const r = await fetchImpl(cfg.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + cfg.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands)
    });
    if (!r.ok) throw new Error('redis ' + r.status);
    results = await r.json();
  } catch {
    return json(res, 502, { error: 'upstream' });
  }
  if (!Array.isArray(results) || results.some(x => x && x.error)) return json(res, 502, { error: 'upstream' });

  const online = Number(results[2] && results[2].result) || 0;
  const total = Number(results[3] && results[3].result) || 0;
  return json(res, 200, { total, online });
}

module.exports = (req, res) => handler(req, res);
module.exports.handler = handler;
module.exports.redisConfig = redisConfig;
