#!/usr/bin/env node
/* Gera public/img/og.jpg (1200×630), a imagem de prévia para redes sociais.
   Uso: npm run og                                                                 */
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const W = 1200, H = 630;

(async () => {
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#040b26"/><stop offset=".55" stop-color="#1b3f9c"/><stop offset="1" stop-color="#e2503f"/>
      </linearGradient>
      <radialGradient id="s" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#fff3c4"/><stop offset=".45" stop-color="#ffd47a"/><stop offset="1" stop-color="#ff9a5b" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <circle cx="930" cy="360" r="250" fill="url(#s)"/>
    <path d="M0 560 Q150 520 300 560 T600 560 T900 560 T1200 560 V630 H0Z" fill="#0a2a73"/>
    <path d="M0 595 Q150 565 300 595 T600 595 T900 595 T1200 595 V630 H0Z" fill="#06143a"/>
    <text x="70" y="250" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="116" fill="#ffd98a">RIBAMAR</text>
    <text x="74" y="318" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="38" fill="#e8eeff">São José de Ribamar, Maranhão</text>
    <text x="74" y="372" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="3" fill="#ffc861">FÉ · MAR · HISTÓRIA</text>
  </svg>`);

  const santo = await sharp(path.join(ROOT, 'assets-src/img/santo.png')).resize({ height: 560 }).toBuffer();
  const igreja = await sharp(path.join(ROOT, 'assets-src/img/igreja.png')).resize({ width: 235 }).toBuffer();
  const sMeta = await sharp(santo).metadata();
  const iMeta = await sharp(igreja).metadata();

  await sharp(bg)
    .composite([
      { input: santo, left: 790, top: H - sMeta.height - 20 },
      { input: igreja, left: 520, top: H - iMeta.height - 12 }
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(ROOT, 'public/img/og.jpg'));
  console.log('public/img/og.jpg gerada (1200×630)');
})().catch(e => { console.error(e.message); process.exit(1); });
