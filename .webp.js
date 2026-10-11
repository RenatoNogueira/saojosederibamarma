const fs = require('fs');
const rd = p => fs.readFileSync(p, 'utf8');
const wr = (p, t) => fs.writeFileSync(p, t);
const sub = (t, a, b) => { if (!t.includes(a)) throw new Error('não encontrado: ' + a.slice(0, 60)); return t.split(a).join(b); };

/* manifesto das fotos: .jpg/.png → .webp (mantém "original" com o nome no Commons) */
let d = rd('data/photos.js');
d = d.replace(/"file": "([^"]+)\.(jpg|jpeg|png)"/g, (_, n) => `"file": "${n}.webp"`);
wr('data/photos.js', d);

/* hero */
let h = rd('views/partials/hero.ejs');
h = sub(h, 'img/igreja.png', 'img/igreja.webp');
h = sub(h, 'img/santo.png', 'img/santo.webp');
wr('views/partials/hero.ejs', h);
let c = rd('public/css/hero.css');
c = sub(c, "../img/igreja.png", "../img/igreja.webp");
wr('public/css/hero.css', c);
let v = rd('views/index.ejs');
v = sub(v, 'content="img/santo.png"', 'content="img/santo.webp"');
wr('views/index.ejs', v);

/* validador e leitor de dimensões */
let val = rd('scripts/validate.js');
val = sub(val, "'public/img/santo.png', 'public/img/igreja.png'", "'public/img/santo.webp', 'public/img/igreja.webp'");
wr('scripts/validate.js', val);
let p = rd('lib/photos.js');
if (!p.includes('VP8L')) {
  p = sub(p, "if (t === 'VP8 ') return", "if (t === 'VP8L') { const b0 = b.readUInt32LE(21); return { w: (b0 & 0x3fff) + 1, h: ((b0 >> 14) & 0x3fff) + 1 }; }\n      if (t === 'VP8 ') return");
  wr('lib/photos.js', p);
}
console.log('ok');
