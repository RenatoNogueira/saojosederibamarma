/* Cliente Redis REST (Upstash / Vercel Marketplace) compartilhado pelas funções da API.
   Arquivos que começam com "_" não viram rotas na Vercel. */

/* Aceita os nomes padrão e variantes com prefixo (ex.: STORAGE_KV_REST_API_URL), criadas quando se
   escolhe um prefixo personalizado ao conectar o banco. O token somente leitura é ignorado. */
function redisConfig(env = process.env) {
  const urlRe = /(^|_)(KV_REST_API_URL|UPSTASH_REDIS_REST_URL)$/;
  const tokenRe = /(^|_)(KV_REST_API_TOKEN|UPSTASH_REDIS_REST_TOKEN)$/;
  const keys = Object.keys(env);
  for (const uk of keys.filter(k => urlRe.test(k) && env[k])) {
    const prefix = uk.replace(urlRe, '$1');
    const tk = keys.find(k => tokenRe.test(k) && env[k] && k.replace(tokenRe, '$1') === prefix && !/READ_ONLY/.test(k));
    if (tk) return { url: String(env[uk]).replace(/\/+$/, ''), token: env[tk] };
  }
  return null;
}

/* executa vários comandos numa única ida; devolve só os "result" (lança erro se algo falhar) */
async function pipeline(cfg, commands, fetchImpl = fetch) {
  const r = await fetchImpl(cfg.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + cfg.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  const res = await r.json();
  if (!Array.isArray(res) || res.some(x => x && x.error)) throw new Error('redis erro de comando');
  return res.map(x => (x ? x.result : null));
}

/* lê o corpo JSON (já parseado pela Vercel ou em stream), com limite de tamanho */
async function readBody(req, limit = 2048) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return null; } }
    return req.body;
  }
  if (!req || typeof req[Symbol.asyncIterator] !== 'function') return null;
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) return null;
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return null; }
}

function json(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', headers['Cache-Control'] || 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  Object.keys(headers).forEach(k => { if (k !== 'Cache-Control') res.setHeader(k, headers[k]); });
  res.end(JSON.stringify(body));
}

module.exports = { redisConfig, pipeline, readBody, json };
