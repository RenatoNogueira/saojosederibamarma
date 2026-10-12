/* Sabores (filtro por região) e Calendário (filtro por mês) */
(() => {
  const DATA = JSON.parse(document.getElementById('site-data').textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* onde comer: filtro por região */
  const chips = $('#eatChips');
  if (chips) {
    const notes = Object.fromEntries((DATA.eatAreas || []).map(a => [a.id, a.note]));
    const apply = f => {
      $$('.eat').forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.area !== f));
      $('#eatNote').textContent = f === 'all' ? 'Das praias ao centro: onde comer em Ribamar.' : notes[f] || '';
      const g = $('#eatGrid'); if (g) { g.scrollLeft = 0; update(); }
    };

    /* carrossel: setas, contagem e arrastar com o mouse */
    const grid = $('#eatGrid'), prev = $('#eatPrev'), next = $('#eatNext'), count = $('#eatCount');
    function update() {
      if (!grid) return;
      const max = grid.scrollWidth - grid.clientWidth - 2;
      prev.disabled = grid.scrollLeft <= 2;
      next.disabled = grid.scrollLeft >= max;
      const n = $$('.eat:not(.hide)').length;
      count.textContent = n + (n === 1 ? ' lugar' : ' lugares');
    }
    if (grid) {
      const step = () => Math.max(260, grid.clientWidth * .8);
      prev.addEventListener('click', () => grid.scrollBy({ left: -step(), behavior: 'smooth' }));
      next.addEventListener('click', () => grid.scrollBy({ left: step(), behavior: 'smooth' }));
      grid.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
      window.addEventListener('resize', update);
      grid.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
      });
      let down = null, moved = false;
      grid.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && !e.target.closest('a')) { down = { x: e.clientX, l: grid.scrollLeft }; moved = false; } });
      window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 4) { moved = true; grid.classList.add('drag'); } grid.scrollLeft = down.l - dx; });
      window.addEventListener('pointerup', () => { down = null; grid.classList.remove('drag'); });
    }
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
