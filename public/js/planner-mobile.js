/* Roteiro no celular: em vez de dois painéis empilhados, vira um passo a passo.
   1) escolher interesses (cartões grandes) → 2) ver o dia, uma parte por vez (Manhã / Tarde / Noite),
   com barra de ações fixa no rodapé da seção. No computador nada disso aparece (CSS .pl-m-only). */
(() => {
  const planner = document.querySelector('.planner');
  const slots = document.getElementById('planSlots');
  if (!planner || !slots) return;
  const gen = document.getElementById('planGen');
  const share = document.getElementById('planShare');
  const chips = document.getElementById('interestChips');
  const out = planner.querySelector('.pl-out');
  const NAMES = ['Manhã', 'Tarde', 'Noite'];
  let step = 1, active = 0;

  /* passos (topo) */
  const steps = document.createElement('div');
  steps.className = 'pl-steps pl-m-only';
  steps.setAttribute('role', 'tablist');
  steps.setAttribute('aria-label', 'Etapas do roteiro');
  steps.innerHTML = '<button type="button" role="tab" data-step="1"><b>1</b> Interesses</button>' +
                    '<button type="button" role="tab" data-step="2"><b>2</b> Seu dia</button>';
  planner.prepend(steps);

  /* abas Manhã / Tarde / Noite */
  const tabs = document.createElement('div');
  tabs.className = 'pl-tabs pl-m-only';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Parte do dia');
  tabs.innerHTML = NAMES.map((n, i) => `<button type="button" role="tab" data-t="${i}">${n}<span></span></button>`).join('');
  slots.before(tabs);

  /* barra fixa de ações */
  const bar = document.createElement('div');
  bar.className = 'pl-bar pl-m-only';
  bar.innerHTML = '<button type="button" class="pl-bar-main" data-act="gen"><span class="pl-bar-t">Gerar meu dia</span><span class="pl-bar-n"></span></button>' +
                  '<button type="button" class="pl-bar-sec" data-act="edit">Editar interesses</button>' +
                  '<button type="button" class="pl-bar-main" data-act="share">Compartilhar</button>';
  planner.append(bar);

  const hasPlan = () => slots.querySelectorAll('.pl-stop').length > 0;
  const firstWithItems = () => Math.max(0, [...slots.children].findIndex(s => s.querySelector('.pl-stop')));

  function setStep(n, scroll) {
    step = n;
    planner.dataset.step = String(n);
    steps.querySelectorAll('button').forEach(b => {
      const on = +b.dataset.step === n;
      b.setAttribute('aria-selected', on); b.classList.toggle('on', on);
    });
    if (scroll) planner.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function setTab(i) {
    active = i;
    slots.dataset.active = String(i);
    tabs.querySelectorAll('button').forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.classList.toggle('on', k === i); });
  }
  function syncTabs() {
    const secs = [...slots.children];
    tabs.querySelectorAll('button').forEach((b, k) => {
      const n = secs[k] ? secs[k].querySelectorAll('.pl-stop').length : 0;
      b.querySelector('span').textContent = n ? String(n) : '';
    });
    slots.dataset.active = String(active);
  }
  function syncCount() {
    const n = chips.querySelectorAll('.ichip.on').length;
    bar.querySelector(".pl-bar-n").textContent = n ? String(n) : "";
    bar.classList.toggle('empty', !n);
  }

  steps.addEventListener('click', e => {
    const b = e.target.closest('[data-step]'); if (b) setStep(+b.dataset.step, true);
  });
  tabs.addEventListener('click', e => {
    const b = e.target.closest('[data-t]'); if (b) setTab(+b.dataset.t);
  });
  bar.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    if (a.dataset.act === 'gen') gen.click();
    if (a.dataset.act === 'edit') setStep(1, true);
    if (a.dataset.act === 'share') share.click();
  });
  /* depois do clique em "Gerar" (tratado em app.js), vai para o passo 2 se houver lugares */
  gen.addEventListener('click', () => {
    if (!hasPlan()) return;
    setTab(firstWithItems());
    setStep(2, true);
  });
  chips.addEventListener('click', () => setTimeout(syncCount, 0));
  document.getElementById('planClear').addEventListener('click', () => setTimeout(() => { syncCount(); setTab(0); }, 0));
  new MutationObserver(syncTabs).observe(slots, { childList: true });

  /* deslizar para o lado troca de parte do dia */
  let x0 = null, y0 = null;
  out.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  out.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    setTab(Math.min(2, Math.max(0, active + (dx < 0 ? 1 : -1))));
  }, { passive: true });

  syncCount(); syncTabs();
  setTab(hasPlan() ? firstWithItems() : 0);
  setStep(hasPlan() ? 2 : 1, false);
})();
