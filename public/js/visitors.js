/* Contador de visitantes discreto no rodapé.
   - total de visitas + "agora" (só aparece com 2 ou mais pessoas, para não parecer vazio)
   - sem cookies; sessionStorage guarda só um id aleatório
   - se a API não existir (ex.: dev local) ou falhar, o contador simplesmente não aparece */
(() => {
  const el = document.getElementById('visitors');
  if (!el) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;   /* respeita "Do Not Track" */

  const KEY_SID = 'ribamar:sid', KEY_COUNTED = 'ribamar:counted';
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* sem storage */ } }
  };
  const makeId = () => {
    const a = new Uint8Array(12);
    (crypto || window.msCrypto).getRandomValues(a);
    return [...a].map(b => (b % 36).toString(36)).join('');
  };
  let sid = store.get(KEY_SID);
  if (!sid || !/^[a-z0-9]{8,40}$/.test(sid)) { sid = makeId(); store.set(KEY_SID, sid); }

  const fmt = new Intl.NumberFormat('pt-BR');
  let timer = null, failures = 0;

  function render({ total, online }) {
    if (!(total > 0)) return;
    const parts = [`${fmt.format(total)} ${total === 1 ? 'visita' : 'visitas'}`];
    if (online >= 2) parts.push(`${fmt.format(online)} agora`);
    el.textContent = parts.join(' · ');
    el.hidden = false;
  }

  async function ping() {
    const counted = store.get(KEY_COUNTED) === '1';
    try {
      const r = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, newVisit: !counted }),
        keepalive: true
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      store.set(KEY_COUNTED, '1');
      failures = 0;
      render(data);
    } catch {
      failures++;
      if (failures >= 3) stop();                       /* desiste depois de 3 falhas seguidas */
    }
  }

  function start() { if (timer || failures >= 3) return; ping(); timer = setInterval(ping, 30000); }
  function stop() { clearInterval(timer); timer = null; }

  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  if (!document.hidden) start();
})();
