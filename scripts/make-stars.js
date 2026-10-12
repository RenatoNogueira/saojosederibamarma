#!/usr/bin/env node
/* Gera public/img/estrelas.svg: um céu estrelado esparso (ladrilho 1200×800) para o fundo da seção "Acenda uma luz".
   Poucas estrelas, pequenas e de baixa opacidade, e algumas que piscam devagar (CSS dentro do SVG, desligado com
   prefers-reduced-motion). Aleatório com semente fixa: o resultado é sempre o mesmo.   Uso: node scripts/make-stars.js */
const fs = require('fs');
const path = require('path');
let seed = 20261012;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const W = 1200, H = 800;
const TINT = ['#ffffff', '#dbe6ff', '#bcd0ff', '#fff1d0'];
const pick = a => a[Math.floor(rnd() * a.length)];

let dots = '';
for (let i = 0; i < 70; i++) {
  const r = (.5 + rnd() * .7).toFixed(2);
  dots += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${r}" fill="${pick(TINT)}" opacity="${(.25 + rnd() * .35).toFixed(2)}"/>`;
}
let bright = '';
for (let i = 0; i < 9; i++) {
  const x = (60 + rnd() * (W - 120)).toFixed(0), y = (40 + rnd() * (H - 80)).toFixed(0);
  const r = (1.3 + rnd() * .5).toFixed(2);
  bright += `<g class="t t${i % 3}"><circle cx="${x}" cy="${y}" r="${(r * 3).toFixed(1)}" fill="#bcd0ff" opacity=".10"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity=".85"/></g>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<style>
@media (prefers-reduced-motion:no-preference){
  .t{animation:tw 6s ease-in-out infinite}
  .t1{animation-duration:8s;animation-delay:-3s}
  .t2{animation-duration:10s;animation-delay:-6s}
  @keyframes tw{0%,100%{opacity:1}50%{opacity:.35}}
}
</style>
${dots}
${bright}
</svg>
`;
const out = path.join(__dirname, '..', 'public', 'img', 'estrelas.svg');
fs.writeFileSync(out, svg);
console.log('gravado', out, (svg.length / 1024).toFixed(1) + ' KB');
