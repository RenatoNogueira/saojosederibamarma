#!/usr/bin/env node
/* Validação do projeto: dados, fotos, HTML gerado, assets e padrões de código arriscados.
   Uso:  node scripts/validate.js          (falha com código 1 se houver erros)
         node scripts/validate.js --warn   (nunca falha; só imprime)            */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const errors = [];
const warns = [];
const err = (area, msg) => errors.push(`[${area}] ${msg}`);
const warn = (area, msg) => warns.push(`[${area}] ${msg}`);
const read = p => fs.readFileSync(p, 'utf8');
const exists = p => fs.existsSync(p);

function uniq(area, list, key, label) {
  const seen = new Map();
  list.forEach((o, i) => {
    const k = o[key];
    if (k === undefined || k === '') return err(area, `${label}[${i}] sem "${key}"`);
    if (seen.has(k)) err(area, `${label}: "${k}" duplicado (posições ${seen.get(k)} e ${i})`);
    seen.set(k, i);
  });
  return new Set(seen.keys());
}
function need(area, o, fields, label) {
  fields.forEach(f => {
    const v = o[f];
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length)) err(area, `${label} sem "${f}"`);
  });
}

/* ---------- 1. dados ---------- */
function validateData() {
  delete require.cache[require.resolve('../data/site')];
  delete require.cache[require.resolve('../data/extra')];
  const site = require('../data/site');
  const extra = require('../data/extra');

  const hist = uniq('história', site.history, 'id', 'history');
  site.history.forEach(h => {
    need('história', h, ['year', 'cat', 'title', 'short', 'body', 'src'], `history:${h.id}`);
    if (!site.accents[h.cat]) err('história', `history:${h.id} usa tema inexistente "${h.cat}"`);
  });

  const places = uniq('lugares', site.places, 'id', 'places');
  site.places.forEach(p => {
    need('lugares', p, ['name', 'cat', 'icon', 'slot', 'short', 'body', 'tags'], `place:${p.id}`);
    if (!['manhã', 'tarde', 'noite'].includes(p.slot)) err('lugares', `place:${p.id} período inválido "${p.slot}"`);
    if (!site.accents[p.cat]) err('lugares', `place:${p.id} tema inexistente "${p.cat}"`);
  });

  const routes = uniq('rotas', site.routes, 'id', 'routes');
  site.routes.forEach(r => need('rotas', r, ['name', 'q', 'icon', 'line'], `route:${r.id}`));
  site.places.forEach(p => { if (!routes.has(p.id)) warn('rotas', `place:${p.id} não tem rota em "Como chegar" (botão não aparece)`); });

  uniq('cultura', site.culture, 'id', 'culture');
  site.culture.forEach(c => need('cultura', c, ['name', 'kicker', 'body', 'ac'], `culture:${c.id}`));

  site.quiz.forEach((q, i) => {
    need('quiz', q, ['q', 'o', 'e'], `quiz[${i}]`);
    if (!Number.isInteger(q.a) || q.a < 0 || q.a >= (q.o || []).length) err('quiz', `quiz[${i}] resposta correta fora do intervalo`);
    if (new Set(q.o).size !== (q.o || []).length) err('quiz', `quiz[${i}] opções repetidas`);
  });

  const f = site.festejo;
  const dim = f.days;
  f.events.forEach(e => {
    need('festejo', e, ['id', 'name', 'time', 'desc', 'stops'], `festejo:${e.id}`);
    if (e.day !== null && (e.day < 1 || e.day > dim)) err('festejo', `${e.id}: dia ${e.day} fora do mês`);
  });
  uniq('festejo', f.events, 'id', 'festejo.events');

  site.nav.forEach(([id]) => { /* conferido contra o HTML em validateHtml */ });

  /* extra */
  const dish = uniq('sabores', extra.dishes, 'id', 'dishes');
  extra.dishes.forEach(d => need('sabores', d, ['name', 'kicker', 'short', 'body', 'icon', 'ac', 'src'], `dish:${d.id}`));
  const stays = uniq('hospedagem', extra.stays, 'id', 'stays');
  extra.stays.forEach(s => need('hospedagem', s, ['name', 'kicker', 'short', 'body', 'icon', 'ac', 'src'], `stay:${s.id}`));
  const areas = uniq('onde comer', extra.eatAreas, 'id', 'eatAreas');
  uniq('onde comer', extra.eats, 'id', 'eats');
  extra.eats.forEach(e => {
    need('onde comer', e, ['name', 'area', 'where', 'food'], `eat:${e.id}`);
    if (!areas.has(e.area)) err('onde comer', `eat:${e.id} região inexistente "${e.area}"`);
    if (e.rating && !/^\d,\d$/.test(e.rating)) err('onde comer', `eat:${e.id} nota fora do formato 0,0: "${e.rating}"`);
    if (e.rating && !(e.n > 0)) err('onde comer', `eat:${e.id} tem nota sem número de avaliações`);
    if (e.n && e.n < 20) warn('onde comer', `eat:${e.id} nota com poucas avaliações (${e.n})`);
  });
  const evs = uniq('calendário', extra.events, 'id', 'events');
  extra.events.forEach(e => {
    need('calendário', e, ['name', 'kicker', 'short', 'body', 'icon', 'ac', 'year', 'src'], `event:${e.id}`);
    if (!(e.month >= 1 && e.month <= 12)) err('calendário', `event:${e.id} mês inválido (${e.month})`);
  });
  const mo = extra.events.map(e => e.month);
  if (mo.join() !== [...mo].sort((a, b) => a - b).join()) warn('calendário', 'eventos fora de ordem cronológica');

  /* cores e ícones */
  const icons = (() => {
    const src = read(path.join(ROOT, 'lib/render.js'));
    const m = src.match(/const ICONS = \{([\s\S]*?)\n\};/);
    return new Set([...(m ? m[1] : '').matchAll(/^\s*([a-z]+):/gm)].map(x => x[1]));
  })();
  const checkIcon = (area, label, icon) => { if (icon && !icons.has(icon)) err(area, `${label} usa ícone inexistente "${icon}"`); };
  site.places.forEach(p => checkIcon('lugares', `place:${p.id}`, p.icon));
  site.routes.forEach(r => checkIcon('rotas', `route:${r.id}`, r.icon));
  site.culture.forEach(c => checkIcon('cultura', `culture:${c.id}`, c.icon));
  site.numbers.forEach(n => checkIcon('números', `número "${n.label}"`, n.icon));
  [...extra.dishes, ...extra.stays, ...extra.events].forEach(o => {
    checkIcon('extra', o.id, o.icon);
    if (o.ac && !/^#[0-9a-f]{6}$/i.test(o.ac)) err('extra', `${o.id}: cor inválida "${o.ac}"`);
  });

  return { hist, places, routes, dish, stays, evs, site };
}

/* ---------- 2. fotos ---------- */
function validatePhotos(routes) {
  delete require.cache[require.resolve('../data/photos')];
  const list = require('../data/photos');
  const cats = new Set(['fe', 'interior', 'cidade', 'cultura', 'mar']);
  const shapes = new Set(['std', 'wide', 'tall', 'feat']);
  const files = new Set(fs.existsSync(path.join(PUB, 'photos')) ? fs.readdirSync(path.join(PUB, 'photos')) : []);
  const seen = new Set();
  list.forEach(p => {
    const l = `foto:${p.file}`;
    if (seen.has(p.file)) err('fotos', `${l} duplicada no manifesto`);
    seen.add(p.file);
    need('fotos', p, ['file', 'title', 'alt', 'cat'], l);
    if (!files.has(p.file)) err('fotos', `${l} listada mas o arquivo não existe em public/photos`);
    if (!cats.has(p.cat)) err('fotos', `${l} tema inválido "${p.cat}"`);
    if (p.shape && !shapes.has(p.shape)) err('fotos', `${l} formato inválido "${p.shape}"`);
    if (p.alt && p.alt.length < 25) warn('fotos', `${l} texto alternativo muito curto`);
    if (p.alt && p.alt.length > 250) warn('fotos', `${l} texto alternativo muito longo (${p.alt.length})`);
    if (p.mapId && !routes.has(p.mapId)) err('fotos', `${l} mapId "${p.mapId}" não existe em routes`);
    const own = /acervo do projeto/i.test(p.credit || '');
    if (!own) {
      ['credit', 'license', 'source'].forEach(k => { if (!p[k]) err('fotos', `${l} sem "${k}" (exigido por licença livre)`); });
      if (p.source && !/^https:\/\//.test(p.source)) err('fotos', `${l} source não é https`);
    }
    const fp = path.join(PUB, 'photos', p.file);
    if (exists(fp)) {
      const kb = fs.statSync(fp).size / 1024;
      if (kb > 700) warn('fotos', `${l} pesada: ${Math.round(kb)} KB (alvo ≤ 700 KB)`);
    }
  });
  files.forEach(f => { if (!seen.has(f)) warn('fotos', `public/photos/${f} não está no manifesto (aparece sem legenda/crédito)`); });
}

/* ---------- 3. HTML gerado ---------- */
function validateHtml(ctx) {
  const distHtml = path.join(ROOT, 'dist/index.html');
  if (!exists(distHtml)) return warn('html', 'dist/index.html não existe (rode npm run build)');
  const html = read(distHtml);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  [...new Set(dup)].forEach(d => err('html', `id duplicado: "${d}"`));
  const idSet = new Set(ids);

  [...html.matchAll(/href="#([^"]*)"/g)].forEach(m => {
    if (m[1] && !idSet.has(m[1])) err('html', `âncora quebrada: #${m[1]}`);
  });
  [...html.matchAll(/aria-controls="([^"]+)"/g)].forEach(m => { if (!idSet.has(m[1])) err('html', `aria-controls aponta para id inexistente: ${m[1]}`); });
  [...html.matchAll(/aria-labelledby="([^"]+)"/g)].forEach(m => { if (!idSet.has(m[1])) err('html', `aria-labelledby aponta para id inexistente: ${m[1]}`); });

  /* recursos locais */
  const refs = [...html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)].map(m => m[1]).filter(u => !/^(https?:|mailto:|data:|\/\/)/.test(u));
  new Set(refs).forEach(u => {
    const p = path.join(ROOT, 'dist', decodeURIComponent(u));
    if (!exists(p)) err('html', `recurso local ausente em dist: ${u}`);
  });

  /* imagens sem alt */
  [...html.matchAll(/<img\b[^>]*>/g)].forEach(m => { if (!/\salt=/.test(m[0])) err('html', `<img> sem alt: ${m[0].slice(0, 80)}`); });
  /* target=_blank sem rel */
  [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].forEach(m => { if (!/rel="[^"]*noopener/.test(m[0])) err('html', `link _blank sem rel=noopener: ${m[0].slice(0, 80)}`); });
  /* um único h1 */
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) err('html', `esperado 1 <h1>, encontrado ${h1}`);
  if (!/<html lang="pt-BR"/.test(html)) err('html', 'html sem lang="pt-BR"');
  if (!/<meta name="viewport"/.test(html)) err('html', 'sem meta viewport');
  if (!/<meta name="description"/.test(html)) err('html', 'sem meta description');
  if (/<%|%>/.test(html)) err('html', 'resíduo de EJS (<% %>) no HTML gerado');
  if (/undefined|\[object Object\]|NaN/.test(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, ''))) {
    const m = html.replace(/<script[\s\S]*?<\/script>/g, '').match(/.{30}(undefined|\[object Object\]|NaN).{30}/);
    err('html', `texto suspeito ("undefined"/"NaN") no HTML: ${m ? m[0].replace(/\s+/g, ' ') : ''}`);
  }

  /* data-open aponta para dados existentes */
  const sets = { history: ctx.hist, place: ctx.places, culture: new Set(ctx.site.culture.map(c => c.id)), dish: ctx.dish, stay: ctx.stays, event: ctx.evs };
  [...html.matchAll(/data-open="([a-z]+):([^"]+)"/g)].forEach(m => {
    if (!sets[m[1]]) return err('html', `data-open com tipo desconhecido "${m[1]}"`);
    if (!sets[m[1]].has(m[2])) err('html', `data-open="${m[1]}:${m[2]}" não existe nos dados`);
  });

  /* links do menu x seções */
  ctx.site.nav.forEach(([id]) => { if (!idSet.has(id)) err('menu', `item de menu "${id}" sem seção correspondente`); });

  /* JSON embutido */
  [...html.matchAll(/<script type="application\/json" id="([^"]+)">([\s\S]*?)<\/script>/g)].forEach(m => {
    try { JSON.parse(m[2]); } catch (e) { err('html', `JSON inválido em #${m[1]}: ${e.message}`); }
  });

  /* SEO e prévia social */
  const metaC = (re) => { const m = html.match(re); return m ? m[1] : ''; };
  const title = metaC(/<title>([^<]*)<\/title>/);
  const desc = metaC(/<meta name="description" content="([^"]*)"/);
  if (!title) err('seo', 'sem <title>');
  else if (title.length > 65) warn('seo', `<title> com ${title.length} caracteres (ideal ≤ 65)`);
  if (desc.length < 70 || desc.length > 170) warn('seo', `meta description com ${desc.length} caracteres (ideal 70–170)`);
  const canonical = metaC(/<link rel="canonical" href="([^"]*)"/);
  const og = k => metaC(new RegExp(`<meta property="${k}" content="([^"]*)"`));
  const tw = k => metaC(new RegExp(`<meta name="${k}" content="([^"]*)"`));
  if (!/^https:\/\//.test(canonical)) err('seo', `canonical ausente ou não absoluta: "${canonical}"`);
  ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:image:alt'].forEach(k => { if (!og(k)) err('seo', `falta <meta property="${k}">`); });
  if (og('og:url') !== canonical) err('seo', `og:url (${og('og:url')}) diferente do canonical (${canonical})`);
  if (!/^https:\/\//.test(og('og:image'))) err('seo', `og:image precisa ser URL absoluta https: "${og('og:image')}"`);
  if (!tw('twitter:card')) err('seo', 'falta twitter:card');
  if (tw('twitter:image') !== og('og:image')) warn('seo', 'twitter:image diferente de og:image');
  const imgPath = og('og:image').replace(/^https?:\/\/[^/]+/, '');
  if (imgPath && !exists(path.join(ROOT, 'dist', imgPath))) err('seo', `imagem de prévia não existe em dist: ${imgPath}`);
  if (!exists(path.join(ROOT, 'dist/robots.txt'))) warn('seo', 'sem robots.txt');
  if (!exists(path.join(ROOT, 'dist/sitemap.xml'))) warn('seo', 'sem sitemap.xml');
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ld) warn('seo', 'sem dados estruturados (JSON-LD)');
  else {
    try {
      const j = JSON.parse(ld[1]);
      if (j['@context'] !== 'https://schema.org') err('seo', 'JSON-LD sem @context schema.org');
      const types = (j['@graph'] || [j]).map(x => x['@type']);
      ['WebSite', 'WebPage'].forEach(t => { if (!types.includes(t)) warn('seo', `JSON-LD sem @type ${t}`); });
    } catch (e) { err('seo', `JSON-LD inválido: ${e.message}`); }
  }
  ['shareDialog', 'shGrid', 'shCopy', 'shField'].forEach(id => { if (!idSet.has(id)) err('compartilhar', `elemento #${id} ausente do HTML`); });
  if (!/data-share/.test(html)) err('compartilhar', 'nenhum botão com data-share');

  const kb = Buffer.byteLength(html) / 1024;
  if (kb > 400) warn('html', `index.html grande: ${Math.round(kb)} KB`);
}

