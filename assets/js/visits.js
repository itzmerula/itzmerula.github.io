(() => {
  const el = document.querySelector('[data-visits]');
  if (!el) return;

  const NAMESPACE = 'jules0061-github-io';
  const KEY = 'visits';
  const PROXY = 'https://cv-proxy.developingjules.workers.dev';
  const ABACUS = 'https://abacus.jasoncameron.dev';
  const STORE_ID = 'cv.device.id';
  const STORE_LAST = 'cv.device.lastVisit';
  const STORE_COUNT = 'cv.visits.cached.v2';
  const COOLDOWN = 6 * 60 * 60 * 1000;
  const TIMEOUT = 6000;
  const RETRIES = 3;
  const RETRY_DELAY = 700;
  const OFFSET = 79;

  const endpoints = (op) => op === 'up'
    ? [`${ABACUS}/hit/${NAMESPACE}/${KEY}`, `${PROXY}/up`]
    : [`${ABACUS}/get/${NAMESPACE}/${KEY}`, `${PROXY}/`];

  const canvasSignal = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'nocanvas';
      ctx.textBaseline = 'top';
      ctx.font = '14px monospace';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 60, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('cv-fingerprint', 2, 2);
      return canvas.toDataURL().slice(-96);
    } catch (error) {
      return 'nocanvas';
    }
  };

  const hash = (value) => {
    let h1 = 0x9e3779b1;
    let h2 = 0x85ebca6b;
    for (let i = 0; i < value.length; i += 1) {
      const c = value.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    return ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)).padStart(13, '0');
  };

  const deviceId = () => {
    let stored = null;
    try {
      stored = localStorage.getItem(STORE_ID);
    } catch (error) {
      stored = null;
    }
    if (stored) return stored;

    const parts = [
      navigator.userAgent,
      navigator.language,
      (navigator.languages || []).join(','),
      navigator.hardwareConcurrency,
      navigator.deviceMemory,
      navigator.maxTouchPoints,
      screen.width,
      screen.height,
      screen.colorDepth,
      devicePixelRatio,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      new Date().getTimezoneOffset(),
      canvasSignal()
    ].join('|');

    const id = hash(parts);
    try {
      localStorage.setItem(STORE_ID, id);
    } catch (error) {
      void error;
    }
    return id;
  };

  const read = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const write = (key, value) => {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      void error;
    }
  };

  const shouldCount = () => {
    const last = Number.parseInt(read(STORE_LAST) || '0', 10) || 0;
    return Date.now() - last >= COOLDOWN;
  };

  const render = (count) => {
    el.textContent = Number(count + OFFSET).toLocaleString('en-US');
    el.hidden = false;
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const request = async (url, id) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const sep = url.includes('?') ? '&' : '?';

    try {
      const response = await fetch(`${url}${sep}device=${id}`, {
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) {
        const error = new Error(String(response.status));
        error.fatal = response.status >= 400 && response.status < 500;
        throw error;
      }

      const data = await response.json();
      const payload = data?.data ?? data;
      const count = payload?.value ?? payload?.up_count ?? payload?.count;
      if (typeof count !== 'number') throw new Error('bad payload');
      return count;
    } finally {
      clearTimeout(timer);
    }
  };

  const beacon = (op, id) => {
    for (const url of endpoints(op)) {
      try {
        const img = new Image();
        const sep = url.includes('?') ? '&' : '?';
        img.src = `${url}${sep}device=${id}&t=${Date.now()}`;
      } catch (error) {
        void error;
      }
    }
  };

  const attempt = async (op, id) => {
    for (const url of endpoints(op)) {
      for (let tries = 0; tries < RETRIES; tries += 1) {
        try {
          return await request(url, id);
        } catch (error) {
          if (error.fatal || tries === RETRIES - 1) break;
          await wait(RETRY_DELAY * (tries + 1));
        }
      }
    }
    beacon(op, id);
    return null;
  };

  const load = async () => {
    const cached = Number.parseInt(read(STORE_COUNT) || '', 10);
    if (Number.isFinite(cached)) render(cached);

    const id = deviceId();
    const counting = shouldCount();
    let count = await attempt(counting ? 'up' : 'get', id);

    if (counting && count === null) {
      count = await attempt('get', id);
    } else if (counting && count !== null) {
      write(STORE_LAST, Date.now());
    }

    if (count === null) return;

    write(STORE_COUNT, count);
    render(count);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true });
  } else {
    load();
  }
})();
