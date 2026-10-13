#!/usr/bin/env node
/* Gera public/img/cultura-fundo.svg: ilustração vetorial original (estilo "flat", cores quentes) para o fundo da seção
   "O som da matraca, o saber das marés": mãos com matracas, tambor de crioula, o boi bordado, penas e o mar com uma
   canoa de vela. Desenhada à mão em código (não é um traço das fotos de referência).   Uso: node scripts/make-cultura-bg.js */
const fs = require('fs');
const path = require('path');

const W = 1600, H = 720;
const C = { orange: '#e2833a', yellow: '#ffc861', yellow2: '#ffe08a', red: '#c4402e', purple: '#7a4fa0', plum: '#a04f8f',
  green: '#2f9e6b', green2: '#1f7a52', blue: '#1448b8', blue2: '#2f6fe0', teal: '#5fd0ff', brown: '#8a4b1f', brown2: '#c27a3a',
  wood: '#b06f35', wood2: '#d99a55', black: '#1a1410', cream: '#fff3d6', sky: '#ffe9b8' };

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const flower = (cx, cy, r, col, ctr) => {
  let p = '';
  for (let i = 0; i < 8; i++) p += `<ellipse cx="${cx}" cy="${cy - r * .62}" rx="${r * .3}" ry="${r * .5}" transform="rotate(${i * 45} ${cx} ${cy})"/>`;
  return `<g fill="${col}">${p}</g><circle cx="${cx}" cy="${cy}" r="${r * .26}" fill="${ctr}"/>`;
};
const fan = (cx, cy, len, cols, n, spread, rot = 0) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (-spread / 2 + (spread / (n - 1)) * i + rot) * Math.PI / 180;
    const x = cx + Math.sin(a) * len, y = cy - Math.cos(a) * len;
    const mx = cx + Math.sin(a) * len * .5, my = cy - Math.cos(a) * len * .5;
    const nx = Math.cos(a) * len * .13, ny = Math.sin(a) * len * .13;
    s += `<path d="M${cx} ${cy} Q${mx - nx} ${my - ny} ${x} ${y} Q${mx + nx} ${my + ny} ${cx} ${cy}Z" fill="${cols[i % cols.length]}"/>`;
  }
  return s;
};
const hand = (x, y, rot, sc = 1) => {
  const fingers = [-33, -11, 11, 33].map((fx, i) =>
    `<rect x="${fx - 9}" y="${-64 - (i === 1 || i === 2 ? 8 : 0)}" width="18" height="${62 + (i === 1 || i === 2 ? 8 : 0)}" rx="9"/>`).join('');
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})" fill="${C.black}">
    <rect x="-46" y="-6" width="92" height="86" rx="30"/>${fingers}
    <rect x="-70" y="-8" width="18" height="58" rx="9" transform="rotate(-38 -52 40)"/>
    <rect x="-34" y="70" width="68" height="260" rx="26"/></g>
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".85">
    <path d="M-22 -50q3 10 0 20M2 -58q3 10 0 24M24 -50q2 8 0 18"/></g>`;
};

let g = '';

/* faixa de flores ao fundo */
g += `<g opacity=".5">`;
for (let i = 0; i < 26; i++) g += flower(40 + i * 62 + (i % 2) * 18, 60 + (i % 3) * 40, 34 + (i % 4) * 5, i % 2 ? C.yellow2 : C.orange, i % 2 ? C.orange : C.yellow);
g += `</g>`;

/* lua com halo */
g += `<circle cx="820" cy="150" r="96" fill="${C.yellow2}" opacity=".35"/><circle cx="820" cy="150" r="62" fill="${C.sky}"/>
  <circle cx="800" cy="138" r="9" fill="#f1d28c"/><circle cx="838" cy="168" r="12" fill="#f1d28c"/><circle cx="830" cy="124" r="6" fill="#f1d28c"/>`;

/* penas (leques) */
g += fan(300, 560, 270, [C.purple, C.green, C.red, C.blue2, C.plum, C.green2], 15, 150, -6);
g += fan(1290, 540, 290, [C.green, C.purple, C.orange, C.blue2, C.red, C.plum], 15, 150, 8);

/* tambor de crioula (grande) */
g += `<g>
  <path d="M700 330C676 420 676 500 704 600L896 600C924 500 924 420 900 330Z" fill="${C.brown}"/>
  <path d="M722 330C702 420 704 500 726 600L792 600C784 500 784 420 790 330Z" fill="${C.brown2}" opacity=".55"/>
  <ellipse cx="800" cy="332" rx="102" ry="30" fill="#e9c58a"/>
  <ellipse cx="800" cy="332" rx="102" ry="30" fill="none" stroke="${C.brown}" stroke-width="9"/>
  <ellipse cx="800" cy="332" rx="62" ry="15" fill="#d9ab68" opacity=".7"/>
  <path d="M690 400Q800 428 910 400M684 470Q800 500 916 470M692 545Q800 574 908 545" fill="none" stroke="#5c2f10" stroke-width="7"/>
  <path d="M720 345L742 392L720 440L744 488L722 536L746 586M880 345L858 392L880 440L856 488L878 536L854 586" fill="none" stroke="${C.cream}" stroke-width="5" stroke-linejoin="round" opacity=".9"/>
  <ellipse cx="800" cy="600" rx="98" ry="18" fill="#4a2410"/></g>`;
/* tambor menor, inclinado */
g += `<g transform="rotate(10 560 560)">
  <path d="M508 480C494 530 496 570 510 610L610 610C624 570 626 530 612 480Z" fill="${C.brown2}"/>
  <ellipse cx="560" cy="482" rx="53" ry="17" fill="#f0d29c"/><ellipse cx="560" cy="482" rx="53" ry="17" fill="none" stroke="${C.brown}" stroke-width="6"/>
  <path d="M504 525Q560 540 616 525M506 570Q560 585 614 570" fill="none" stroke="#5c2f10" stroke-width="5"/></g>`;

/* matracas e mãos */
g += `<g transform="rotate(-22 300 380)">
  <rect x="236" y="130" width="62" height="330" rx="5" fill="${C.wood}"/><rect x="236" y="130" width="22" height="330" fill="${C.wood2}" opacity=".7"/>
  <path d="M236 130l22 -22h62l-22 22z" fill="#e8b676"/>
  <rect x="318" y="170" width="62" height="330" rx="5" fill="${C.wood}"/><rect x="318" y="170" width="22" height="330" fill="${C.wood2}" opacity=".7"/>
  <path d="M318 170l22 -22h62l-22 22z" fill="#e8b676"/>
  <path d="M250 190q16 30 4 60M258 300q16 20 2 50M334 240q14 24 2 50M340 360q14 20 0 44" fill="none" stroke="#7a4a20" stroke-width="3" opacity=".6"/></g>`;
g += hand(238, 392, 18, 1.0);
g += hand(372, 330, 24, .96);

/* o boi bordado */
g += `<g transform="translate(1180 80)">
  <path d="M-30 150C20 100 170 96 250 160L276 350L-70 350Z" fill="${C.black}"/>
  <path d="M-12 168C40 128 160 128 232 176" fill="none" stroke="${C.yellow}" stroke-width="6" stroke-dasharray="3 10" stroke-linecap="round"/>
  <path d="M-52 330L276 330" stroke="${C.yellow}" stroke-width="5"/>
  <rect x="-70" y="338" width="346" height="34" rx="6" fill="${C.orange}"/>
  <path d="M-70 372q10 18 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="${C.red}"/>
  ${flower(60, 230, 30, C.cream, C.orange)}${flower(150, 270, 26, C.yellow2, C.red)}${flower(215, 215, 24, C.teal, C.blue)}${flower(110, 190, 18, C.plum, C.yellow)}
  <path d="M-40 270l12 24l26 4l-19 17l5 26l-24 -13l-24 13l5 -26l-19 -17l26 -4z" fill="${C.yellow}" opacity=".9" transform="translate(30 -10) scale(.8)"/>
  <ellipse cx="-30" cy="108" rx="82" ry="58" fill="${C.black}" transform="rotate(-8 -30 108)"/>
  <rect x="-170" y="92" width="112" height="62" rx="31" fill="${C.cream}" transform="rotate(-6 -114 123)"/>
  <circle cx="-150" cy="124" r="11" fill="${C.black}"/>
  <circle cx="-34" cy="86" r="17" fill="${C.yellow}"/><circle cx="-34" cy="86" r="7" fill="${C.black}"/>
  <path d="M10 62C30 10 70 -6 100 -4C96 30 70 58 40 74Z" fill="${C.black}"/><path d="M40 20C60 -30 90 -50 120 -50C120 -10 96 20 70 34Z" fill="${C.blue2}"/>
  <path d="M-110 56C-80 12 0 -2 50 36L30 50C-10 22 -70 28 -96 62Z" fill="${C.yellow}"/>
  <g>${[C.teal, C.red, C.yellow, C.green, C.purple].map((c, i) => `<rect x="${-120 + i * 12}" y="${40 + i * 3}" width="9" height="${100 - i * 8}" rx="4" fill="${c}" transform="rotate(${10 - i * 3} ${-120 + i * 12} 40)"/>`).join('')}</g>
