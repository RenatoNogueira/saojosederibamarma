/* Trava a rolagem da página (menu, modais, visualizador de fotos).
   `overflow: hidden` no body não impede a rolagem por toque no iOS/Safari; a técnica confiável é
   fixar o body na posição atual e restaurá-la ao destravar. Usa contador: vários travamentos se somam. */
(() => {
  let count = 0, y = 0;
  const html = document.documentElement;
  const body = document.body;
  const props = ['position', 'top', 'left', 'right', 'width'];

  const api = window.scrollLock = {
    lock() {
      if (count++ > 0) return;
      y = window.scrollY || html.scrollTop || 0;
      html.classList.add('scroll-locked');
      body.style.position = 'fixed';
      body.style.top = `-${y}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
    },
    unlock() {
      if (count === 0) return;
      if (--count > 0) return;
      html.classList.remove('scroll-locked');
      props.forEach(p => { body.style[p] = ''; });
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';     /* restaura sem animar */
      window.scrollTo(0, y);
      html.style.scrollBehavior = prev;
    },
    get locked() { return count > 0; },
    /* trava enquanto um <dialog> estiver aberto; segue o atributo "open", sem depender do evento "close" */
    bindDialog(dialog) {
      let held = false;
      const sync = () => {
        if (dialog.open && !held) { held = true; api.lock(); }
        else if (!dialog.open && held) { held = false; api.unlock(); }
      };
      new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['open'] });
      sync();
    }
  };
})();
