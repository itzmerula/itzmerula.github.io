(() => {
  if (window.__cvStartupBooted) return;
  window.__cvStartupBooted = true;

  const root = document.documentElement;
  const overlay = document.getElementById('startup');

  const reduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  if (!overlay) {
    root.classList.remove('intro-active');
    root.classList.add('intro-done');
    return;
  }

  const fill = overlay.querySelector('.startup-bar-fill');
  const letters = overlay.querySelectorAll('.startup-word span');
  const timers = [];

  const at = (ms, fn) => {
    timers.push(window.setTimeout(fn, ms));
  };

  const clearAll = () => {
    timers.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    timers.length = 0;
  };

  const setProgress = (value) => {
    if (fill) fill.style.width = value + '%';
  };

  let revealed = false;
  let finished = false;
  let started = false;
  let ready = false;

  const reveal = () => {
    if (revealed) return;
    revealed = true;

    clearAll();
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    root.classList.remove('intro-active');
    root.classList.add('intro-done');
  };

  const exit = () => {
    overlay.classList.add('is-out');
    at(reduced ? 280 : 520, reveal);
  };

  const complete = () => {
    if (finished) return;
    finished = true;

    setProgress(100);
    at(reduced ? 160 : 340, exit);
  };

  const settle = (promise) => Promise.resolve(promise).catch(() => undefined);

  const mediaReady = new Promise((resolve) => {
    const image = document.querySelector('.avatar-slot img');
    if (!image || image.complete) {
      resolve();
      return;
    }

    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  });

  const pageReady = new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }

    window.addEventListener('load', resolve, { once: true });
  });

  const fontsReady = document.fonts ? settle(document.fonts.ready) : Promise.resolve();

  Promise.all([fontsReady, mediaReady, pageReady]).then(() => {
    ready = true;
  });

  const EXTRA_WAIT = reduced ? 400 : 800;

  const awaitFinal = () => {
    if (ready) {
      complete();
      return;
    }

    const begun = Date.now();
    const poll = window.setInterval(() => {
      if (!ready && Date.now() - begun < EXTRA_WAIT) return;
      window.clearInterval(poll);
      complete();
    }, 80);

    timers.push(poll);
  };

  const runLoading = () => {
    overlay.classList.add('is-loading');
    setProgress(10);

    at(330, () => setProgress(26));
    at(660, () => setProgress(42));
    at(990, () => setProgress(58));
    at(1320, () => setProgress(74));
    at(1650, awaitFinal);
  };

  const runLetters = () => {
    if (started || revealed) return;
    started = true;

    const step = 82;
    const span = letters.length * step + 200;

    overlay.classList.add('is-lit');
    at(span + 320, runLoading);
  };

  if (reduced) {
    started = true;
    overlay.classList.add('is-lit', 'is-loading');
    setProgress(45);
    at(260, () => setProgress(78));
    at(520, awaitFinal);
  } else {
    at(520, runLetters);
    fontsReady.then(runLetters);
  }

  at(7500, reveal);
})();
