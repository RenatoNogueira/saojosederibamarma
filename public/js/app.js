/* Interações abaixo do hero: nav, contadores, linha do tempo, lugares, modal, festejo, roteiro, quiz, lanternas */
(() => {
  document.documentElement.dataset.app = '1';
  const DATA = JSON.parse(document.getElementById('site-data').textContent);
  const SABIA = JSON.parse(document.getElementById('sabia-data').textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('ribamar:' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('ribamar:' + k, JSON.stringify(v)); } catch { /* sem storage */ } }
  };
  const icon = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${DATA.icons[n] || DATA.icons.star}"/></svg>`;
  /* chaves de versões anteriores do site (lanternas v1, flags antigas) */
  try { ['lanterns', 'cleared', 'quizBest'].forEach(k => localStorage.removeItem('ribamar:' + k)); } catch { /* sem storage */ }
  /* lê uma lista do armazenamento, tolerando valores corrompidos */
  const storedList = k => { const v = store.get(k, []); return Array.isArray(v) ? v : []; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const toast = (() => {
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t);
    let h; return msg => { t.textContent = msg; t.classList.add('on'); clearTimeout(h); h = setTimeout(() => t.classList.remove('on'), 2200); };
  })();

  /* ---------- nav ---------- */
  const nav = $('#siteNav'), progress = $('#progress'), links = $('#navLinks'), burger = $('#burger');
  function onScroll() {
    if (window.scrollLock && window.scrollLock.locked) return;   /* página travada: não recalcula */
    nav.classList.toggle('solid', scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  /* menu móvel: abre/fecha, trava a rolagem da página e fecha com Esc, clique fora ou ao ampliar a tela */
  let menuLocked = false;
  function setMenu(open, returnFocus) {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.documentElement.classList.toggle('menu-open', open);
    if (open !== menuLocked) { menuLocked = open; open ? window.scrollLock?.lock() : window.scrollLock?.unlock(); }
    if (!open && returnFocus) burger.focus();
  }
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) setMenu(false, true); });
  document.addEventListener('click', e => { if (links.classList.contains('open') && !e.target.closest('#siteNav')) setMenu(false); });
  matchMedia('(min-width: 1181px)').addEventListener?.('change', ev => { if (ev.matches) setMenu(false); });
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('[data-spy]').forEach(a => a.classList.toggle('on', a.dataset.spy === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- reveal + contadores ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    $$('[data-count]', e.target).forEach(countUp);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = el.dataset.fmt === 'dec', t0 = performance.now(), dur = 1600;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 4));
      el.textContent = dec ? v.toFixed(1).replace('.', ',') : Math.round(v).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- você sabia ---------- */
  (() => {
    const body = $('.sabia-body'), box = $('#sabia'), ring = $('#sabiaRing'), dots = $('#sabiaDots');
    const DUR = 9000, len = SABIA.length; let i = 0, timer;
    let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sync = () => {
      ring.classList.toggle('stopped', !playing); ring.setAttribute('aria-pressed', !playing);
      ring.setAttribute('aria-label', playing ? 'Pausar a troca automática das curiosidades' : 'Retomar a troca automática das curiosidades');
    };
    dots.innerHTML = SABIA.map((_, k) => `<i data-k="${k}"></i>`).join('');
    function restart() {
      clearTimeout(timer); ring.classList.remove('run'); void ring.offsetWidth;
      box.setAttribute('aria-live', playing ? 'off' : 'polite');
      if (!playing) return;
      ring.classList.add('run');
      timer = setTimeout(() => { box.setAttribute('aria-live', 'off'); show(i + 1); }, DUR);
    }
    function show(n, first) {
      i = (n + len) % len;
      const fill = () => {
        $('#sabiaTitle').textContent = SABIA[i].t; $('#sabiaText').textContent = SABIA[i].p;
        $('#sabiaCount').textContent = `${i + 1} / ${len}`; body.classList.remove('swap');
      };
      if (first) fill(); else { body.classList.add('swap'); setTimeout(fill, 250); }
      [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
      restart();
    }
    $('#sabiaNext').onclick = () => { box.setAttribute('aria-live', 'polite'); show(i + 1); };
    $('#sabiaPrev').onclick = () => { box.setAttribute('aria-live', 'polite'); show(i - 1); };
    ring.addEventListener('click', () => { playing = !playing; sync(); restart(); });
    sync();
    box.addEventListener('mouseenter', () => { box.classList.add('paused'); clearTimeout(timer); });
    box.addEventListener('mouseleave', () => { box.classList.remove('paused'); restart(); });
    show(0, true);
  })();

  /* ---------- filtros genéricos ---------- */
  function chipGroup(name, cb) {
    const g = $(`[data-filter-group="${name}"]`);
    g.addEventListener('click', e => {
      const b = e.target.closest('.fchip'); if (!b) return;
      $$('.fchip', g).forEach(c => { const on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
      cb(b.dataset.f);
    });
  }

  /* ---------- linha do tempo ---------- */
  (() => {
    const rail = $('#tlRail'), bar = $('#tlBar'), prev = $('#tlPrev'), next = $('#tlNext'), pos = $('#tlPos');
    const pad = n => String(n).padStart(2, '0');
    chipGroup('history', f => {
      $$('.tl-card').forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.cat !== f));
      rail.scrollTo({ left: 0, behavior: 'smooth' }); upd();
    });
    const step = () => Math.min(rail.clientWidth * .8, 600);
    next.onclick = () => rail.scrollBy({ left: step(), behavior: 'smooth' });
    prev.onclick = () => rail.scrollBy({ left: -step(), behavior: 'smooth' });
    function upd() {
      const max = rail.scrollWidth - rail.clientWidth;
      bar.style.width = (max > 0 ? Math.max(8, rail.scrollLeft / max * 100) : 100) + '%';
      prev.disabled = rail.scrollLeft < 4;
      next.disabled = max - rail.scrollLeft < 4;
      const cs = $$('.tl-card:not(.hide)'); let idx = 0, best = Infinity;
      cs.forEach((c, k) => { const d = Math.abs(c.offsetLeft - rail.scrollLeft); if (d < best) { best = d; idx = k; } });
      if (next.disabled && max > 0) idx = cs.length - 1;
      pos.textContent = `${pad(idx + 1)} / ${pad(cs.length)}`;
    }
    rail.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    rail.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    /* arrastar com o mouse */
    let down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', e => {
      if (!down) return; const dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; rail.classList.add('drag'); }
      rail.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => { down = false; rail.classList.remove('drag'); });
    rail.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  })();

  /* ---------- lugares ---------- */
  const saved = new Set(storedList('saved').filter(x => typeof x === 'string'));
  const placeById = Object.fromEntries(DATA.places.map(p => [p.id, p]));
  function persistSaved() { store.set('saved', [...saved]); syncSaveUI(); renderPlan(); }
  function syncSaveUI() {
    $$('[data-save]').forEach(b => b.setAttribute('aria-pressed', saved.has(b.dataset.save)));
    const ms = $('#mSave');
    if (ms.dataset.id) { const on = saved.has(ms.dataset.id); ms.classList.toggle('saved', on); ms.textContent = on ? 'Salvo no roteiro ✓' : 'Salvar no roteiro'; }
  }
  function toggleSave(id, btn) {
    if (saved.has(id)) { saved.delete(id); toast('Removido do roteiro'); }
    else { saved.add(id); toast(`“${placeById[id].name}” salvo no roteiro`); if (btn) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); } }
    persistSaved();
  }
  (() => {
    let cat = 'all', q = '';
    const apply = () => {
      let n = 0;
      $$('.pcard').forEach(c => {
        const ok = (cat === 'all' || c.dataset.cat === cat) && (!q || c.dataset.name.includes(q));
        c.classList.toggle('hide', !ok); if (ok) n++;
      });
      const cnt = { all: 0 };
      $$('.pcard').forEach(c => {
        if (q && !c.dataset.name.includes(q)) return;
        cnt.all++; cnt[c.dataset.cat] = (cnt[c.dataset.cat] || 0) + 1;
      });
      $$('#placesChips .fchip').forEach(b => { b.querySelector('em').textContent = cnt[b.dataset.f] || 0; });
      $('#placeEmpty').hidden = n > 0;
    };
    chipGroup('places', f => { cat = f; apply(); });
    $('#placeSearch').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); apply(); });
    $('#placeGrid').addEventListener('click', e => {
      const b = e.target.closest('[data-save]'); if (b) { e.stopPropagation(); toggleSave(b.dataset.save, b); }
    });
    /* inclinação 3D */
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  })();

  /* ---------- modal ---------- */
  const ROUTES = DATA.routes;
  let selectRoute = () => {};
  const modal = $('#modal');
  const CAT = { fe: 'Fé', territorio: 'Território', cultura: 'Cultura', praia: 'Praia' };
  function norm(kind, o) {
    if (kind === 'history') return { kind, id: o.id, eyebrow: `${CAT[o.cat]} · História`, title: o.title, year: o.year, body: o.body, facts: o.facts, src: o.src, ac: DATA.accents[o.cat] };
    if (kind === 'place') return { kind, id: o.id, eyebrow: `${CAT[o.cat] || 'Cultura e mar'} · Lugar`, title: o.name, icon: o.icon, body: o.body, facts: o.facts, tip: o.tip, ac: DATA.accents[o.cat] || '#ffc861', saveable: true };
    return { kind, id: o.id, eyebrow: o.kicker, title: o.name, year: kind === 'event' ? o.year : undefined, icon: o.icon, body: o.body, facts: o.facts, tip: o.tip, src: o.src, ac: o.ac };
  }
  const LISTS = {
    history: DATA.history.map(o => norm('history', o)),
    place: DATA.places.map(o => norm('place', o)),
    culture: DATA.culture.map(o => norm('culture', o)),
    dish: (DATA.dishes || []).map(o => norm('dish', o)),
    stay: (DATA.stays || []).map(o => norm('stay', o)),
    event: (DATA.events || []).map(o => norm('event', o))
  };
  let cur = null, lastFocus = null;
  const lbl = it => it.year ? `${it.year} · ${it.title}` : it.title;
  function openItem(kind, id, dir = 0) {
    const list = LISTS[kind], i = list.findIndex(x => x.id === id); if (i < 0) return;
    cur = { kind, i }; const it = list[i], n = list.length;
    $('#mIn').style.setProperty('--ac', it.ac); modal.style.setProperty('--ac', it.ac);
    $('#mArt').innerHTML = it.year ? `<span class="big-year">${esc(it.year)}</span>` : `<span class="big-ic">${icon(it.icon)}</span>`;
    $('#mEyebrow').textContent = it.eyebrow;
    $('#mTitle').textContent = it.title;
    $('#mText').innerHTML = it.body.map(p => `<p>${esc(p)}</p>`).join('');
    $('#mFacts').innerHTML = (it.facts || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    const tip = $('#mTip'); tip.hidden = !it.tip; tip.innerHTML = it.tip ? `${icon('bulb')}<div><b>Dica</b>${esc(it.tip)}</div>` : '';
    $('#mSrc').textContent = it.src ? 'Fonte: ' + it.src : '';
    const ms = $('#mSave'); ms.hidden = !it.saveable; ms.dataset.id = it.saveable ? it.id : '';
    const mm = $('#mMap'); mm.hidden = !(it.kind === 'place' && ROUTES.some(r => r.id === it.id)); mm.dataset.id = it.id;
    syncSaveUI();

    $('#mCount').textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    $('#mDots').innerHTML = list.map((x, k) => `<button class="${k === i ? 'on' : ''}" data-k="${k}" aria-label="${esc(lbl(x))}"></button>`).join('');
    const multi = n > 1;
    $('#mPrev').hidden = $('#mNext').hidden = !multi;
    if (multi) { $('#mPrevLbl').textContent = lbl(list[(i - 1 + n) % n]); $('#mNextLbl').textContent = lbl(list[(i + 1) % n]); }

    if (!modal.open) { lastFocus = document.activeElement; modal.showModal(); }
    const sc = $('#mScroll'); sc.scrollTop = 0;
    sc.classList.remove('in-r', 'in-l');
    if (dir) { void sc.offsetWidth; sc.classList.add(dir > 0 ? 'in-r' : 'in-l'); }
  }
  function step(d) { if (!cur) return; const l = LISTS[cur.kind]; openItem(cur.kind, l[(cur.i + d + l.length) % l.length].id, d); }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (!o) return;
    const [kind, id] = o.dataset.open.split(':'); openItem(kind, id);
  });
  $('#mClose').onclick = () => modal.close();
  $('#mPrev').onclick = () => step(-1);
  $('#mNext').onclick = () => step(1);
  $('#mSave').onclick = e => toggleSave(e.currentTarget.dataset.id);
  $('#mMap').onclick = e => { const id = e.currentTarget.dataset.id; modal.close(); selectRoute(id); };
  $('#mDots').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !cur) return;
    const k = +b.dataset.k; if (k !== cur.i) openItem(cur.kind, LISTS[cur.kind][k].id, k > cur.i ? 1 : -1);
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  window.scrollLock?.bindDialog(modal);
  modal.addEventListener('close', () => { cur = null; if (lastFocus) lastFocus.focus?.(); });
  modal.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  /* deslizar no toque para trocar de ficha */
  (() => {
    let x0 = null, y0 = 0;
    const m = $('#mIn');
    m.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    m.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  /* ---------- como chegar ---------- */
  (() => {
    const frame = $('#mapFrame'), poster = $('#mapPoster');
    const enc = encodeURIComponent;
    let cur = ROUTES[0], loaded = false;
    const embedUrl = r => `https://www.google.com/maps?q=${enc(r.q)}&hl=pt-BR&z=${r.id === 'cidade' ? 12 : 15}&output=embed`;
    function setFrame() {
      let f = frame.querySelector('iframe');
      if (!f) {
        f = document.createElement('iframe');
        f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
        frame.appendChild(f);
      }
      f.title = 'Mapa: ' + cur.name; f.src = embedUrl(cur);
    }
    function show(id, scroll) {
      const r = ROUTES.find(x => x.id === id); if (!r) return; cur = r;
      $$('.dest').forEach(b => { const on = b.dataset.dest === id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      $('#destName').textContent = r.name; $('#destLine').textContent = r.line;
      const ad = $('#destAddr'); ad.hidden = !r.address;
      ad.innerHTML = r.address ? esc(r.address) + (r.plus ? ` · Plus Code <b>${esc(r.plus)}</b>` : '') : '';
      $('#posterName').textContent = r.name;
      $('#goRoute').href = `https://www.google.com/maps/dir/?api=1&destination=${enc(r.q)}&travelmode=driving`;
      $('#goMap').href = `https://www.google.com/maps/search/?api=1&query=${enc(r.q)}`;
      $('#goWaze').href = `https://waze.com/ul?q=${enc(r.q)}&navigate=yes`;
      if (loaded) setFrame();
      if (scroll) $('#mapa').scrollIntoView({ behavior: 'smooth' });
    }
    $('#mapLoad').onclick = () => { loaded = true; poster.classList.add('gone'); setFrame(); };
    $('#destList').addEventListener('click', e => { const b = e.target.closest('.dest'); if (b) show(b.dataset.dest); });
    $('#copyAddr').onclick = async () => {
      try { await navigator.clipboard.writeText(cur.address ? cur.name + ' — ' + cur.address : cur.q); toast('Endereço copiado'); }
      catch { toast('Não foi possível copiar'); }
    };
    selectRoute = id => show(id, true);
    window.ribamarGoto = selectRoute;
    show('cidade');
  })();

  /* ---------- festejo ---------- */
  (() => {
    const evs = Object.fromEntries(DATA.festejo.events.map(e => [e.id, e]));
    const panel = $('#routePanel');
    function show(id, animate = true) {
      const e = evs[id]; if (!e) return;
      $$('.rt').forEach(b => { const on = b.dataset.event === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      $$('.day.ev').forEach(b => b.classList.toggle('on', b.dataset.event === id));
      const fill = () => {
        $('#rWhen').textContent = (e.day ? `${e.day} de setembro · ` : '') + e.time;
        $('#rName').textContent = e.name; $('#rDesc').textContent = e.desc;
        $('#rStops').innerHTML = e.stops.map((s, i) => `<li style="--i:${i}">${esc(s)}</li>`).join('');
        /* reinicia a animação do traçado */
        const r = $('#rStops'); r.style.animation = 'none'; void r.offsetWidth; r.style.animation = '';
        panel.classList.remove('swap');
      };
      if (animate) { panel.classList.add('swap'); setTimeout(fill, 220); } else fill();
    }
    $('.fest-grid').addEventListener('click', e => {
      const b = e.target.closest('[data-event]'); if (b) show(b.dataset.event);
    });
    show(DATA.festejo.events[0].id, false);
  })();

  /* ---------- roteiro ---------- */
  const interests = new Set(storedList('interests').filter(x => typeof x === 'string'));
  const SLOTS = [
    { id: 'manhã', icon: 'sun', time: '8h – 12h' },
    { id: 'tarde', icon: 'sunset', time: '14h – 18h' },
    { id: 'noite', icon: 'moon', time: '19h em diante' }
  ];
  function syncChips() {
    $$('#interestChips .ichip').forEach(c => { const on = interests.has(c.dataset.i); c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    const n = interests.size;
    $('#interestCount').textContent = n ? `${n} ${n === 1 ? 'selecionado' : 'selecionados'}` : 'Nenhum selecionado';
  }
  function renderPlan() {
    const list = [...saved].map(id => placeById[id]).filter(Boolean);
    $('#planSlots').innerHTML = SLOTS.map(s => {
      const items = list.filter(p => p.slot === s.id);
      const body = items.length
        ? items.map((p, i) => `<div class="pl-stop" style="--i:${i};--ac:${DATA.accents[p.cat] || '#ffc861'}">
            <span class="pl-ic">${icon(p.icon)}</span>
            <button class="pl-name" data-open="place:${p.id}"><b>${esc(p.name)}</b><small>${esc(p.short)}</small></button>
            <button class="pl-x" data-unsave="${p.id}" aria-label="Remover ${esc(p.name)}">${icon('close')}</button></div>`).join('')
        : `<a class="pl-empty" href="#lugares">+ Adicionar um lugar para a ${s.id}</a>`;
      return `<section class="pl-slot ${items.length ? 'has' : ''}">
        <header><span class="pl-sicon">${icon(s.icon)}</span><div><h4>${s.id}</h4><small>${s.time}</small></div><span class="pl-n">${items.length}</span></header>
        <div class="pl-items">${body}</div></section>`;
    }).join('');
    [...$('#planDay').children].forEach((el, k) => el.classList.toggle('on', list.some(p => p.slot === SLOTS[k].id)));
    $('#planCount').textContent = `${list.length} ${list.length === 1 ? 'lugar' : 'lugares'}`;
    $('#planHint').textContent = list.length ? 'Toque no nome para ver a ficha ou no × para remover.' : 'Selecione ao menos um interesse ou salve lugares com o coração.';
  }
  function planText() {
    const list = [...saved].map(id => placeById[id]).filter(Boolean);
    return ['Meu dia em São José de Ribamar', ...SLOTS.map(s => {
      const it = list.filter(p => p.slot === s.id).map(p => `  • ${p.name}`);
      return it.length ? `${s.id[0].toUpperCase() + s.id.slice(1)} (${s.time}):\n${it.join('\n')}` : '';
    }).filter(Boolean)].join('\n\n');
  }
  (() => {
    $('#interestChips').addEventListener('click', e => {
      const c = e.target.closest('.ichip'); if (!c) return;
      interests.has(c.dataset.i) ? interests.delete(c.dataset.i) : interests.add(c.dataset.i);
      store.set('interests', [...interests]); syncChips();
    });
    $('#planGen').onclick = () => {
      if (!interests.size) { toast('Escolha ao menos um interesse'); return; }
      /* pontua cada lugar pelos interesses; no máx. 2 por período */
      const scored = DATA.places.map(p => {
        const tags = [...p.tags, p.cat === 'praia' ? 'praia' : ''];
        return { p, s: [...interests].filter(w => tags.includes(w)).length };
      }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
      saved.clear();
      const perSlot = { manhã: 0, tarde: 0, noite: 0 };
      scored.forEach(({ p }) => { if (perSlot[p.slot] < 2) { perSlot[p.slot]++; saved.add(p.id); } });
      persistSaved();
      toast(saved.size ? `Roteiro com ${saved.size} ${saved.size === 1 ? 'lugar' : 'lugares'}` : 'Nada combinou — tente outros interesses');
    };
    $('#planClear').onclick = () => { saved.clear(); interests.clear(); store.set('interests', []); syncChips(); persistSaved(); toast('Roteiro limpo'); };
    $('#planSlots').addEventListener('click', e => {
      const u = e.target.closest('[data-unsave]'); if (u) { saved.delete(u.dataset.unsave); persistSaved(); }
    });
    const guard = () => { if (!saved.size) { toast('Seu roteiro está vazio'); return false; } return true; };
    $('#planCopy').onclick = async () => {
      if (!guard()) return;
      try { await navigator.clipboard.writeText(planText()); toast('Roteiro copiado!'); } catch { toast('Não foi possível copiar'); }
    };
    $('#planShare').onclick = async () => {
      if (!guard()) return;
      if (navigator.share) { try { await navigator.share({ title: 'Meu dia em São José de Ribamar', text: planText() }); } catch { /* cancelado */ } }
      else { try { await navigator.clipboard.writeText(planText()); toast('Roteiro copiado para compartilhar'); } catch { toast('Não foi possível compartilhar'); } }
    };
    syncChips(); syncSaveUI(); renderPlan();
  })();

  /* ---------- quiz ---------- */
  (() => {
    const Q = DATA.quiz; let n = 0, score = 0;
    const box = $('#quizBox'), end = $('#quizEnd');
    function render() {
      const q = Q[n];
      $('#qNo').textContent = `Pergunta ${n + 1} de ${Q.length}`;
      $('#qBar').style.width = (n / Q.length * 100) + '%';
      $('#qText').textContent = q.q;
      $('#qOpts').innerHTML = q.o.map((o, i) => `<button class="qopt" data-i="${i}"><b>${'ABCD'[i]}</b>${esc(o)}</button>`).join('');
      $('#qExp').hidden = true; $('#qNext').hidden = true;
      $('#qNext').textContent = n === Q.length - 1 ? 'Ver resultado' : 'Próxima';
    }
    $('#qOpts').addEventListener('click', e => {
      const b = e.target.closest('.qopt'); if (!b || b.disabled) return;
      const q = Q[n], pick = +b.dataset.i, ok = pick === q.a;
      if (ok) score++;
      $$('.qopt').forEach((x, i) => { x.disabled = true; if (i === q.a) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      $('#qExp').hidden = false; $('#qExp').textContent = (ok ? 'Isso mesmo! ' : 'Quase. ') + q.e;
      $('#qNext').hidden = false;
    });
    $('#qNext').onclick = () => {
      n++;
      if (n >= Q.length) {
        box.hidden = true; end.hidden = false;
        $('#qBar').style.width = '100%';
        $('#qMedal').textContent = `${score}/${Q.length}`;
        $('#qScore').textContent = score >= 7 ? 'Você é de casa!' : score >= 4 ? 'Já conhece bastante' : 'Ainda tem muito a descobrir';
        $('#qMsg').textContent = score >= 7 ? 'Uma ótima conversa para a próxima romaria.'
          : 'Volte às seções acima e tente de novo — as respostas estão todas na página.';
      } else render();
    };
    $('#qRestart').onclick = () => { n = 0; score = 0; end.hidden = true; box.hidden = false; render(); };
    render();
  })();

  /* ---------- lanternas ---------- */
  (() => {
    const KINDS = {
      gratidao: { label: 'Gratidão', ph: 'Obrigado, São José, por…' },
      pedido: { label: 'Pedido', ph: 'Peço proteção para…' },
      lembranca: { label: 'Lembrança', ph: 'Em memória de…' }
    };
    const form = $('#lanternForm'), msg = $('#lMsg'), from = $('#lFrom'), sky = $('#skyBox'), card = $('#lCard');
    const ring = $('#lRing'), RING = 62.8;
    let kind = 'gratidao';
    /* só lanternas realmente enviadas: descarta exemplos que versões anteriores possam ter gravado */
    let list = storedList('lanterns2').filter(l => l && typeof l.m === 'string' && l.t && !/^Exemplo:/.test(l.m)).map(l => ({ ...l, k: ['gratidao', 'pedido', 'lembranca'].includes(l.k) ? l.k : 'gratidao' }));
    store.set('lanterns2', list);

    const lampHtml = (glow = 1) => `<span class="lamp-wrap" style="--glow:${glow}"><span class="halo"></span><span class="lamp"><i></i></span></span>`;
    const when = t => t ? 'acesa em ' + new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : 'exemplo';

    function render(opts = {}) {
      $$('.lantern, .sky-empty', sky).forEach(n => n.remove());
      list.forEach((l, i) => {
        const el = document.createElement('button');
        el.type = 'button'; el.className = 'lantern ' + l.k; el.dataset.i = i;
        el.style.left = l.x + '%';
        el.style.animationDuration = l.dur + 's'; el.style.animationDelay = l.delay + 's';
        el.style.setProperty('--sway', l.sway + 'px');
        el.style.setProperty('--rise', Math.round(sky.clientHeight * .78) + 'px');
        el.style.setProperty('--sc', l.sc);
        el.innerHTML = lampHtml(1);
        el.setAttribute('aria-label', `Lanterna de ${KINDS[l.k].label.toLowerCase()}: ${l.m}`);
        if (opts.born === i) { el.classList.add('born'); el.style.animationDelay = '0s, 0s'; }
        sky.appendChild(el);
      });
      if (!list.length) { const p = document.createElement('p'); p.className = 'sky-empty'; p.textContent = 'O céu está vazio. Solte a primeira lanterna.'; sky.appendChild(p); }
      $('#skyCount').textContent = list.length;
      $('#skyLbl').textContent = list.length === 1 ? 'lanterna no céu' : 'lanternas no céu';
      $('#skyHint').hidden = !list.length;
    }

    /* card da mensagem junto da lanterna */
    let openI = -1;
    function openCard(el) {
      const l = list[+el.dataset.i]; if (!l) return;
      $$('.lantern.sel', sky).forEach(x => x.classList.remove('sel')); el.classList.add('sel'); openI = +el.dataset.i;
      const c = { gratidao: '255,170,80', pedido: '226,80,63', lembranca: '110,165,255' }[l.k];
      card.style.setProperty('--kg', c);
      $('#lKind').textContent = KINDS[l.k].label;
      $('#lMsgOut').textContent = l.m;
      $('#lFromOut').textContent = l.from ? '— ' + l.from : '';
      $('#lWhen').textContent = when(l.t);
      const sr = sky.getBoundingClientRect(), r = el.getBoundingClientRect();
      const w = card.offsetWidth || 300, h = card.offsetHeight || 150;
      let x = r.left - sr.left + r.width / 2 - w / 2; x = Math.max(12, Math.min(sr.width - w - 12, x));
      let y = r.top - sr.top - h - 14; if (y < 12) y = r.bottom - sr.top + 14;
      card.style.left = x + 'px'; card.style.top = y + 'px';
      card.classList.add('on');
    }
    function closeCard() { card.classList.remove('on'); $$('.lantern.sel', sky).forEach(x => x.classList.remove('sel')); openI = -1; }
    sky.addEventListener('click', e => {
      const el = e.target.closest('.lantern');
      if (el) { e.stopPropagation(); (+el.dataset.i === openI) ? closeCard() : openCard(el); }
      else if (!e.target.closest('.l-card')) closeCard();
    });
    $('#lCardX').addEventListener('click', closeCard);
    addEventListener('keydown', e => { if (e.key === 'Escape' && card.classList.contains('on')) closeCard(); });

    /* formulário */
    function setKind(k) {
      kind = k; form.dataset.k = k;
      $$('.kind', form).forEach(b => b.setAttribute('aria-checked', b.dataset.k === k));
      msg.placeholder = KINDS[k].ph;
    }
    $('.kinds', form).addEventListener('click', e => { const b = e.target.closest('.kind'); if (b) setKind(b.dataset.k); });
    function counter() {
      const n = msg.value.length;
      $('#lCount').textContent = `${n} / 140`;
      ring.style.strokeDashoffset = RING * (1 - n / 140);
      /* a lanterna da prévia brilha mais quanto mais você escreve */
      $('#lPreview .lamp-wrap').style.setProperty('--glow', (.7 + n / 140 * .9).toFixed(2));
    }
    msg.addEventListener('input', counter);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const m = msg.value.trim(); if (!m) { toast('Escreva uma mensagem antes de soltar a lanterna'); msg.focus(); return; }
      list.push({ m, k: kind, from: from.value.trim(), t: Date.now(), x: 6 + Math.random() * 84, dur: 18 + Math.random() * 10, delay: 0,
        sway: (Math.random() * 70 - 35) | 0, sc: +(.9 + Math.random() * .35).toFixed(2) });
      list = list.slice(-24); store.set('lanterns2', list);
      msg.value = ''; counter(); closeCard();
      render({ born: list.length - 1 });
      sky.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('Sua lanterna subiu ✦');
    });
    $('#skyClear').onclick = () => {
      if (!list.length) return;
      list = []; store.set('lanterns2', list); closeCard(); render(); toast('Céu limpo');
    };

    setKind('gratidao'); counter(); render();
  })();
})();
