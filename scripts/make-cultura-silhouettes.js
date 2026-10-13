#!/usr/bin/env node
/* Gera public/img/cultura-fundo.svg: silhuetas (uma cor) a partir da composição das fotos de referência —
   o tocador de tambor de perfil com a mão erguida, o boi bordado com o brincante, as mãos com as matracas e o mar
   com uma canoa. Desenhado à mão em código.   Uso: node scripts/make-cultura-silhouettes.js                       */
const fs = require('fs');
const path = require('path');

const W = 1800, H = 700;
const INK = '#0b1a44';

/* ----- tocador de tambor (coordenadas da foto 1024×683) ----- */
const drummer = `
  <circle cx="575" cy="330" r="300" fill="${INK}" opacity=".16"/>
  <path d="M 770 40 C 880 150 910 330 860 500 C 840 560 800 610 760 640" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round" opacity=".9"/>
  <path d="M 800 20 C 960 140 1000 360 930 540" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round" opacity=".5"/>
  <g fill="${INK}">
    <path d="M78 302C84 232 148 178 232 181C302 188 338 236 347 270L400 274C384 288 354 294 332 294L112 458C90 402 77 352 78 302Z"/>
    <path d="M330 292L374 322C394 346 402 362 398 374L414 396L410 422L416 442L414 472C402 502 382 516 342 526L200 522L150 472L112 458Z"/>
    <path d="M96 683C108 600 150 542 236 520L342 526C424 542 484 584 524 683Z"/>
    <path d="M520 683C560 610 600 540 618 470C628 430 600 420 570 430C530 440 498 470 470 520C450 560 440 620 436 683Z"/>
  </g>
  <g fill="none" stroke="${INK}" stroke-linecap="round" stroke-width="34">
    <path d="M492 330C484 280 482 230 490 196"/>
    <path d="M532 330C530 280 534 232 544 204"/>
    <path d="M572 340C578 300 590 262 604 238"/>
    <path d="M598 380C608 350 622 320 640 300" stroke-width="30"/>
    <path d="M468 390C452 360 446 330 452 296" stroke-width="30"/>
  </g>
  <path d="M470 330L650 340L630 470L520 520L470 470Z" fill="${INK}"/>`;

/* ----- boi bordado e brincante (caixa 640×620) ----- */
const PAPER = '#f6f1e6';
const star = (x, y, r) => {
  let p = '';
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, an = -Math.PI / 2 + i * Math.PI / 5; p += (i ? 'L' : 'M') + (x + Math.cos(an) * rr).toFixed(1) + ' ' + (y + Math.sin(an) * rr).toFixed(1); }
  return `<path d="${p}Z"/>`;
};
const boi = `
  <g fill="${INK}">
    <path d="M70 300C90 190 190 120 340 120C470 120 580 190 610 330C620 380 618 430 610 470L120 470C96 420 70 370 70 300Z"/>
    <path d="M110 470h500q-6 24 -18 30q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0q-18 -24 -36 0z"/>
    <rect x="210" y="500" width="46" height="120" rx="14"/><rect x="430" y="500" width="46" height="120" rx="14"/>
    <ellipse cx="108" cy="222" rx="82" ry="62" transform="rotate(-12 108 222)"/>
    <ellipse cx="28" cy="262" rx="52" ry="40" transform="rotate(-14 28 262)"/>
    <path d="M110 170C90 110 120 60 170 40C190 90 180 140 150 180Z"/>
    <path d="M170 160C180 100 230 70 290 70C280 120 240 160 200 180Z"/>
    <path d="M40 150C80 100 170 100 230 140L206 170C160 140 100 140 70 180Z"/>
  </g>
  <g fill="none" stroke-linecap="round" stroke="${INK}" stroke-width="9">
    <path d="M52 128C34 170 28 214 40 250" opacity=".8"/><path d="M70 120C54 168 50 206 62 240" opacity=".6"/>
    <path d="M86 112C74 156 72 190 84 220" opacity=".8"/>
  </g>
  <g fill="${INK}" opacity=".85">
    ${[...Array(7)].map((_, i) => { const an = (-62 + i * 16) * Math.PI / 180; return `<path d="M200 70L${(200 + Math.sin(an) * 120).toFixed(0)} ${(70 - Math.cos(an) * 120).toFixed(0)}L${(204 + Math.sin(an) * 100).toFixed(0)} ${(74 - Math.cos(an) * 100).toFixed(0)}Z"/>`; }).join('')}
  </g>
  <g fill="${PAPER}" opacity=".55">
    <circle cx="120" cy="208" r="13"/><circle cx="8" cy="250" r="7"/>
    ${star(300, 250, 34)}${star(450, 220, 26)}${star(520, 340, 30)}${star(360, 380, 24)}${star(220, 350, 22)}
  </g>
  <g fill="none" stroke="${PAPER}" stroke-width="7" opacity=".5" stroke-linecap="round">
    <path d="M130 440C240 400 380 400 590 440"/><path d="M110 330C230 290 400 290 600 330"/>
  </g>`;

