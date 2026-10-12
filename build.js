/* Gera o site estático em /dist a partir dos templates EJS → npm run build */
const fs = require('fs');
const path = require('path');
const { render } = require('./lib/render');
const { minifyHtml, minifyAssets, hasEsbuild } = require('./lib/minify');

const DIST = path.join(__dirname, 'dist');
const PUBLIC = path.join(__dirname, 'public');

(async () => {
  const html = await render();                     /* renderiza antes de apagar dist: se falhar, o build anterior fica intacto */
  if (!/<h1\b/.test(html) || /<%/.test(html)) throw new Error('HTML gerado parece inválido (sem <h1> ou com resíduo de EJS)');
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.cpSync(PUBLIC, DIST, { recursive: true });
  const small = minifyHtml(html);
  fs.writeFileSync(path.join(DIST, 'index.html'), small);
  const st = minifyAssets(DIST);
  const kb = n => Math.round(n / 1024);
  console.log(`Site gerado em dist/index.html (${kb(Buffer.byteLength(html))} KB → ${kb(Buffer.byteLength(small))} KB)`);
  if (hasEsbuild()) console.log(`CSS/JS compactados: ${st.files} arquivos, ${kb(st.before)} KB → ${kb(st.after)} KB`);
  else console.log('esbuild não encontrado: CSS/JS não foram compactados');
})().catch(err => {
  console.error('Falha no build:', err.message);
  process.exit(1);
});