/* ---------- 4. código ---------- */
function validateCode() {
  const jsFiles = ['server.js', 'build.js', ...(fs.existsSync(path.join(ROOT, 'api')) ? fs.readdirSync(path.join(ROOT, 'api')).map(f => 'api/' + f) : []), ...fs.readdirSync(path.join(ROOT, 'lib')).map(f => 'lib/' + f), ...fs.readdirSync(path.join(ROOT, 'data')).map(f => 'data/' + f),
    ...fs.readdirSync(path.join(PUB, 'js')).map(f => 'public/js/' + f), ...fs.readdirSync(__dirname).filter(f => f.endsWith('.js')).map(f => 'scripts/' + f)];
  jsFiles.forEach(f => {
    try { execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' }); }
    catch (e) { err('js', `${f}: erro de sintaxe\n${String(e.stderr).split('\n').slice(0, 4).join('\n')}`); }
  });

  /* padrão de bug: $('...').forEach/.map/... (deveria ser $$) */
  fs.readdirSync(path.join(PUB, 'js')).forEach(f => {
    const code = read(path.join(PUB, 'js', f));
    code.split('\n').forEach((line, i) => {
      if (/(^|[^$\w])\$\([^)]*\)\.(forEach|map|filter|some|every|reduce|find)\b/.test(line)) err('js', `public/js/${f}:${i + 1} $() usado como lista (provável erro de $$): ${line.trim().slice(0, 90)}`);
      if (/\bconsole\.log\(/.test(line)) warn('js', `public/js/${f}:${i + 1} console.log esquecido`);
      if (/\bdebugger\b/.test(line)) err('js', `public/js/${f}:${i + 1} debugger`);
    });
  });

  /* ids usados no JS existem no HTML? */
  const distHtml = path.join(ROOT, 'dist/index.html');
  if (exists(distHtml)) {
    const html = read(distHtml);
    const idSet = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    const dynamic = new Set(['mArt', 'lbImg']);
    fs.readdirSync(path.join(PUB, 'js')).forEach(f => {
      const code = read(path.join(PUB, 'js', f));
      new Set([...code.matchAll(/(?:\$|getElementById)\(\s*['"]#?([A-Za-z][\w-]*)['"]\s*\)/g)].map(m => m[1])).forEach(id => {
        const viaSelector = new RegExp(`\\$\\(\\s*['"]#${id}['"]`).test(code);
        const viaById = new RegExp(`getElementById\\(\\s*['"]${id}['"]`).test(code);
        if ((viaSelector || viaById) && !idSet.has(id) && !dynamic.has(id)) err('js', `public/js/${f}: elemento #${id} não existe no HTML`);
      });
    });
  }

  /* CSS: chaves balanceadas e arquivos referenciados */
  const cssFiles = fs.readdirSync(path.join(PUB, 'css')).filter(f => f.endsWith('.css'));
  cssFiles.forEach(f => {
    const css = read(path.join(PUB, 'css', f)).replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\("[^"]*"\)|url\('[^']*'\)/g, '');
    const o = (css.match(/\{/g) || []).length, c = (css.match(/\}/g) || []).length;
    if (o !== c) err('css', `css/${f}: chaves desbalanceadas ({=${o} }=${c})`);
  });
  const idx = read(path.join(ROOT, 'views/index.ejs'));
  const linked = new Set([...idx.matchAll(/href="css\/([^"]+)"/g)].map(m => m[1]));
  cssFiles.forEach(f => { if (!linked.has(f)) warn('css', `css/${f} não é carregado por index.ejs`); });
  linked.forEach(f => { if (!cssFiles.includes(f)) err('css', `index.ejs referencia css/${f} que não existe`); });
  const scripts = new Set([...idx.matchAll(/src="js\/([^"]+)"/g)].map(m => m[1]));
  fs.readdirSync(path.join(PUB, 'js')).forEach(f => { if (!scripts.has(f)) warn('js', `js/${f} não é carregado por index.ejs`); });
  scripts.forEach(f => { if (!exists(path.join(PUB, 'js', f))) err('js', `index.ejs referencia js/${f} que não existe`); });
}

/* ---------- 5. projeto ---------- */
function validateProject() {
  const must = ['package.json', 'server.js', 'build.js', 'data/site.js', 'data/extra.js', 'data/photos.js', 'views/index.ejs', 'public/img/santo.webp', 'public/img/igreja.webp'];
  must.forEach(f => { if (!exists(path.join(ROOT, f))) err('projeto', `arquivo obrigatório ausente: ${f}`); });
  ['index.html', 'index-v1-timeline.html'].forEach(f => { if (exists(path.join(ROOT, f))) warn('projeto', `${f} na raiz é um resíduo de versões antigas`); });

  const partialsDir = path.join(ROOT, 'views/partials');
  const idx = read(path.join(ROOT, 'views/index.ejs'));
  fs.readdirSync(partialsDir).forEach(f => {
    const name = f.replace('.ejs', '');
    if (!idx.includes(`partials/${name}`) && !fs.readdirSync(partialsDir).some(o => o !== f && read(path.join(partialsDir, o)).includes(`partials/${name}`)))
      warn('projeto', `views/partials/${f} não é incluído em lugar nenhum`);
  });
  /* seções numeradas em sequência */
  const order = [...idx.matchAll(/include\('partials\/([a-z]+)'\)/g)].map(m => m[1]);
  const nums = [];
  order.forEach(n => {
    const p = path.join(partialsDir, n + '.ejs');
    if (!exists(p)) return err('projeto', `include de partial inexistente: ${n}`);
    const m = read(p).match(/class="eyebrow"><span>(\d+)<\/span>/);
    if (m) nums.push([n, +m[1]]);
  });
  nums.forEach(([n, v], i) => { if (v !== i + 1) err('projeto', `numeração das seções fora de sequência em "${n}": ${v} (esperado ${i + 1})`); });

  /* imagens: todas devem estar em WebP e ter origem em assets-src */
  ['photos', 'img'].forEach(sub => {
    const d = path.join(PUB, sub);
    if (!exists(d)) return;
    fs.readdirSync(d).forEach(f => {
      if (/\.(jpe?g|png)$/i.test(f) && f !== 'og.jpg' && !/^icon-\d+\.png$/.test(f)) warn('imagens', `public/${sub}/${f} não é WebP: coloque o original em assets-src/${sub}/ e rode npm run images`);
      if (/\.webp$/i.test(f)) {
        const base = f.replace(/\.webp$/i, '');
        const src = path.join(ROOT, 'assets-src', sub);
        const has = exists(src) && fs.readdirSync(src).some(o => o.replace(/\.(jpe?g|png)$/i, '') === base);
        if (!has) warn('imagens', `public/${sub}/${f} sem original em assets-src/${sub}/ (não será possível reconverter)`);
      }
    });
  });

  /* pesos */
  const dir = path.join(ROOT, 'public/photos');
  if (exists(dir)) {
    const total = fs.readdirSync(dir).reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0) / 1048576;
    if (total > 12) warn('desempenho', `public/photos soma ${total.toFixed(1)} MB (alvo ≤ 12 MB)`);
  }
}

/* ---------- execução ---------- */
const only = process.argv.includes('--warn');
try {
  const ctx = validateData();
  validatePhotos(ctx.routes);
  validateProject();
  validateCode();
  validateHtml(ctx);
} catch (e) {
  err('validador', `falha ao executar: ${e.stack || e}`);
}

const line = '─'.repeat(60);
if (warns.length) console.log(`\nAvisos (${warns.length})\n${line}\n` + warns.map(w => '  • ' + w).join('\n'));
if (errors.length) console.log(`\nErros (${errors.length})\n${line}\n` + errors.map(e => '  ✗ ' + e).join('\n'));
console.log(`\n${errors.length ? '✗' : '✓'} ${errors.length} erro(s), ${warns.length} aviso(s)`);
process.exit(errors.length && !only ? 1 : 0);
