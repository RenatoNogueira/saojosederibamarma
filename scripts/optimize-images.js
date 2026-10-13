#!/usr/bin/env node
/* Converte as imagens de assets-src/ para WebP em public/.
   assets-src/photos/*.{jpg,jpeg,png}  →  public/photos/*.webp   (máx. 1280 px de largura)
   assets-src/img/*.{png,jpg}          →  public/img/*.webp      (preserva transparência)
   Uso: npm run images            (só converte o que mudou)
        npm run images -- --force (reconverte tudo)                                   */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const force = process.argv.includes('--force');

const JOBS = [
  { src: 'assets-src/photos', out: 'public/photos', width: 1280, quality: 78 },
  { src: 'assets-src/img', out: 'public/img', width: 1200, quality: 82 }
];
const EXT = /\.(jpe?g|png)$/i;
/* largura própria para arquivos específicos (a lua é exibida pequena) */
const OVERRIDES = { 'lua.png': 720, 'nuvem-2.png': 520, 'nuvem-3.png': 300 };

(async () => {
  let converted = 0, skipped = 0, before = 0, after = 0;
  for (const job of JOBS) {
    const srcDir = path.join(ROOT, job.src);
    const outDir = path.join(ROOT, job.out);
    if (!fs.existsSync(srcDir)) continue;
    fs.mkdirSync(outDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir).filter(f => EXT.test(f))) {
      const input = path.join(srcDir, file);
      const output = path.join(outDir, file.replace(EXT, '.webp'));
      if (!force && fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) { skipped++; continue; }
      const info = await sharp(input)
        .rotate()                                        /* respeita a orientação EXIF */
        .resize({ width: OVERRIDES[file] || job.width, withoutEnlargement: true })
        .webp({ quality: job.quality, alphaQuality: 90, effort: 5 })
        .toFile(output);
      const a = fs.statSync(input).size;
      before += a; after += info.size; converted++;
      console.log(`  ${file.padEnd(36)} ${(a / 1024).toFixed(0).padStart(5)} KB → ${(info.size / 1024).toFixed(0).padStart(4)} KB  (${info.width}×${info.height})`);
    }
  }
  console.log(`\n${converted} convertida(s), ${skipped} já atualizada(s).` + (converted ? ` ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB` : ''));
})().catch(e => { console.error('Falha ao converter:', e.message); process.exit(1); });
