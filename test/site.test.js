const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

test('o site renderiza com todas as seções e sem resíduos de template', async () => {
  const { render } = require('../lib/render');
  const html = await render();
  assert.match(html, /<html lang="pt-BR"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /<%|%>/);
  const sections = ['numeros', 'historia', 'lugares', 'mapa', 'sabores', 'festejo', 'calendario', 'cultura', 'galeria', 'roteiro', 'quiz', 'luzes'];
  sections.forEach(id => assert.match(html, new RegExp(`id="${id}"`), `seção #${id}`));
  assert.match(html, /id="skyToggle"/, 'botão dia/noite');
  assert.match(html, /class="moon"/, 'lua');
  assert.equal((html.match(/class="puff p\d"/g) || []).length, 5, 'nuvens do dia');
});

test('dados e HTML passam no validador (sem erros)', () => {
  /* gera dist atualizado antes de validar */
  execFileSync(process.execPath, [path.join(ROOT, 'build.js')], { stdio: 'pipe' });
  try {
    execFileSync(process.execPath, [path.join(ROOT, 'scripts/validate.js')], { stdio: 'pipe' });
  } catch (e) {
    assert.fail('validador falhou:\n' + String(e.stdout));
  }
});

test('o JSON embutido na página não permite fechar o <script>', async () => {
  const { render } = require('../lib/render');
  const html = await render();
  const m = html.match(/<script type="application\/json" id="site-data">([\s\S]*?)<\/script>/);
  assert.ok(m, 'bloco site-data presente');
  assert.doesNotMatch(m[1], /<\/script/i);
  assert.doesNotThrow(() => JSON.parse(m[1]));
});

test('leitor de fotos detecta dimensões e formatos', () => {
  const { loadPhotos } = require('../lib/photos');
  const photos = loadPhotos();
  assert.ok(photos.length > 0, 'há fotos');
  photos.forEach(p => {
    assert.ok(p.w > 0 && p.h > 0, `${p.id} com dimensões`);
    assert.ok(['std', 'wide', 'tall', 'feat'].includes(p.shape), `${p.id} com formato válido`);
    assert.ok(p.alt && p.alt.length > 10, `${p.id} com texto alternativo`);
  });
});