</g>`;

/* o mar e a canoa de vela */
g += `<g transform="translate(400 0)">
  <path d="M1000 570L1130 570L1100 604L1030 604Z" fill="${C.brown}"/>
  <path d="M1066 568V470" stroke="${C.black}" stroke-width="4"/>
  <path d="M1068 474L1128 560L1068 560Z" fill="${C.cream}"/><path d="M1064 486L1016 560L1064 560Z" fill="${C.red}"/></g>`;
const wave = (y, amp, col, op, off) => {
  let d = `M${-40} ${y}`;
  for (let x = -40; x <= W + 120; x += 160) d += ` q${40} ${-amp} ${80} 0 t${80} 0`;
  d += ` V${H} H-40Z`;
  return `<path d="${d}" fill="${col}" opacity="${op}" transform="translate(${off} 0)"/>`;
};
g += wave(590, 26, C.teal, .55, -60) + wave(618, 30, C.blue2, .65, 10) + wave(652, 26, C.blue, .75, -90) + wave(688, 20, '#0b2c78', .85, 30);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
<!-- Ilustração original: matracas, tambor de crioula, boi bordado, penas e o mar. -->
${g}
</svg>
`;
const out = path.join(__dirname, '..', 'public', 'img', 'cultura-fundo.svg');
fs.writeFileSync(out, svg);
console.log('gravado', out, (svg.length / 1024).toFixed(0) + ' KB');
