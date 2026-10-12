/* Aviso de privacidade: guarda a escolha em localStorage (ribamar:consent = "all" | "essential").
   O contador de visitas (visitors.js) só roda com "all". O botão do rodapé reabre o aviso. */
(() => {
  const KEY = 'ribamar:consent';
  const box = document.getElementById('cookies');
  if (!box) return;
  const read = () => { try { const v = localStorage.getItem(KEY); return v === 'all' || v === 'essential' ? v : null; } catch { return null; } };
  const write = v => { try { localStorage.setItem(KEY, v); } catch { /* sem storage */ } };

  const show = () => { box.hidden = false; };
  const hide = () => { box.hidden = true; };
  function choose(v) {
    write(v);
    window.ribamarConsent = v;
    hide();
    document.dispatchEvent(new CustomEvent('ribamar:consent', { detail: v }));
  }

  window.ribamarConsent = read();
  if (!window.ribamarConsent) setTimeout(show, 1200);

  box.addEventListener('click', e => {
    const b = e.target.closest('[data-ck]');
    if (b) choose(b.dataset.ck);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden && read()) hide(); });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-ck-open]')) { show(); box.querySelector('.ck-main').focus(); }
  });
})();
