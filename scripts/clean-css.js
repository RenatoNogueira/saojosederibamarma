/* Remove regras CSS cujos seletores usam classes que não existem em nenhum HTML/JS.
   Uso: node scripts/clean-css.js           (mostra o que removeria)
        node scripts/clean-css.js --write   (aplica)                                   */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const write = process.argv.includes('--write');

const walk = d => fs.readdirSync(d).map(f => path.join(d, f));
const srcFiles = [...walk(path.join(ROOT, 'views')), ...walk(path.join(ROOT, 'views/partials')), ...walk(path.join(ROOT, 'public/js')), path.join(ROOT, 'lib/render.js')]
  .filter(f => fs.statSync(f).isFile());
const src = srcFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const used = c => new RegExp('(?<![\\w-])' + c.replace(/-/g, '\\-') + '(?![\\w-])').test(src);

/* separa o CSS em blocos de nível 0, descendo em @media/@supports/@container */
function clean(css, report) {
  let out = '', i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) { out += css.slice(i); break; }
    let depth = 1, j = open + 1;
    while (j < css.length && depth) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    const head = css.slice(i, open);
    const body = css.slice(open + 1, j - 1);
    const lead = head.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)*/)[0];
    const sel = head.slice(lead.length).trim();
    if (/^@(media|supports|container)/.test(sel)) {
      const inner = clean(body, report);
      out += head + '{' + inner + '}';
    } else if (sel.startsWith('@')) {
      out += head + '{' + body + '}';
    } else {
      const parts = sel.split(',').map(s => s.trim()).filter(Boolean);
      const keep = parts.filter(s => [...s.matchAll(/\.([a-zA-Z_][\w-]*)/g)].every(m => used(m[1])));
      if (keep.length === parts.length) out += head + '{' + body + '}';
      else {
        parts.filter(s => !keep.includes(s)).forEach(s => report.push(s));
        if (keep.length) out += lead + keep.join(',') + '{' + body + '}';
      }
    }
    i = j;
  }
  return out;
}

let total = 0;
fs.readdirSync(path.join(ROOT, 'public/css')).filter(f => f.endsWith('.css')).forEach(f => {
  const p = path.join(ROOT, 'public/css', f);
  const before = fs.readFileSync(p, 'utf8');
  const report = [];
  const after = clean(before, report);
  if (report.length) {
    console.log(`${f}: ${report.length} seletor(es) sem uso`);
    report.forEach(s => console.log('   - ' + s));
    total += report.length;
    if (write) fs.writeFileSync(p, after);
  }
});
console.log(total ? `\n${total} seletor(es) ${write ? 'removidos' : 'a remover (use --write)'}.` : 'Nada a remover.');
