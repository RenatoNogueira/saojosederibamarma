/* Compartilhar: menu nativo do aparelho (celular) ou painel com redes sociais e "copiar link".
   O link carrega a prévia (imagem + título + descrição) pelas tags Open Graph / Twitter do <head>.
   Cada rede recebe parâmetros utm_* para medir a origem dos acessos; o <link rel=canonical> permanece limpo. */
(() => {
  const dlg = document.getElementById('shareDialog');
  const triggers = [...document.querySelectorAll('[data-share]')];
  if (!triggers.length) return;

  const $ = id => document.getElementById(id);
  const meta = (sel, attr = 'content') => { const e = document.querySelector(sel); return e ? e.getAttribute(attr) : ''; };
  const canonical = (meta('link[rel="canonical"]', 'href') || location.origin + location.pathname).replace(/#.*$/, '');
  const siteTitle = meta('meta[property="og:title"]') || document.title;
  const siteName = meta('meta[property="og:site_name"]') || 'São José de Ribamar';

  /* seção que está na tela agora (último <section> cujo topo passou de 40% da altura) */
  function currentSection() {
    const secs = [...document.querySelectorAll('main > section[id]')].filter(s => s.id !== 'hero');
    let found = null;
    for (const s of secs) if (s.getBoundingClientRect().top <= innerHeight * 0.4) found = s;
    if (!found) return null;
    const link = document.querySelector(`#navLinks a[href="#${found.id}"]`);
    const h2 = found.querySelector('h2');
    return { id: found.id, name: (link && link.textContent.trim()) || (h2 && h2.textContent.trim()) || found.id };
  }

  let state = { url: canonical, text: siteTitle, section: null };

  function compute(useSection) {
    const sec = currentSection();
    const withSection = !!(sec && useSection);
    return {
      section: sec,
      url: canonical + (withSection ? '#' + sec.id : ''),
      text: withSection ? `${siteName} — ${sec.name}: ${siteTitle.replace(/^[^—–-]+[—–-]\s*/, '')}` : siteTitle
    };
  }
  const withUtm = (url, source) => {
    const [base, hash] = url.split('#');
    return base + (base.includes('?') ? '&' : '?') + `utm_source=${source}&utm_medium=social&utm_campaign=compartilhar` + (hash ? '#' + hash : '');
  };

  const enc = encodeURIComponent;
  const NETWORKS = {
    whatsapp: (u, t) => `https://wa.me/?text=${enc(t + ' ' + withUtm(u, 'whatsapp'))}`,
    facebook: u => `https://www.facebook.com/sharer/sharer.php?u=${enc(withUtm(u, 'facebook'))}`,
    x: (u, t) => `https://twitter.com/intent/tweet?text=${enc(t)}&url=${enc(withUtm(u, 'x'))}`,
    telegram: (u, t) => `https://t.me/share/url?url=${enc(withUtm(u, 'telegram'))}&text=${enc(t)}`,
    email: (u, t) => `mailto:?subject=${enc(t)}&body=${enc(t + '\n\n' + withUtm(u, 'email'))}`
  };

  function refresh() {
    const useSection = $('shSection') ? $('shSection').checked : false;
    state = compute(useSection);
    $('shTitle').textContent = siteTitle;
    $('shUrl').textContent = state.url.replace(/^https?:\/\//, '');
    $('shField').value = state.url;
    document.querySelectorAll('#shGrid [data-net]').forEach(a => { a.href = NETWORKS[a.dataset.net](state.url, state.text); });
  }

  function notify(msg) {
    $('shMsg').textContent = msg;
    clearTimeout(notify.t);
    notify.t = setTimeout(() => { $('shMsg').textContent = ''; $('shCopyLbl').textContent = 'Copiar link'; }, 2500);
  }

  async function copy() {
    const text = state.url;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const f = $('shField'); f.focus(); f.select();
      try { document.execCommand('copy'); } catch { notify('Selecione e copie o link acima.'); return; }
    }
    $('shCopyLbl').textContent = 'Link copiado!';
    notify('Link copiado. Cole onde quiser: a prévia com imagem aparece sozinha.');
  }

  function openDialog() {
    const sec = currentSection();
    const wrap = $('shSectionWrap');
    wrap.hidden = !sec;
    if (sec) { $('shSectionName').textContent = sec.name; $('shSection').checked = true; }
    refresh();
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else window.prompt('Copie o link:', state.url);
  }

  async function onShare() {
    /* celular/tablet: menu nativo de compartilhamento */
    const coarse = matchMedia('(pointer: coarse)').matches;
    if (navigator.share && coarse) {
      const s = compute(true);
      try { await navigator.share({ title: siteTitle, text: s.text, url: s.url }); }
      catch (e) { if (e && e.name !== 'AbortError') openDialog(); }
      return;
    }
    openDialog();
  }

  triggers.forEach(t => t.addEventListener('click', onShare));
  $('shareClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('shSection').addEventListener('change', refresh);
  $('shCopy').addEventListener('click', copy);
  $('shField').addEventListener('focus', e => e.target.select());
  if (window.scrollLock && window.scrollLock.bindDialog) window.scrollLock.bindDialog(dlg);
})();
