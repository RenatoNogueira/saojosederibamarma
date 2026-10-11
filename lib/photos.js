/* Lê public/photos, detecta dimensões (PNG/JPEG/WebP) e junta com as legendas de data/photos.js */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'public', 'photos');
const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const CATS = { fe: 'Fé e santuário', interior: 'Interior da igreja', cidade: 'Praça e centro', cultura: 'Arte e cultura', mar: 'Orla e mar' };

function dims(file) {
  try {
    const b = fs.readFileSync(file);
    if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const t = b.toString('ascii', 12, 16);
      if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      if (t === 'VP8L') { const b0 = b.readUInt32LE(21); return { w: (b0 & 0x3fff) + 1, h: ((b0 >> 14) & 0x3fff) + 1 }; }
      if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    }
  } catch { /* sem dimensões */ }
  return { w: 4, h: 3 };
}

const pretty = f => path.basename(f, path.extname(f)).replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const slug = f => path.basename(f, path.extname(f)).toLowerCase().replace(/[^a-z0-9]+/g, '-');

function loadPhotos() {
  const manifest = require('../data/photos');
  let files = [];
  try { files = fs.readdirSync(DIR).filter(f => EXT.test(f)); } catch { /* pasta ausente */ }
  const byFile = Object.fromEntries(manifest.map(m => [m.file, m]));
  const ordered = [...manifest.map(m => m.file).filter(f => files.includes(f)), ...files.filter(f => !byFile[f]).sort()];

  return ordered.map(file => {
    const m = byFile[file] || {};
    const { w, h } = dims(path.join(DIR, file));
    const r = w / h;
    const auto = r >= 1.55 ? 'wide' : r <= 0.8 ? 'tall' : 'std';
    const shape = m.feature ? 'feat' : ['std', 'wide', 'tall', 'feat'].includes(m.shape) ? m.shape : auto;
    const title = m.title || pretty(file);
    return {
      id: slug(file), src: 'photos/' + encodeURIComponent(file), w, h, shape,
      title, alt: m.alt || title, caption: m.caption || '', cat: CATS[m.cat] ? m.cat : 'cidade',
      place: m.place || '', credit: m.credit || '', license: m.license || '', licenseUrl: m.licenseUrl || '', source: m.source || '',
      original: m.original || '', cutout: !!m.cutout, mapId: m.mapId || ''
    };
  });
}

module.exports = { loadPhotos, CATS };
