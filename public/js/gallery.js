/* Galeria: filtro por tema e visualizador (lightbox) com teclado, toque, zoom e miniaturas */
(() => {
  const DATA = JSON.parse(document.getElementById('site-data').textContent);
  const photos = DATA.photos || [];
  const grid = document.getElementById('galGrid');
  if (!photos.length || !grid) return;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const byId = Object.fromEntries(photos.map(p => [p.id, p]));
  const labels = DATA.catLabels || {};

  const lb = $('#lightbox'), frame = $('#lbFrame'), img = $('#lbImg'), thumbs = $('#lbThumbs');
  const zoomBtn = $('#lbZoom'), prevBtn = $('#lbPrev'), nextBtn = $('#lbNext'), mapBtn = $('#lbMap');
  let cat = 'all', list = photos.slice(), idx = 0, lastFocus = null, zoomed = false;


  /* ---------- preenche lacunas da grade (sem buracos) ---------- */
  const BASE = { std: [1, 1], wide: [2, 1], tall: [1, 2], feat: [2, 2] };
  function packGrid() {
    const items = $$('.ph', grid).filter(f => !f.classList.contains('hide'));
    items.forEach(f => { f.style.gridColumn = ''; f.style.gridRow = ''; });
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    if (!items.length || cols < 2) return;
    const shape = f => ['feat', 'wide', 'tall', 'std'].find(s => f.classList.contains(s)) || 'std';
    const it = items.map(f => { const [w, h] = BASE[shape(f)]; return { f, w: Math.min(w, cols), h, x: 0, y: 0 }; });
    const place = () => {
      const occ = new Set(); const key = (x, y) => y + ',' + x;
      it.forEach(o => {
        for (let y = 0; ; y++) {
          let done = false;
          for (let x = 0; x + o.w <= cols; x++) {
            let ok = true;
            for (let dy = 0; dy < o.h && ok; dy++) for (let dx = 0; dx < o.w && ok; dx++) if (occ.has(key(x + dx, y + dy))) ok = false;
            if (ok) { o.x = x; o.y = y; for (let dy = 0; dy < o.h; dy++) for (let dx = 0; dx < o.w; dx++) occ.add(key(x + dx, y + dy)); done = true; break; }
          }
          if (done) break;
        }
      });
      const rows = Math.max(...it.map(o => o.y + o.h));
      return { occ, rows, key };
    };
    for (let guard = 0; guard < 24; guard++) {
      const { occ, rows, key } = place();
      let changed = false;
      outer: for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        if (occ.has(key(x, y))) continue;
        /* 1) alarga o cartão da esquerda, se todas as suas linhas têm vazio ao lado */
        const left = it.find(o => o.x + o.w === x && y >= o.y && y < o.y + o.h);
        if (left && [...Array(left.h).keys()].every(d => !occ.has(key(x, left.y + d)))) { left.w++; changed = true; break outer; }
        /* 2) alonga o cartão de cima, se todas as suas colunas têm vazio embaixo */
        const up = it.find(o => o.y + o.h === y && x >= o.x && x < o.x + o.w);
        if (up && [...Array(up.w).keys()].every(d => !occ.has(key(up.x + d, y)))) { up.h++; changed = true; break outer; }
      }
      if (!changed) break;
    }
    it.forEach(o => {
      const [bw, bh] = BASE[shape(o.f)];
      if (o.w !== Math.min(bw, cols)) o.f.style.gridColumn = 'span ' + o.w;
      if (o.h !== bh) o.f.style.gridRow = 'span ' + o.h;
    });
  }
  addEventListener('resize', () => { clearTimeout(packGrid.t); packGrid.t = setTimeout(packGrid, 120); });

  /* ---------- filtro + "ver todas" ---------- */
  const mq = matchMedia('(max-width: 640px)');
  const LIMIT = () => (mq.matches ? 6 : 8);
  const moreBtn = $('#galMore'), foot = $('#galFoot');
  let expanded = false;

  function refresh() {
    let shown = 0;
    $$('.ph', grid).forEach(f => {
      const inCat = cat === 'all' || f.dataset.cat === cat;
      const within = expanded || shown < LIMIT();
      const show = inCat && within;
      f.classList.toggle('hide', !show);
      if (inCat && within) shown++;
    });
    const total = list.length;
    $('#galCount').textContent = expanded || total <= LIMIT()
      ? `${total} ${total === 1 ? 'foto' : 'fotos'}`
      : `${Math.min(LIMIT(), total)} de ${total} fotos`;
    foot.hidden = total <= LIMIT();
    packGrid();
    moreBtn.setAttribute('aria-expanded', expanded);
    $('span', moreBtn).textContent = expanded ? 'Mostrar menos' : `Ver todas as ${total} fotos`;
  }

  $('#galChips').addEventListener('click', e => {
    const b = e.target.closest('.fchip'); if (!b) return;
    $$('#galChips .fchip').forEach(c => { const on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    cat = b.dataset.f;
    list = photos.filter(p => cat === 'all' || p.cat === cat);
    expanded = false;
    refresh();
  });
  moreBtn.addEventListener('click', () => {
    expanded = !expanded; refresh();
    if (!expanded) $('#galeria').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  mq.addEventListener?.('change', refresh);
  refresh();

  /* ---------- visualizador ---------- */
  function setZoom(on, e) {
    zoomed = on; frame.classList.toggle('zoomed', on);
    zoomBtn.setAttribute('aria-pressed', on);
    zoomBtn.setAttribute('aria-label', on ? 'Reduzir imagem' : 'Ampliar imagem');
    if (on && e) moveOrigin(e);
  }
  function moveOrigin(e) {
    const r = frame.getBoundingClientRect();
    img.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    img.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }

  function buildThumbs() {
    thumbs.innerHTML = list.map((p, i) =>
      `<button class="lb-thumb ${p.cutout ? 'cutout' : ''}" data-i="${i}" aria-label="${p.title.replace(/"/g, '&quot;')}"><img src="${p.src}" alt="" loading="lazy"></button>`).join('');
    thumbs.hidden = list.length < 2;
  }

  function show(i, first) {
    idx = (i + list.length) % list.length;
    const p = list[idx];
    setZoom(false);
    const apply = () => {
      img.src = p.src; img.alt = p.alt; img.classList.remove('swap');
      frame.classList.toggle('cut', p.cutout);
    };
    if (first) apply(); else { img.classList.add('swap'); setTimeout(apply, 160); }
    $('#lbCount').textContent = `${String(idx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    $('#lbCat').textContent = labels[p.cat] || '';
    $('#lbTitle').textContent = p.title;
    $('#lbCap').textContent = p.caption;
    $('#lbCap').hidden = !p.caption;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const parts = [p.place && esc(p.place), p.credit && 'Foto: ' + esc(p.credit)];
    if (p.license) parts.push(p.licenseUrl ? `<a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener license">${esc(p.license)}<span class="sr"> (abre em nova aba)</span></a>` : esc(p.license));
    if (p.source) parts.push(`<a href="${esc(p.source)}" target="_blank" rel="noopener">Wikimedia Commons<span class="sr"> (abre em nova aba)</span></a>`);
    $('#lbMeta').innerHTML = parts.filter(Boolean).join(' · ');
    mapBtn.hidden = !p.mapId; mapBtn.dataset.id = p.mapId || '';
    prevBtn.hidden = nextBtn.hidden = list.length < 2;
    $$('.lb-thumb', thumbs).forEach((t, k) => {
      const on = k === idx; if (on) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
      if (on) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: first ? 'auto' : 'smooth' });
    });
    /* pré-carrega vizinhas */
    [idx - 1, idx + 1].forEach(k => { const n = list[(k + list.length) % list.length]; if (n) new Image().src = n.src; });
  }

  function open(id) {
    const p = byId[id]; if (!p) return;
    list = photos.filter(x => cat === 'all' || x.cat === cat);
    if (!list.includes(p)) list = photos.slice();
    lastFocus = document.activeElement;
    buildThumbs();
    if (!lb.open) { lb.showModal(); document.body.style.overflow = 'hidden'; }
    show(list.indexOf(p), true);
  }

  grid.addEventListener('click', e => { const b = e.target.closest('[data-photo]'); if (b) open(b.dataset.photo); });
  prevBtn.onclick = () => show(idx - 1);
  nextBtn.onclick = () => show(idx + 1);
  $('#lbClose').onclick = () => lb.close();
  zoomBtn.onclick = () => setZoom(!zoomed);
  thumbs.addEventListener('click', e => { const t = e.target.closest('.lb-thumb'); if (t) show(+t.dataset.i); });
  img.addEventListener('click', e => setZoom(!zoomed, e));
  frame.addEventListener('pointermove', e => { if (zoomed && e.pointerType === 'mouse') moveOrigin(e); });
  mapBtn.onclick = () => {
    const id = mapBtn.dataset.id; lb.close();
    if (window.ribamarGoto) window.ribamarGoto(id); else location.hash = '#mapa';
  };
  lb.addEventListener('close', () => { document.body.style.overflow = ''; setZoom(false); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === '+' || e.key === '=') setZoom(true);
    if (e.key === '-') setZoom(false);
  });

  /* deslizar no toque */
  let x0 = null, y0 = 0;
  frame.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  frame.addEventListener('touchend', e => {
    if (x0 === null || zoomed) { x0 = null; return; }
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* imagem quebrada: mostra o título em vez de um ícone vazio */
  $$('.ph img', grid).forEach(im => im.addEventListener('error', () => { im.closest('.ph').classList.add('broken'); im.alt = ''; }));
})();