/* ----- matracas e mãos (caixa 520×640) ----- */
const hand = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})" fill="${INK}">
    <rect x="-46" y="-6" width="92" height="86" rx="30"/>
    ${[-33, -11, 11, 33].map((fx, i) => `<rect x="${fx - 9}" y="${-64 - (i === 1 || i === 2 ? 8 : 0)}" width="18" height="${62 + (i === 1 || i === 2 ? 8 : 0)}" rx="9"/>`).join('')}
    <rect x="-70" y="-8" width="18" height="58" rx="9" transform="rotate(-38 -52 40)"/>
    <rect x="-34" y="70" width="68" height="96" rx="26"/></g>`;
const hands = `
  <g transform="rotate(-20 260 320)" fill="${INK}">
    <rect x="170" y="30" width="70" height="420" rx="6"/><path d="M170 30l20 -20h70l-20 20z" opacity=".7"/>
    <rect x="262" y="70" width="70" height="420" rx="6"/><path d="M262 70l20 -20h70l-20 20z" opacity=".7"/>
  </g>
  <g fill="${PAPER}" opacity=".5"><rect x="192" y="120" width="6" height="170" rx="3" transform="rotate(-20 260 320)"/><rect x="284" y="160" width="6" height="170" rx="3" transform="rotate(-20 260 320)"/></g>
  ${hand(256, 400, -20)}${hand(356, 408, -20)}
  <g fill="${INK}" opacity=".55">
    ${[...Array(15)].map((_, i) => {
      const an = (-80 + i * 11) * Math.PI / 180, cx = 260, cy = 640, L = 200 + (i % 3) * 30;
      return `<path d="M${cx} ${cy} L${(cx + Math.sin(an) * L).toFixed(0)} ${(cy - Math.cos(an) * L).toFixed(0)} L${(cx + Math.sin(an + .1) * L * .9).toFixed(0)} ${(cy - Math.cos(an + .1) * L * .9).toFixed(0)}Z"/>`;
    }).join('')}
  </g>`;

/* ----- o mar e a canoa ----- */
const wave = (y, amp, op, off) => {
  let d = `M${-40 + off} ${y}`;
  for (let x = -40; x <= W + 160; x += 160) d += ` q40 ${-amp} 80 0 t80 0`;
  return `<path d="${d} V${H} H${-40 + off}Z" fill="${INK}" opacity="${op}"/>`;
};
const sea = `
  <g transform="translate(1160 560)" fill="${INK}"><path d="M0 40L170 40L140 76L30 76Z"/><path d="M92 38V-70" stroke="${INK}" stroke-width="5"/>
    <path d="M96 -66L168 34L96 34Z"/><path d="M88 -50L24 34L88 34Z" opacity=".7"/></g>
  ${wave(610, 22, .18, -50)}${wave(640, 26, .3, 20)}${wave(672, 22, .5, -90)}${wave(700, 16, .75, 40)}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
<!-- Silhuetas: tocador de tambor, boi bordado, mãos com matracas e o mar. Desenho original. -->
<g transform="translate(10 40) scale(.82)">${drummer}</g>
<g transform="translate(700 30) scale(.9)">${boi}</g>
<g transform="translate(1290 20) scale(.9)">${hands}</g>
${sea}
</svg>
`;
const out = path.join(__dirname, '..', 'public', 'img', 'cultura-fundo.svg');
fs.writeFileSync(out, svg);
console.log('gravado', out, (svg.length / 1024).toFixed(0) + ' KB');
