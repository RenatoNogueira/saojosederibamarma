/* Moderação mínima das mensagens públicas das lanternas.
   Bloqueia: palavrões e ofensas, links, contatos (e-mail/telefone/CPF), repetição e texto sem conteúdo.
   Não substitui revisão humana: por isso há denúncia (3 denúncias ocultam a lanterna) e expiração em 7 dias.
   A lista é propositalmente curta e só de palavras inteiras, para não barrar orações e lembranças
   ("morreu", "saudade", "tambor de crioula" etc. são permitidos). */

const BANNED_RAW = [
  'porra', 'caralho', 'carai', 'caralio', 'puta', 'puto', 'putinha', 'putaria', 'merda', 'bosta', 'foda', 'foder', 'fodase',
  'fodasse', 'fodido', 'fodida', 'buceta', 'boceta', 'xoxota', 'xereca', 'piroca', 'cu', 'cuzao', 'cuzinho', 'viado', 'viadinho',
  'viadao', 'sapatao', 'arrombado', 'arrombada', 'vagabundo', 'vagabunda', 'vadia', 'cacete', 'babaca', 'otario', 'otaria',
  'idiota', 'imbecil', 'retardado', 'retardada', 'mongoloide', 'fdp', 'pqp', 'vsf', 'vtnc', 'vtmnc', 'tnc', 'krl'
];

const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const collapse = w => w.replace(/(.)\1+/g, '$1');
const BANNED = new Set(BANNED_RAW.map(collapse));

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', $: 's', '@': 'a', '!': 'i' };

/* palavras da mensagem, sem acento, com troca de "1337" e letras repetidas reduzidas */
function words(text) {
  const t = strip(String(text).toLowerCase())
    .replace(/[01345$@!7]/g, c => LEET[c])
    .replace(/[^a-z]+/g, ' ')
    .trim();
  const raw = t ? t.split(' ') : [];
  const out = [];
  let buf = '';
  for (const w of raw) {                          /* "p u t a" -> "puta" */
    if (w.length === 1) { buf += w; continue; }
    if (buf.length > 1) out.push(buf);
    buf = '';
    out.push(w);
  }
  if (buf.length > 1) out.push(buf);
  return out.map(collapse);
}

function check(text) {
  const m = String(text || '').replace(/\s+/g, ' ').trim();
  if (m.length < 3 || m.replace(/[^a-zA-ZÀ-ÿ]/g, '').length < 3) return { ok: false, reason: 'short' };
  if (m.length > 140) return { ok: false, reason: 'long' };

  /* e-mail, @usuário, telefone/CPF/CNPJ (8 ou mais dígitos, mesmo separados); antes de "link", pois e-mail tem domínio */
  if (/\S+@\S+\.\S+/.test(m) || /(^|\s)@\w{3,}/.test(m) || m.replace(/\D/g, '').length >= 8) return { ok: false, reason: 'contact' };
  /* links e endereços */
  if (/(https?:|www\.|\b[a-z0-9-]+\.(com|net|org|br|io|me|ly|gg|app|dev)\b|\bt\.me\b|\bwa\.me\b|bit\.ly)/i.test(m)) return { ok: false, reason: 'link' };
  /* repetição / spam */
  if (/(.)\1{7,}/.test(m)) return { ok: false, reason: 'spam' };
  const parts = m.toLowerCase().split(/\s+/);
  if (parts.length >= 6 && new Set(parts).size <= Math.ceil(parts.length / 4)) return { ok: false, reason: 'spam' };

  /* linguagem ofensiva */
  if (words(m).some(w => BANNED.has(w))) return { ok: false, reason: 'language' };
  return { ok: true };
}

const MESSAGES = {
  short: 'Escreva uma mensagem um pouco maior.',
  long: 'A mensagem passou de 140 caracteres.',
  link: 'Links não são permitidos nas lanternas públicas.',
  contact: 'Não coloque e-mail, telefone ou documentos na mensagem.',
  spam: 'A mensagem parece repetida. Reescreva com suas palavras.',
  language: 'Algumas palavras não são permitidas nas lanternas públicas.'
};

module.exports = { check, words, MESSAGES };
