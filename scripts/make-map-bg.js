#!/usr/bin/env node
/* Gera public/img/mapa-fundo.svg: ruas e orla do centro de São José de Ribamar (em torno da Praça São José),
   desenhadas em linhas a partir de dados do OpenStreetMap (© colaboradores do OpenStreetMap, ODbL).
   Dados: Overpass API, bbox (-2.5642,-44.0642,-2.5502,-44.0502), vias (highway), edifícios, orla (natural=coastline|water) e lazer:
     [out:json];(way["highway"](bbox);way["building"](bbox);way["natural"~"coastline|water"](bbox);way["leisure"](bbox););out geom;
   Uso: node scripts/make-map-bg.js <osm.json>   (JSON do Overpass com "out geom")                          */
const fs = require('fs');
const path = require('path');
const src = process.argv[2];
if (!src) { console.error('uso: node scripts/make-map-bg.js <osm.json>'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(src, 'utf8'));

const LAT0 = -2.5572, LON0 = -44.0571;           /* centro da referência */
const K = 1 / Math.cos(LAT0 * Math.PI / 180);     /* corrige a largura de um grau de longitude */
const SCALE = 110000;                              /* px por grau de latitude */
const W = 1800, H = 900;
const px = ([lat, lon]) => [W / 2 + (lon - LON0) * SCALE / K, H / 2 - (lat - LAT0) * SCALE];
const WIDTH = { motorway: 7, trunk: 7, primary: 6, secondary: 5, tertiary: 4, residential: 3, unclassified: 3, service: 1.6, footway: 1.2, path: 1.2, pedestrian: 2.4, track: 1.4 };

const line = g => 'M' + g.map(p => px([p.lat, p.lon]).map(n => n.toFixed(1)).join(' ')).join('L');
const roads = [], coast = [], blds = [], leis = [];
for (const e of data.elements) {
  if (!e.geometry || e.geometry.length < 2) continue;
  const t = e.tags || {};
  if (t.highway) roads.push({ w: WIDTH[t.highway] || 2, d: line(e.geometry) });
  else if (t.natural === 'coastline') coast.push(line(e.geometry));
  else if (t.building) blds.push(line(e.geometry) + 'Z');
  else if (t.leisure) leis.push(line(e.geometry) + 'Z');
}
roads.sort((a, b) => b.w - a.w);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<!-- Ruas e orla: © colaboradores do OpenStreetMap (ODbL) — openstreetmap.org/copyright -->
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${leis.map(d => `<path d="${d}" fill="#0b1a44" fill-opacity=".05" stroke="#0b1a44" stroke-opacity=".25" stroke-width="1.5"/>`).join('\n')}
${blds.map(d => `<path d="${d}" fill="#0b1a44" fill-opacity=".1"/>`).join('\n')}
${roads.map(r => `<path d="${r.d}" stroke="#ffffff" stroke-width="${r.w + 3}"/>`).join('\n')}
${roads.map(r => `<path d="${r.d}" stroke="#0b1a44" stroke-width="${Math.max(1, r.w * .55).toFixed(1)}"/>`).join('\n')}
${coast.map(d => `<path d="${d}" stroke="#1448b8" stroke-width="5"/>`).join('\n')}
</g>
</svg>
`;
const out = path.join(__dirname, '..', 'public', 'img', 'mapa-fundo.svg');
fs.writeFileSync(out, svg);
console.log('gravado', out, (svg.length / 1024).toFixed(0) + ' KB', `${roads.length} ruas, ${coast.length} trechos de orla`);
