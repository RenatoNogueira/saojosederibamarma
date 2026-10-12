/* Compactação do build (só em dist/; o código-fonte e o servidor de desenvolvimento ficam legíveis).
   - CSS e JS: esbuild (sem bundle, sem renomear nomes globais, então os scripts continuam compartilhando o que já compartilham)
   - HTML: remove comentários e reduz espaços repetidos, preservando <script>, <style>, <pre> e <textarea>
   Se o esbuild não estiver instalado, o build segue sem compactar. */
const fs = require('fs');
const path = require('path');

let esbuild = null;
try { esbuild = require('esbuild'); } catch { /* sem esbuild: segue sem compactar */ }

const KEEP_COMMENT = /CC BY|OpenStreetMap|©/;
function minifyHtml(html) {
  const keep = [];
  const stash = s => { keep.push(s); return `\u0000${keep.length - 1}\u0000`; };
  let out = html.replace(/<(script|style|pre|textarea)\b[\s\S]*?<\/\1>/gi, stash);
  out = out.replace(/<!--[\s\S]*?-->/g, c => (KEEP_COMMENT.test(c) ? stash(c) : ''));
  out = out.replace(/[ \t\r\n]+/g, ' ').replace(/> </g, '><');
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[+i]);
}

function walk(dir, ext, files = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, ext, files);
    else if (p.endsWith(ext)) files.push(p);
  }
  return files;
}

function minifyAssets(dist) {
  const stats = { before: 0, after: 0, files: 0 };
  if (!esbuild) return stats;
  for (const [ext, loader] of [['.css', 'css'], ['.js', 'js']]) {
    for (const file of walk(dist, ext)) {
      const src = fs.readFileSync(file, 'utf8');
      const { code } = esbuild.transformSync(src, { loader, minify: true, legalComments: 'none', target: 'es2019' });
      fs.writeFileSync(file, code);
      stats.before += Buffer.byteLength(src); stats.after += Buffer.byteLength(code); stats.files++;
    }
  }
  return stats;
}

module.exports = { minifyHtml, minifyAssets, hasEsbuild: () => !!esbuild };
