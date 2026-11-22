/* Ali Hamza — portfolio interactions */
(() => {
  'use strict';

  window.AH_READY = true;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ------------------------------------------------------------------
     Palettes (60 / 30 / 10). Keep ids in sync with the list in <head>.
     ------------------------------------------------------------------ */
  const THEMES = {
    graphite: [['Graphite Teal', '#1E3638'], ['Mushroom Linen', '#D6CCBF'], ['Coral', '#FF7A59']],
    lavender: [['Lavender Milk', '#ECE6F4'], ['Charcoal Slate', '#2F3541'], ['Off White', '#FAF9F6']],
    sapphire: [['Deep Sapphire', '#0F2A57'], ['Pearl Shell', '#F1EAE0'],    ['Lavender Milk', '#ECE6F4']],
    ivory:    [['Antique Ivory', '#F2EBDC'], ['Piano Black', '#121212'],    ['Surf Turquoise', '#2CC5BD']],
    storm:    [['Storm Grey', '#4E545C'],    ['Matte Black', '#161616'],    ['Safety Orange', '#FF6B1A']],
    linen:    [['Linen', '#FAF0E6'],         ['Navy', '#1B2A4A'],           ['Sienna Brown', '#A0522D']],
    sky:      [['Sky', '#DCEBF5'],           ['Ocean', '#0E4D64'],          ['Coral', '#FF7A59']],
    ricotta:  [['Prussian Blue', '#003153'], ['Ricotta Cream', '#F8F4E9'],  ['Lobster Red', '#CF3A24']]
  };
  const ORDER = Object.keys(THEMES);
  const SHARE = [60, 30, 10];
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const toast = document.querySelector('.toast');
  let toastTimer = 0;

  const current = () => (THEMES[root.dataset.theme] ? root.dataset.theme : 'storm');
  const label = id => `${String(ORDER.indexOf(id) + 1).padStart(2, '0')} · ${THEMES[id].map(c => c[0]).join(' · ')}`;

  /* Palette dock — one click per palette. Remove this block once a palette is chosen. */
  const dock = document.createElement('aside');
  dock.className = 'dock';
  dock.setAttribute('aria-label', 'Colour palettes');
  dock.innerHTML =
    '<button class="dock-toggle" type="button" aria-expanded="true" aria-label="Hide palettes" title="Hide / show palettes">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.7-.9 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.4-.7-.4-1.1 0-.9.7-1.7 1.7-1.7h2a4.5 4.5 0 0 0 4.5-4.5C21 6.7 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/></svg>' +
    '</button><div class="dock-list" role="group" aria-label="Choose a palette"></div>';
  const dockList = dock.querySelector('.dock-list');
  ORDER.forEach(id => {
    const [a, b, c] = THEMES[id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.dataset.themeBtn = id;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', label(id) + ' palette');
    btn.style.setProperty('--s60', a[1]);
    btn.style.setProperty('--s30', b[1]);
    btn.style.setProperty('--s10', c[1]);
    const tip = document.createElement('span');
    tip.className = 'tip';
    tip.textContent = label(id);
    btn.appendChild(tip);
    dockList.appendChild(btn);
  });
  document.body.appendChild(dock);

  const dockToggle = dock.querySelector('.dock-toggle');
  const setDock = open => {
    dock.classList.toggle('collapsed', !open);
    dockToggle.setAttribute('aria-expanded', String(open));
    dockToggle.setAttribute('aria-label', open ? 'Hide palettes' : 'Show palettes');
    try { localStorage.setItem('ah-dock', open ? '1' : '0'); } catch (e) { /* storage unavailable */ }
  };
  // Small or short screens start with the dock folded into one button, so it never covers the hero
  let dockOpen = innerWidth > 760 && innerHeight > 560;
  try {
    const saved = localStorage.getItem('ah-dock');
    if (saved !== null) dockOpen = saved === '1';
  } catch (e) { /* storage unavailable */ }
  setDock(dockOpen);
  dockToggle.addEventListener('click', () => setDock(dock.classList.contains('collapsed')));

  const swatches = Array.from(dock.querySelectorAll('[data-theme-btn]'));

  function applyTheme(name) {
    root.dataset.theme = name;
    try { localStorage.setItem('ah-theme', name); } catch (e) { /* storage unavailable */ }
    swatches.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeBtn === name)));
    if (metaTheme) metaTheme.setAttribute('content', THEMES[name][0][1]);
  }

  function flash(html) {
    if (!toast) return;
    toast.innerHTML = html;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  const showToast = name => flash(THEMES[name]
    .map(([n, hex], i) => `<span><i style="background:${hex}"></i>${n} <b>${SHARE[i]}%</b></span>`)
    .join(''));

  function switchTheme(name, x, y) {
    if (!THEMES[name] || name === current()) return;

    if (reduceMotion || typeof document.startViewTransition !== 'function') {
      root.classList.add('theming');
      applyTheme(name);
      setTimeout(() => root.classList.remove('theming'), 650);
      showToast(name);
      return;
    }

    // Circular reveal from the clicked swatch
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(() => applyTheme(name));
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 850, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
    vt.finished.finally(() => showToast(name));
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return r.width ? [r.left + r.width / 2, r.top + r.height / 2] : [innerWidth / 2, innerHeight / 2];
  }

  swatches.forEach(btn => {
    btn.addEventListener('click', () => switchTheme(btn.dataset.themeBtn, ...centerOf(btn)));
  });

  // "T" = next palette, "Shift+T" = previous palette
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 't' || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
    const step = e.shiftKey ? -1 : 1;
    const next = ORDER[(ORDER.indexOf(current()) + step + ORDER.length) % ORDER.length];
    const btn = swatches.find(b => b.dataset.themeBtn === next);
    switchTheme(next, ...(btn ? centerOf(btn) : [innerWidth / 2, innerHeight / 2]));
  });

  applyTheme(current());

  /* Portrait look, at the foot of the dock: the photo's own colours, or black and white dots.
     Also ?portrait=colour / ?portrait=bw, and the "P" key. Remove with the dock once one is chosen. */
  const LOOKS = { colour: 'Portrait · photo colours', bw: 'Portrait · black & white' };
  let portraitLook = 'colour';
  try {
    const asked = new URLSearchParams(location.search).get('portrait');
    const saved = localStorage.getItem('ah-portrait');
    if (LOOKS[asked]) portraitLook = asked;
    else if (LOOKS[saved]) portraitLook = saved;
  } catch (e) { /* storage unavailable */ }
  let applyPortraitLook = () => {};               // set by the portrait below, once it exists
  const lookBtn = document.createElement('button');
  lookBtn.type = 'button';
  lookBtn.className = 'swatch look';
  const lookTip = document.createElement('span');
  lookTip.className = 'tip';
  lookBtn.appendChild(lookTip);
  const showLook = () => {
    lookBtn.dataset.look = portraitLook;
    lookBtn.setAttribute('aria-label', LOOKS[portraitLook] + ' (click to switch)');
    lookTip.textContent = LOOKS[portraitLook];
  };
  const toggleLook = () => {
    portraitLook = portraitLook === 'colour' ? 'bw' : 'colour';
    try { localStorage.setItem('ah-portrait', portraitLook); } catch (e) { /* storage unavailable */ }
    showLook();
    applyPortraitLook();
    flash(`<span>${LOOKS[portraitLook]}</span>`);
  };
  showLook();
  lookBtn.addEventListener('click', toggleLook);
  dockList.appendChild(lookBtn);
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'p' || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
    toggleLook();
  });

  /* ------------------------------------------------------------------
     Scroll reveals, counters
     ------------------------------------------------------------------ */
  // Index each tag inside a card so they pop in one by one
  document.querySelectorAll('.card .keys, .card .mini').forEach(list => {
    Array.from(list.children).forEach((li, i) => li.style.setProperty('--c', i));
  });
  document.querySelectorAll('[data-stagger]').forEach(group => {
    Array.from(group.children).forEach((el, i) => el.style.setProperty('--i', i));
  });

  const format = (el, v) => {
    const d = +el.dataset.decimals || 0;
    let s = el.dataset.sep ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : v.toFixed(d);
    if (el.dataset.pad) s = s.padStart(+el.dataset.pad, '0');
    el.textContent = s;
  };
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  if (!reduceMotion) counters.forEach(el => format(el, 0));

  function runCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end = parseFloat(el.dataset.count);
    if (reduceMotion) { format(el, end); return; }
    const duration = 1700;
    let start = null;
    const step = now => {
      if (start === null) start = now;
      const p = Math.min((now - start) / duration, 1);
      format(el, end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const reveal = el => {
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(runCount);
  };

  const watched = document.querySelectorAll('[data-reveal], [data-observe]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    watched.forEach(el => io.observe(el));
  } else {
    watched.forEach(reveal);
  }

  /* ------------------------------------------------------------------
     Nav: hide on scroll down, show on scroll up, progress, active link
     ------------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  const progress = document.querySelector('.progress span');
  let lastY = window.scrollY;
  let ticking = false;
  let menuOpen = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 24);
    if (!menuOpen && Math.abs(y - lastY) > 6) {
      nav.classList.toggle('hidden', y > lastY && y > 480);
      lastY = y;
    }
    const max = root.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const key = '#' + (entry.target.dataset.nav || entry.target.id);
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === key));
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');

  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    if (open) nav.classList.remove('hidden');
  }

  if (menuBtn && menu) {
    Array.from(menu.querySelectorAll('a')).forEach((a, i) => {
      a.style.setProperty('--i', i);
      a.addEventListener('click', () => setMenu(false));
    });
    menuBtn.addEventListener('click', () => setMenu(!menuOpen));
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); }
    });
    const wide = window.matchMedia('(min-width: 1001px)');
    if (wide.addEventListener) wide.addEventListener('change', e => { if (e.matches && menuOpen) setMenu(false); });
  }

  /* ------------------------------------------------------------------
     Hero intro
     1 · a full stop drops from the top and bounces on the baseline
     2 · a board flips like calendar pages through Pakistan → NUST →
         COMSATS → Ali Hamza; the full stop hops along as each word's
         full stop, lands on the "i", and its stem lifts it into the dot
     3 · the name glides to the bottom of the hero and grows big
     4 · the tagline types in, then the rest of the page fades in
     Click, scroll or press any key to skip.
     ------------------------------------------------------------------ */
  const nameRun = document.querySelector('.name-run');
  if (nameRun) {
    const ival = nameRun.querySelector('.ival');
    const stem = nameRun.querySelector('.stem');
    const tittle = nameRun.querySelector('.tittle');   // a second, real "i", clipped so only its dot shows (the stem is clipped to the rest)
    const marker = nameRun.querySelector('.bl');       // zero-size box that sits exactly on the baseline
    const letters = Array.from(nameRun.querySelectorAll('.ch'));
    const finals = letters.map(el => el.textContent);
    const tagBox = document.querySelector('.hero-tag');
    const tagText = tagBox && tagBox.querySelector('.tag-anim');
    // Poppins 600 "i", in em above the baseline: dot centre (cx, cy), dot size d, dot bottom db, stem top st
    const POPPINS = { cx: 0.14, cy: 0.7025, d: 0.17, db: 0.618, st: 0.555 };
    const DOT = Object.assign({}, POPPINS);
    let base = 0.81;                                     // em from the top of the "i" box down to the baseline

    // Tagline → words → letters (words never break in the middle)
    if (tagText) {
      const words = tagText.textContent.trim().split(/\s+/);
      tagText.textContent = '';
      words.forEach((word, wi) => {
        const w = document.createElement('span');
        w.className = 'tw';
        for (const ch of word) {
          const c = document.createElement('span');
          c.className = 'tc';
          c.textContent = ch;
          w.appendChild(c);
        }
        tagText.appendChild(w);
        if (wi < words.length - 1) tagText.appendChild(document.createTextNode(' '));
      });
      tagBox.classList.add('split');
    }

    const poppinsLoaded = () => {
      try {
        for (const f of document.fonts) {
          if (/poppins/i.test(f.family) && String(f.weight) === '600' && f.style === 'normal' && f.status === 'loaded') return true;
        }
      } catch (e) { /* FontFaceSet not iterable */ }
      return false;
    };
    // Only needed while a fallback font is showing: draw "i" and dotless "ı", diff the pixels
    const measureDot = () => {
      try {
        const S = 200, W = 260, H = 300, bl = 230, x0 = 40;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.font = `600 ${S}px ${getComputedStyle(nameRun).fontFamily}`;
        const scan = ch => { ctx.clearRect(0, 0, W, H); ctx.fillText(ch, x0, bl); return ctx.getImageData(0, 0, W, H).data; };
        const withDot = scan('i');
        const dotless = scan('ı');
        let x1 = W, y1 = H, x2 = -1, y2 = -1, top = H;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const k = (y * W + x) * 4 + 3;
            if (dotless[k] > 127 && y < top) top = y;
            if (withDot[k] > 127 && dotless[k] < 20) {
              if (x < x1) x1 = x;
              if (x > x2) x2 = x;
              if (y < y1) y1 = y;
              if (y > y2) y2 = y;
            }
          }
        }
        const d = (x2 - x1 + 1) / S;
        if (x2 < 0 || top >= H || d < 0.06 || d > 0.4) return null;
        const db = (bl - (y2 + 1)) / S, st = (bl - top) / S;
        if (db <= st) return null;
        return { cx: ((x1 + x2 + 1) / 2 - x0) / S, cy: (bl - (y1 + y2 + 1) / 2) / S, d, db, st };
      } catch (e) { return null; }
    };

    // Size of 1em on screen (the name is scaled while the intro plays)
    const emPx = () => {
      const fs = parseFloat(getComputedStyle(nameRun).fontSize);
      return fs * ((nameRun.getBoundingClientRect().width / nameRun.offsetWidth) || 1);
    };
    // The second "i" sits exactly over the stem; clip it between its dot and the top of the stem
    const placeTittle = () => {
      const b = (marker.getBoundingClientRect().top - ival.getBoundingClientRect().top) / emPx();
      if (b > 0.2 && b < 2) base = b;
      ival.style.setProperty('--cut', (base - (DOT.db + DOT.st) / 2).toFixed(4) + 'em');
      tittle.style.transformOrigin = `${DOT.cx}em ${(base - DOT.db).toFixed(4)}em`;   // squash from the dot's underside
      stem.style.transformOrigin = `50% ${base.toFixed(4)}em`;
    };
    const refreshDot = () => {
      Object.assign(DOT, (!poppinsLoaded() && measureDot()) || POPPINS);
      placeTittle();
    };
    // Where the dot of the "i" is on screen right now (the portrait dots stream out of it)
    window.AH_DOT_AT = () => {
      refreshDot();
      const em = emPx();
      return {
        x: ival.getBoundingClientRect().left + DOT.cx * em,
        y: marker.getBoundingClientRect().top - DOT.cy * em
      };
    };
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(refreshDot).catch(() => {});
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refreshDot);
    }
    let dotTimer = 0;
    addEventListener('resize', () => { clearTimeout(dotTimer); dotTimer = setTimeout(refreshDot, 120); });

    // Word board: before the name, the board flips through these words, each one a quick
    // left-to-right ripple of calendar-page flips, with the dropped full stop as its full stop
    const WORDS = ['Pakistan', 'NUST', 'COMSATS'];
    const layers = [];
    const makeLayer = word => {
      const layer = document.createElement('span');
      layer.className = 'flap-word';
      for (const ch of word) {
        const c = document.createElement('span');
        c.className = 'fl';
        c.textContent = ch;
        layer.appendChild(c);
      }
      const stop = document.createElement('span');
      stop.className = 'fl-stop';                       // room for the full stop after the word
      layer.appendChild(stop);
      nameRun.appendChild(layer);
      layers.push(layer);
      return layer;
    };
    const clearBoard = () => { layers.forEach(l => l.remove()); layers.length = 0; };

    const running = [];
    const timers = [];
    const listeners = 'AbortController' in window ? new AbortController() : null;
    let finished = false;
    // Tells the dot portrait (below) that the name has settled and it may assemble
    const heroReady = () => {
      if (window.AH_HERO_READY) return;
      window.AH_HERO_READY = true;
      document.dispatchEvent(new Event('ah:hero-ready'));
    };
    // Once the full stop has been lifted into place, join the two halves back into one letter.
    // Both halves were the real "i" all along, so this is pixel-for-pixel invisible.
    const settleI = () => {
      ival.classList.remove('split');
      tittle.style.visibility = 'hidden';
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      running.forEach(a => { try { a.cancel(); } catch (e) { /* already gone */ } });
      nameRun.style.transform = '';
      clearBoard();
      settleI();
      root.classList.remove('intro-on');
      if (listeners) listeners.abort();
      heroReady();
    };
    const play = (el, keyframes, options) => {
      const a = el.animate(keyframes, Object.assign({ fill: 'both' }, options));
      running.push(a);
      return a;
    };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const fontsReady = Promise.race([
      document.fonts && document.fonts.load
        ? document.fonts.load('600 100px Poppins', 'Aliı Hamza').then(() => document.fonts.ready)
        : Promise.resolve(),
      sleep(3000)
    ]).catch(() => {});

    fontsReady.then(async () => {
      refreshDot();

      if (!root.classList.contains('intro-on')) { settleI(); heroReady(); return; }
      if (window.scrollY > 40 || typeof nameRun.animate !== 'function') { finish(); return; }

      const skip = () => finish();
      ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(type =>
        addEventListener(type, skip, listeners ? { passive: true, signal: listeners.signal } : { passive: true, once: true }));
      // Scrolling by any means (scrollbar, keyboard, restore) also skips to the finished page
      addEventListener('scroll', () => { if (window.scrollY > 40) finish(); },
        listeners ? { passive: true, signal: listeners.signal } : { passive: true });
      later(finish, 11000);   // safety net

      try {
        const fs = parseFloat(getComputedStyle(nameRun).fontSize);
        const r = nameRun.getBoundingClientRect();
        const s = Math.min(0.85, Math.min(innerWidth * 0.62, 640) / r.width);
        const dx = innerWidth / 2 - (r.left + r.width / 2);
        const dy = innerHeight / 2 - (r.top + r.height / 2);
        const start = `translate(${dx}px, ${dy}px) scale(${s})`;
        ival.classList.add('split');       // intro: the stem half of the "i" + its dot half as the full stop
        tittle.style.visibility = 'visible';
        nameRun.style.transformOrigin = '50% 50%';
        nameRun.style.transform = start;
        placeTittle();

        // Where each word's full stop goes, as a sideways offset of the dot (in the name's own px)
        const scale = emPx() / fs;
        const home = ival.getBoundingClientRect().left + DOT.cx * emPx();
        const stops = WORDS.map(word => {
          const box = makeLayer(word).querySelector('.fl-stop').getBoundingClientRect();
          return (box.left + box.width / 2 - home) / scale;
        });

        const rest = DOT.db;                      // em: lowers the dot onto the baseline, like a full stop
        const drop = (innerHeight * 0.8) / s;     // px above the baseline where the dot starts
        const pos = (x, lift = 0, sx = 1, sy = 1) => `translate(${x}px, calc(${rest}em - ${lift}px)) scale(${sx}, ${sy})`;
        const EASE_IN = 'cubic-bezier(.55,0,1,.45)';
        const EASE_OUT = 'cubic-bezier(0,.55,.45,1)';
        const SMOOTH = 'cubic-bezier(.65,0,.35,1)';
        const SOFT = 'cubic-bezier(.22,1,.36,1)';
        const FLIP = 'cubic-bezier(.2,.7,.3,1)';
        const T_WORD = [1300, 2150, 2900];        // Pakistan, NUST, COMSATS flip in
        const T_NAME = 3700;                      // Ali Hamza flips in
        const STAGGER = 24;                       // ms between neighbouring letters as a word flips in
        const OUT_LEAD = 240;                     // a word flips away this long before the next arrives
        const flipIn = (el, delay) => play(el, [
          { opacity: 0, transform: 'perspective(10em) rotateX(-90deg)' },
          { opacity: 1, transform: 'perspective(10em) rotateX(10deg)', offset: 0.7 },
          { opacity: 1, transform: 'perspective(10em) rotateX(0deg)' }
        ], { duration: 260, delay, easing: FLIP });
        const flipOut = (el, delay) => play(el, [
          { opacity: 1, transform: 'perspective(10em) rotateX(0deg)' },
          { opacity: 0, transform: 'perspective(10em) rotateX(90deg)' }
        ], { duration: 200, delay, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
        const hop = (from, to, delay) => play(tittle, [
          { opacity: 1, transform: pos(from) },
          { opacity: 1, transform: pos((from + to) / 2, fs * 0.22 + Math.abs(to - from) * 0.16), offset: 0.45 },
          { opacity: 1, transform: pos(to, 0, 1.18, 0.82), offset: 0.82 },
          { opacity: 1, transform: pos(to) }
        ], { duration: 420, delay, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });

        // 1 · the full stop drops and bounces where "Pakistan." will end
        const x0 = stops[0];
        play(tittle, [
          { opacity: 1, transform: pos(x0, drop), easing: EASE_IN },
          { opacity: 1, transform: pos(x0, 0, 1.28, 0.74), offset: 0.48, easing: EASE_OUT },
          { opacity: 1, transform: pos(x0, fs * 0.42), offset: 0.68, easing: EASE_IN },
          { opacity: 1, transform: pos(x0, 0, 1.1, 0.9), offset: 0.84, easing: EASE_OUT },
          { opacity: 1, transform: pos(x0, fs * 0.1), offset: 0.93, easing: EASE_IN },
          { opacity: 1, transform: pos(x0) }
        ], { duration: 1200, delay: 300 });

        // 2 · Pakistan → NUST → COMSATS: each word flips in, then flips away as the next arrives;
        //     the full stop hops to the end of each new word
        layers.forEach((layer, k) => {
          const next = k + 1 < layers.length ? T_WORD[k + 1] : T_NAME;
          Array.from(layer.querySelectorAll('.fl')).forEach((el, i) => {
            flipIn(el, T_WORD[k] + i * STAGGER);
            flipOut(el, next - OUT_LEAD + i * 10);
          });
          if (k > 0) hop(stops[k - 1], stops[k], T_WORD[k] + 60);
        });

        // 3 · Ali Hamza flips in; the full stop hops onto the "i" and its stem lifts it into the dot
        const before = letters.filter(el => el.compareDocumentPosition(ival) & Node.DOCUMENT_POSITION_FOLLOWING).length;
        letters.forEach((el, i) => {
          if (finals[i].trim()) flipIn(el, T_NAME + (i + (i >= before ? 1 : 0)) * STAGGER);
        });
        hop(stops[stops.length - 1], 0, T_NAME + 60);
        const T_LIFT = T_NAME + 500;
        play(stem, [{ opacity: 1, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }],
          { duration: 500, delay: T_LIFT, easing: SMOOTH });
        play(tittle, [{ opacity: 1, transform: pos(0) }, { opacity: 1, transform: 'translate(0px, 0px) scale(1, 1)' }],
          { duration: 500, delay: T_LIFT, easing: SMOOTH, fill: 'forwards' })
          .finished.then(() => { settleI(); clearBoard(); }).catch(() => {});

        // 4 · the name glides to the bottom of the hero and grows
        const T_MOVE = T_LIFT + 540;
        play(nameRun, [{ transform: start }, { transform: 'none' }],
          { duration: 1150, delay: T_MOVE, easing: 'cubic-bezier(.76,0,.24,1)' });

        // 5 · tagline, then the rest of the page
        Array.from(document.querySelectorAll('.hero-tag .tc')).forEach((el, i) => play(el, [
          { opacity: 0, transform: 'translateY(.45em)' },
          { opacity: 1, transform: 'none' }
        ], { duration: 520, delay: T_MOVE + 780 + i * 24, easing: SOFT }));

        await sleep(T_MOVE + 1150);
        if (!finished) { root.classList.remove('intro-on'); heroReady(); }
        await sleep(1500);
        finish();
      } catch (e) {
        finish();
      }
    });
  }

  /* ------------------------------------------------------------------
     Hero portrait: once the name has settled, thousands of tiny dots
     stream out of the dot of the "i" and assemble Ali's photo.
     · two looks, switched from the palette dock: the photo's own colours
       (data.rgb), or black and white (the grey --dots stops)
     · edge dots shrink with their coverage, so the silhouette stays crisp
     · once assembled, the portrait stays perfectly still (no hover effect)
     · the data file loads on its own (async), so it never holds up the intro
     ------------------------------------------------------------------ */
  const hero = document.querySelector('.hero');
  const portraitBox = document.querySelector('.hero-portrait');
  const hdPhoto = portraitBox && portraitBox.querySelector('.portrait-hd');
  const showHD = () => {
    if (!hdPhoto || !hero) return;
    const go = () => setTimeout(() => hero.classList.add('hd'), 150);
    if (hdPhoto.complete && hdPhoto.naturalWidth) go();
    else hdPhoto.addEventListener('load', go, { once: true });
  };
  if (hdPhoto) hdPhoto.classList.toggle('bw', portraitLook === 'bw');
  const initPortrait = PD => {
    if (!PD || !PD.data || initPortrait.done) return;
    initPortrait.done = true;
    const canvas = document.createElement('canvas');
    canvas.className = 'dots';
    canvas.setAttribute('aria-hidden', 'true');
    hero.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const CH = PD.channels || 1;
    const raw = atob(PD.data);
    const rgb = PD.rgb ? atob(PD.rgb) : '';
    const cells = [];
    for (let i = 0, k = 0; i < PD.cols * PD.rows; i++) {
      const v = raw.charCodeAt(i * CH);
      if (!v) continue;
      cells.push({
        c: i % PD.cols, r: Math.floor(i / PD.cols), t: (v - 1) / 254,
        cov: CH > 1 ? raw.charCodeAt(i * CH + 1) / 255 : 1,
        R: rgb.charCodeAt(k * 3), G: rgb.charCodeAt(k * 3 + 1), B: rgb.charCodeAt(k * 3 + 2)
      });
      k++;
    }
    const hasColour = rgb.length === cells.length * 3;

    const SHADES = 48;
    let W = 0, H = 0, dpr = 1, gap = 4, stride = 1;
    let parts = [], groups = [], shades = [];
    let state = 'idle';                       // idle → flying → settled
    let flyStart = 0, raf = 0, heroVisible = true;

    // Black and white: the grey colour stops → SHADES fill colours (dark photo tones → first stop)
    const toRGB = c => {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = c;
      const m = /^#([0-9a-f]{6})$/i.exec(ctx.fillStyle);
      if (!m) return [255, 255, 255];
      const n = parseInt(m[1], 16);
      return [n >> 16, (n >> 8) & 255, n & 255];
    };
    const readShades = () => {
      const cs = getComputedStyle(root);
      let stops = (cs.getPropertyValue('--dots') || '').split(',')
        .map(s => s.trim().split(/\s+/))
        .filter(s => s.length === 2 && !isNaN(parseFloat(s[1])))
        .map(([col, pos]) => [toRGB(col), parseFloat(pos)]);
      if (stops.length < 2) stops = [[[14, 14, 14], 0], [[245, 245, 245], 1]];
      shades = [];
      for (let b = 0; b < SHADES; b++) {
        const t = b / (SHADES - 1);
        let i = 0;
        while (i < stops.length - 2 && t > stops[i + 1][1]) i++;
        const [A, pa] = stops[i], [B, pb] = stops[i + 1];
        const u = Math.min(1, Math.max(0, (t - pa) / ((pb - pa) || 1)));
        shades.push(`rgb(${A.map((v, j) => Math.round(v + (B[j] - v) * u)).join(',')})`);
      }
    };

    // Dots that share a fill colour are drawn together (one fillStyle per group per frame).
    // Photo colours are grouped at 5 bits per channel: at most 4/255 away from the photo.
    const regroup = () => {
      const colour = portraitLook === 'colour' && hasColour;
      const map = new Map();
      for (const p of parts) {
        const key = colour ? ((p.R >> 3) << 10) | ((p.G >> 3) << 5) | (p.B >> 3) : Math.round(p.t * (SHADES - 1));
        let g = map.get(key);
        if (!g) { g = { fill: '', list: [] }; map.set(key, g); }
        g.list.push(p);
      }
      groups = [];
      map.forEach((g, key) => {
        g.fill = colour
          ? `rgb(${((key >> 10) & 31) * 8 + 4},${((key >> 5) & 31) * 8 + 4},${(key & 31) * 8 + 4})`
          : shades[key];
        groups.push(g);
      });
    };

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth;
      H = hero.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const hr = hero.getBoundingClientRect();
      const br = portraitBox.getBoundingClientRect();
      gap = Math.min(br.width / PD.cols, br.height / PD.rows);
      const nextStride = gap < 1.3 ? 2 : 1;
      if (nextStride !== stride || !parts.length) {
        stride = nextStride;
        parts = (stride === 1 ? cells : cells.filter(q => q.c % 2 === 0 && q.r % 2 === 0)).map(q => Object.assign({}, q));
        regroup();
      }
      const ox = br.left - hr.left + (br.width - gap * PD.cols) / 2;
      const oy = br.top - hr.top + (br.height - gap * PD.rows);
      parts.forEach(p => {
        p.tx = ox + (p.c + 0.5) * gap;
        p.ty = oy + (p.r + 0.5) * gap;
        p.s = gap * stride * 0.84 * Math.min(1, Math.sqrt(p.cov * 1.15));   // edge dots shrink with coverage
      });
    };

    const frame = now => {
      raf = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const elapsed = now - flyStart;
      let moving = false;
      for (const g of groups) {
        ctx.fillStyle = g.fill;
        for (const p of g.list) {
          let x = p.tx, y = p.ty, s = p.s;
          if (state === 'flying') {
            let k = (elapsed - p.delay) / p.dur;
            if (k < 0) { moving = true; continue; }
            if (k < 1) {
              moving = true;
              k = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
              const u = 1 - k;
              x = u * u * p.sx + 2 * u * k * p.cx + k * k * p.tx;
              y = u * u * p.sy + 2 * u * k * p.cy + k * k * p.ty;
              s = p.s * (0.5 + 0.5 * k);
            }
          }
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
      if (state === 'flying' && !moving) { state = 'settled'; showHD(); }
      // Animate only while the dots are flying in; once settled the picture is drawn once and left alone
      if (heroVisible && state === 'flying') raf = requestAnimationFrame(frame);
    };
    const loop = () => { if (!raf && state !== 'idle') raf = requestAnimationFrame(frame); };

    const launch = () => {
      const hr = hero.getBoundingClientRect();
      let sx = W * 0.25, sy = H * 0.7;
      const dot = typeof window.AH_DOT_AT === 'function' ? window.AH_DOT_AT() : null;   // the dot of the "i"
      if (dot && isFinite(dot.x) && isFinite(dot.y)) {
        sx = dot.x - hr.left;
        sy = dot.y - hr.top;
      }
      parts.forEach(p => {
        p.sx = sx + (Math.random() - 0.5) * 8;
        p.sy = sy + (Math.random() - 0.5) * 8;
        const dx = p.tx - p.sx, dy = p.ty - p.sy, len = Math.hypot(dx, dy) || 1;
        const bend = (Math.random() - 0.5) * len * 0.55;
        p.cx = (p.sx + p.tx) / 2 - (dy / len) * bend;
        p.cy = (p.sy + p.ty) / 2 + (dx / len) * bend;
        p.delay = (p.r / PD.rows) * 900 + Math.random() * 700;   // head first, then shoulders
        p.dur = 1100 + Math.random() * 700;
      });
      state = 'flying';
      flyStart = performance.now();
      loop();
    };

    const start = () => {
      readShades();
      layout();
      if (reduceMotion) { state = 'settled'; loop(); showHD(); return; }
      launch();
    };
    if (window.AH_HERO_READY) start();
    else document.addEventListener('ah:hero-ready', start, { once: true });

    // Switching the look (dock button / "P"): recolour in place with a soft fade
    applyPortraitLook = () => {
      if (hdPhoto) hdPhoto.classList.toggle('bw', portraitLook === 'bw');
      if (state === 'idle') return;
      regroup();
      loop();
      if (!reduceMotion && canvas.animate) canvas.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 600, easing: 'ease-out' });
    };
    // Re-read the greys on palette change, re-layout on resize, pause when off screen
    new MutationObserver(() => { readShades(); regroup(); loop(); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (state !== 'idle') { layout(); loop(); } }, 150);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; if (heroVisible) loop(); }).observe(hero);
    }
  };
  if (hero && portraitBox) {
    if (window.AH_PORTRAIT) initPortrait(window.AH_PORTRAIT);
    else document.addEventListener('ah:portrait-data', () => initPortrait(window.AH_PORTRAIT), { once: true });
    // If the dot data never arrives, still show the HD photo a little after the name has settled
    const fallbackHD = () => setTimeout(() => { if (!initPortrait.done) showHD(); }, 4000);
    if (window.AH_HERO_READY) fallbackHD(); else document.addEventListener('ah:hero-ready', fallbackHD, { once: true });
  }

  /* ------------------------------------------------------------------
     Research-interest ladder (hero): a rail with one rung per interest.
     It builds rung by rung from the bottom, then a marker climbs it,
     lighting one interest at a time. Hover a rung to hold it.
     ------------------------------------------------------------------ */
  const ladder = document.querySelector('.ladder');
  if (ladder) {
    const rungs = Array.from(ladder.querySelectorAll('.rung'));
    const mark = document.createElement('span');
    mark.className = 'ladder-mark';
    mark.setAttribute('aria-hidden', 'true');
    ladder.appendChild(mark);
    let active = rungs.length - 1, held = false;
    const setActive = i => {
      active = i;
      rungs.forEach((r, k) => r.classList.toggle('on', k === i));
      mark.style.transform = `translateY(${rungs[i].offsetTop}px)`;
      mark.style.height = rungs[i].offsetHeight + 'px';
    };
    const climb = () => {
      if (held || document.hidden || !ladder.offsetParent) return;
      setActive((active - 1 + rungs.length) % rungs.length);   // one rung up; from the top, back to the foot
    };
    const build = () => {
      rungs.forEach((r, i) => r.style.setProperty('--rd', ((rungs.length - 1 - i) * 0.14 + 0.35).toFixed(2) + 's'));
      ladder.classList.add('built');
      if (reduceMotion) { ladder.classList.add('still'); return; }
      setTimeout(() => {
        setActive(rungs.length - 1);
        ladder.classList.add('ready');
        setInterval(climb, 2600);
      }, 1500);
    };
    rungs.forEach((r, i) => {
      r.addEventListener('pointerenter', () => { if (!ladder.classList.contains('ready')) return; held = true; setActive(i); });
      r.addEventListener('pointerleave', () => { held = false; });
    });
    addEventListener('resize', () => { if (ladder.classList.contains('ready')) setActive(active); });
    if (window.AH_HERO_READY) build();
    else document.addEventListener('ah:hero-ready', build, { once: true });
  }

  /* ------------------------------------------------------------------
     Toolkit: the skills pop in (CSS, one after another as each card
     scrolls in). Hover a card and its skills lift in a quick wave.
     ------------------------------------------------------------------ */
  if (!reduceMotion && Element.prototype.animate) {
    document.querySelectorAll('#skills .card.skill').forEach(card => {
      const tags = Array.from(card.querySelectorAll('.keys li'));
      let last = 0;
      card.addEventListener('pointerenter', e => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        const now = performance.now();
        if (now - last < 650) return;
        // not while they are still popping in
        if (tags.some(li => li.getAnimations().some(a => a.playState === 'running'))) return;
        last = now;
        tags.forEach((li, i) => li.animate(
          [{ transform: 'none' }, { transform: 'translateY(-4px)', offset: .45 }, { transform: 'none' }],
          { duration: 460, delay: i * 45, easing: 'cubic-bezier(.3, .7, .3, 1)' }
        ));
      });
    });
  }

  /* ------------------------------------------------------------------
     Copy email
     ------------------------------------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(btn.dataset.copy)
        .then(() => {
          flash('<span>Email copied to clipboard</span>');
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        })
        .catch(() => { window.location.href = 'mailto:' + btn.dataset.copy; });
    });
  });

  /* ------------------------------------------------------------------ */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
