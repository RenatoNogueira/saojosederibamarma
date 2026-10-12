/* Hero: título, estrelas, lanternas leves, paralaxe suave e disparo da entrada em sequência */
(() => {
  const hero = document.getElementById('hero');
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* título letra a letra */
  const big = hero.querySelector('.big');
  'RIBAMAR'.split('').forEach((c, i) => {
    const s = document.createElement('span'); s.textContent = c; s.style.setProperty('--i', i); big.appendChild(s);
  });

  /* entrada: espera imagens e fontes (no máx. 3 s) e então dispara a sequência */
  const imgs = [...hero.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => {}) : Promise.resolve());
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([Promise.all([...imgs, fonts]), new Promise(r => setTimeout(r, 3000))]).then(() => {
    setTimeout(() => { hero.classList.add('ready'); document.body.classList.add('hero-ready'); }, 60);
  });

  /* dia e noite: automático pela hora local (6h–18h = dia); o visitante pode alternar (vale nesta visita) */
  const btn = document.getElementById('skyToggle');
  const KEY = 'ribamar:sky';
  const auto = () => { const hh = new Date().getHours(); return hh >= 6 && hh < 18 ? 'day' : 'night'; };
  const valid = v => (v === 'day' || v === 'night') ? v : null;
  let manual = valid(new URLSearchParams(location.search).get('sky'));
  if (!manual) { try { manual = valid(sessionStorage.getItem(KEY)); } catch { /* sem storage */ } }
  function applySky(mode) {
    hero.dataset.time = mode;
    document.documentElement.dataset.sky = mode;
    if (btn) {
      btn.setAttribute('aria-label', mode === 'day' ? 'Mudar o céu para a noite' : 'Mudar o céu para o dia');
      btn.title = mode === 'day' ? 'Ver a noite' : 'Ver o dia';
    }
  }
  applySky(manual || auto());
  if (btn) btn.addEventListener('click', () => {
    manual = hero.dataset.time === 'day' ? 'night' : 'day';
    try { sessionStorage.setItem(KEY, manual); } catch { /* sem storage */ }
    applySky(manual);
  });
  setInterval(() => { if (!manual) applySky(auto()); }, 5 * 60 * 1000);   /* página aberta atravessando o pôr do sol */

  /* estrelas (cintilam à noite; esmaecem de dia) */
  const sc = document.getElementById('stars'), sx = sc.getContext('2d');
  let stars = [], W = 0, H = 0, starA = 1;
  function initStars() {
    sc.width = hero.clientWidth * DPR; sc.height = hero.clientHeight * DPR; W = sc.width; H = sc.height;
    stars = Array.from({ length: Math.round(hero.clientWidth / 6) }, () => ({
      x: Math.random() * W, y: Math.random() * H * .65, r: (Math.random() * 1.2 + .3) * DPR, p: Math.random() * 6.28, s: Math.random() * 1.4 + .4 }));
  }

  /* lanternas subindo (poucas, para manter a animação leve) */
  const lc = document.getElementById('lights'), lx = lc.getContext('2d');
  let lamps = [];
  const spawn = init => ({ x: Math.random() * lc.width, y: init ? Math.random() * lc.height : lc.height + 20 * DPR,
    r: (Math.random() * 2.2 + 1.2) * DPR, vy: -(Math.random() * .4 + .18) * DPR, ph: Math.random() * 6.28,
    sw: Math.random() * .6 + .2, hue: 30 + Math.random() * 20, a: Math.random() * .45 + .3 });
  function initLamps() {
    lc.width = hero.clientWidth * DPR; lc.height = hero.clientHeight * DPR;
    lamps = Array.from({ length: Math.round(Math.min(40, hero.clientWidth / 30)) }, () => spawn(true));
  }

  /* paralaxe suave com o mouse (só estátua, igreja e sol) */
  const targets = [
    [document.getElementById('statue'), 16], [document.getElementById('church'), 10], [hero.querySelector('.sun-wrap'), 6]];
  let tx = 0, ty = 0, px = 0, py = 0;
  if (!reduce) addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; });

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);

  function frame(t) {
    requestAnimationFrame(frame);
    if (!visible || !hero.classList.contains('ready')) return;
    const secs = t / 1000;

    px += (tx - px) * .05; py += (ty - py) * .05;
    for (const [el, d] of targets) el.style.translate = `${-px * d}px ${-py * d * .5}px`;

    sx.clearRect(0, 0, W, H);
    starA += ((hero.dataset.time === 'night' ? 1 : 0) - starA) * .04;
    const fade = starA;
    sx.fillStyle = '#fff';
    for (const s of stars) {
      sx.globalAlpha = (.35 + .65 * Math.abs(Math.sin(secs * s.s + s.p))) * fade;
      sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 6.283); sx.fill();
    }
    sx.globalAlpha = 1;

    lx.clearRect(0, 0, lc.width, lc.height); lx.globalCompositeOperation = 'lighter';
    for (const l of lamps) {
      l.y += l.vy; l.x += Math.sin(secs * l.sw + l.ph) * .3 * DPR;
      if (l.y < -30 * DPR) Object.assign(l, spawn(false));
      const tw = .7 + .3 * Math.sin(secs * 3 + l.ph), g = lx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 7);
      g.addColorStop(0, `hsla(${l.hue},100%,75%,${l.a * tw})`);
      g.addColorStop(.4, `hsla(${l.hue},100%,60%,${l.a * .3 * tw})`);
      g.addColorStop(1, `hsla(${l.hue},100%,50%,0)`);
      lx.fillStyle = g; lx.beginPath(); lx.arc(l.x, l.y, l.r * 7, 0, 6.283); lx.fill();
    }
    lx.globalCompositeOperation = 'source-over';
  }

  function resize() { initStars(); initLamps(); }
  addEventListener('resize', resize);
  resize(); requestAnimationFrame(frame);
})();
