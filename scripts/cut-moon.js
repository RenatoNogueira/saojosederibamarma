#!/usr/bin/env node
/* Recorta o disco da Lua (foto NASA/SVS, fundo branco) com máscara circular suave e grava assets-src/img/lua.png (RGBA).
   Uso: node scripts/cut-moon.js <arquivo-origem.png>                                                          */
const path = require('path');
const sharp = require('sharp');

const src = process.argv[2];
if (!src) { console.error('uso: node scripts/cut-moon.js <origem.png>'); process.exit(1); }
const out = path.join(__dirname, '..', 'assets-src', 'img', 'lua.png');

(async () => {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  /* caixa do disco: pixels que não são (quase) brancos */
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.min(x1 - x0, y1 - y0) / 2 - 3;   /* 3 px para dentro: remove o halo branco */
  console.log(`disco: centro (${cx.toFixed(1)}, ${cy.toFixed(1)}) raio ${r.toFixed(1)}`);

  const size = Math.ceil(r * 2);
  const left = Math.max(0, Math.round(cx - r)), top = Math.max(0, Math.round(cy - r));
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#fff"/></svg>`);
  await sharp(src).removeAlpha()
    .extract({ left, top, width: Math.min(size, W - left), height: Math.min(size, H - top) })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png().toFile(out);
  console.log('gravado', out);
})().catch(e => { console.error(e.message); process.exit(1); });
