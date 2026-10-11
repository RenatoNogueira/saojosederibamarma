/* Gera o site estático em /dist a partir dos templates EJS → npm run build */
const fs = require('fs');
const path = require('path');
const { render } = require('./lib/render');

const DIST = path.join(__dirname, 'dist');
const PUBLIC = path.join(__dirname, 'public');

(async () => {
  const html = await render();                     /* renderiza antes de apagar dist: se falhar, o build anterior fica intacto */
  if (!/<h1\b/.test(html) || /<%/.test(html)) throw new Error('HTML gerado parece inválido (sem <h1> ou com resíduo de EJS)');
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.cpSync(PUBLIC, DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'index.html'), html);
  const kb = Math.round(Buffer.byteLength(html) / 1024);
  console.log(`Site gerado em dist/index.html (${kb} KB)`);
})().catch(err => {
  console.error('Falha no build:', err.message);
  process.exit(1);
});
