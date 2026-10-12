#!/usr/bin/env node
/* Recorta nuvens individuais do PNG transparente "Clouds (transparent).png"
   (Alex Maisuradze, CC BY 3.0, Wikimedia Commons) e grava assets-src/img/nuvem-N.png.
   Cada recorte pode ter um polígono (para tirar pedaços de nuvens vizinhas) e bordas suavizadas.
   Uso: node scripts/cut-clouds.js <origem.png>                                                    */
const path = require('path');
const sharp = require('sharp');
const src = process.argv[2];
if (!src) { console.error('uso: node scripts/cut-clouds.js <origem.png>'); process.exit(1); }
const out = path.join(__dirname, '..', 'assets-src', 'img');

/* coordenadas da imagem original (995×444); poly e feather em pixels do recorte */
const CUTS = [
  { name: 'nuvem-2', l: 640, t: 135, w: 345, h: 140, feather: { l: 70 } },
  { name: 'nuvem-3', l: 762, t: 270, w: 175, h: 62, feather: { t: 7 } }
];

function maskSvg({ w, h, poly, feather = {} }) {
  const f = Object.assign({ l: 0, r: 0, t: 0, b: 0 }, feather);
  const pts = (poly || [[0, 0], [w, 0], [w, h], [0, h]]).map(p => p.join(',')).join(' ');
  /* soma dos gradientes de borda via máscaras aninhadas */
  return { pts, f };
}

(async () => {
  for (const c of CUTS) {
    const file = path.join(out, c.name + '.png');
    const { pts, f } = maskSvg(c);
    let img = sharp(src).extract({ left: c.l, top: c.t, width: c.w, height: c.h }).ensureAlpha();
    const poly = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${c.w}" height="${c.h}"><polygon points="${pts}" fill="#fff"/></svg>`);
    let buf = await img.composite([{ input: poly, blend: 'dest-in' }]).png().toBuffer();
    const edges = [
      ['l', f.l, `x1="0" y1="0" x2="${f.l}" y2="0"`],
      ['r', f.r, `x1="${c.w - f.r}" y1="0" x2="${c.w}" y2="0"`, true],
      ['t', f.t, `x1="0" y1="0" x2="0" y2="${f.t}"`],
      ['b', f.b, `x1="0" y1="${c.h - f.b}" x2="0" y2="${c.h}"`, true]
    ];
    for (const [, size, coords, rev] of edges) {
      if (!size) continue;
      const stops = rev ? [1, 0] : [0, 1];   /* opacidade: dest-in usa o alfa da máscara */
      const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${c.w}" height="${c.h}">
        <defs><linearGradient id="g" gradientUnits="userSpaceOnUse" ${coords}><stop offset="0" stop-color="#fff" stop-opacity="${stops[0]}"/><stop offset="1" stop-color="#fff" stop-opacity="${stops[1]}"/></linearGradient></defs>
        <rect width="${c.w}" height="${c.h}" fill="url(#g)"/></svg>`);
      const m = await sharp(svg).png().toBuffer();
      buf = await sharp(buf).composite([{ input: m, blend: 'dest-in' }]).png().toBuffer();
    }
    await sharp(buf).trim({ threshold: 1 }).png().toFile(file);
    console.log('gravado', file);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
