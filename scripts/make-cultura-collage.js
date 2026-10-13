#!/usr/bin/env node
/* Monta assets-src/img/cultura-fundo.png (o `npm run images` converte para public/img/cultura-fundo.webp): colagem horizontal com três imagens da cultura de Ribamar
   (tocador de tambor, boi bordado e ilustração das matracas), com bordas que se dissolvem umas nas outras.
   Uso: node scripts/make-cultura-collage.js <tambor.jpg> <boi.jpg> <matracas.png>                        */
const path = require('path');
const sharp = require('sharp');

const [drum, boi, mat] = process.argv.slice(2);
if (!mat) { console.error('uso: node scripts/make-cultura-collage.js <tambor> <boi> <matracas>'); process.exit(1); }

const W = 1800, H = 760;
/* [arquivo, esquerda, altura] — a largura sai da proporção; as imagens se sobrepõem um pouco */
const ITEMS = [
  { file: drum, left: 0, height: 700, top: 60, fade: { l: 0, r: 260, t: 60, b: 80 } },
  { file: boi, left: 760, height: 760, top: 0, fade: { l: 200, r: 200, t: 80, b: 40 } },
  { file: mat, left: 1230, height: 640, top: 100, fade: { l: 200, r: 0, t: 60, b: 60 } }
];

async function layer({ file, left, height, top, fade }) {
  const buf = await sharp(file).resize({ height }).ensureAlpha().png().toBuffer();
  const { width: w, height: h } = await sharp(buf).metadata();
  const grads = [];
  const edge = (id, size, x1, y1, x2, y2) => size && grads.push({ id, size, x1, y1, x2, y2 });
  edge('l', fade.l, 0, 0, fade.l, 0);
  edge('r', fade.r, w - fade.r, 0, w, 0);
  edge('t', fade.t, 0, 0, 0, fade.t);
  edge('b', fade.b, 0, h - fade.b, 0, h);
  let out = buf;
  for (const g of grads) {
    const rev = g.id === 'r' || g.id === 'b';
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>
      <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}">
        <stop offset="0" stop-color="#fff" stop-opacity="${rev ? 1 : 0}"/><stop offset="1" stop-color="#fff" stop-opacity="${rev ? 0 : 1}"/>
      </linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`);
    out = await sharp(out).composite([{ input: svg, blend: 'dest-in' }]).png().toBuffer();
  }
  /* vinheta elíptica: o retângulo da foto desaparece e fica só o "miolo" */
  const vig = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>
    <radialGradient id="v" cx="50%" cy="50%" r="50%"><stop offset="0.45" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#v)"/></svg>`);
  out = await sharp(out).composite([{ input: vig, blend: 'dest-in' }]).png().toBuffer();
  return { input: out, left, top };
}

(async () => {
  const layers = [];
  for (const it of ITEMS) layers.push(await layer(it));
  const outFile = path.join(__dirname, '..', 'assets-src', 'img', 'cultura-fundo.png');
  const info = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers).png().toFile(outFile);
  console.log('gravado', outFile, (info.size / 1024).toFixed(0) + ' KB', `${info.width}×${info.height}`);
})().catch(e => { console.error(e.message); process.exit(1); });
