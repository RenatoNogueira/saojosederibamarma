/* Sabores (filtro por região) e Calendário (filtro por mês) */
(() => {
  const DATA = JSON.parse(document.getElementById('site-data').textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];


  /* carrossel genérico: setas (.rail-nav[data-for]), teclado e arrastar com o mouse */
  function carousel(grid, extra) {
    const nav = document.querySelector('.eat-nav[data-for="' + grid.id + '"]');
    const prev = nav && nav.querySelector('[data-dir="-1"]'), next = nav && nav.querySelector('[data-dir="1"]');
    const update = () => {
      const max = grid.scrollWidth - grid.clientWidth - 8;
      if (prev) prev.disabled = grid.scrollLeft <= 8;
      if (next) next.disabled = grid.scrollLeft >= max;
      if (nav) nav.classList.toggle('static', max <= 0);
      if (extra) extra();
    };
    const step = () => Math.max(260, grid.clientWidth * .8);
    if (prev) prev.addEventListener('click', () => grid.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => grid.scrollBy({ left: step(), behavior: 'smooth' }));
    grid.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    grid.addEventListener('keydown', e => {
      if (e.target !== grid) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); grid.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); grid.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
    let down = null, moved = false;
    grid.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) { down = { x: e.clientX, l: grid.scrollLeft }; moved = false; } });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 5) { moved = true; grid.classList.add('drag'); }
      if (moved) grid.scrollLeft = down.l - dx;
    });
    window.addEventListener('pointerup', () => { down = null; grid.classList.remove('drag'); });
    grid.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    update();
    return update;
  }
  $$('[data-rail]').forEach(g => carousel(g));

  /* onde comer: filtro por região */
  const chips = $('#eatChips');
  if (chips) {
    const notes = Object.fromEntries((DATA.eatAreas || []).map(a => [a.id, a.note]));
    const apply = f => {
      $$('.eat').forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.area !== f));
      $('#eatNote').textContent = f === 'all' ? 'Das praias ao centro: onde comer em Ribamar.' : notes[f] || '';
      const g = $('#eatGrid'); if (g) { g.scrollLeft = 0; update(); }
    };

    const grid = $('#eatGrid');
    const rail = grid && carousel(grid, () => {
      const n = $$('.eat:not(.hide)').length;
      $('#eatCount').textContent = n + (n === 1 ? ' lugar' : ' lugares');
    });
    function update() { if (rail) rail(); }
    chips.addEventListener('click', e => {
      const b = e.target.closest('.fchip'); if (!b) return;
      $$('.fchip', chips).forEach(c => { const on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
      apply(b.dataset.f);
    });
    apply('all');
  }

  /* calendário: filtro por mês */
  const strip = $('#monthStrip');
  if (strip) {
    strip.addEventListener('click', e => {
      const b = e.target.closest('.mon'); if (!b || b.disabled) return;
      $$('.mon', strip).forEach(c => { const on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
      const m = +b.dataset.m;
      $$('.ev').forEach(li => li.classList.toggle('hide', m !== 0 && +li.dataset.month !== m));
    });
  }
})();
