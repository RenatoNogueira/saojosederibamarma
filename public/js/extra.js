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
    };
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
