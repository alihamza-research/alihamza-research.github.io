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
    storm:    [['Storm Grey', '#4E545C'],    ['Matte Black', '#161616'],    ['Safety Orange', '#FF6B1A']],
    desert:   [['Desert Sand', '#E8D6B6'],   ['Olive Drab', '#4B5320'],     ['Signal Yellow', '#F6B300']],
    polar:    [['Polar White', '#F5F8FA'],   ['Glacier Blue', '#A9CDE4'],   ['Racing Red', '#D40000']],
    oat:      [['Oat Milk', '#EFE7D8'],      ['Forest Green', '#234F35'],   ['Tomato Red', '#FF6347']],
    midnight: [['Midnight Navy', '#142038'], ['Powder Blue', '#B0E0E6'],    ['Sunflower Yellow', '#FFC72C']],
    blush:    [['Blush Pink', '#F6DADA'],    ['Charcoal Ink', '#23262B'],   ['Fresh Mint', '#3DDC97']],
    ivory:    [['Antique Ivory', '#F2EBDC'], ['Piano Black', '#121212'],    ['Surf Turquoise', '#2CC5BD']],
    sapphire: [['Deep Sapphire', '#0F2A57'], ['Pearl Shell', '#F1EAE0'],    ['Ember Orange', '#FF6B2C']],
    lavender: [['Lavender Milk', '#ECE6F4'], ['Charcoal Slate', '#2F3541'], ['Mango Blaze', '#FFA62B']],
    sesame:   [['Sesame Cream', '#F0E4CC'],  ['Cognac Leather', '#8A4A24'], ['Cobalt Blue', '#2456E8']],
    graphite: [['Graphite Teal', '#1E3638'], ['Mushroom Linen', '#D6CCBF'], ['Coral', '#FF7A59']],
    gelato:   [['Gelato Cream', '#FBF3E3'],  ['Rosemary Green', '#4E6450'], ['Raspberry', '#D6336C']],
    carbon:   [['Carbon Navy', '#111B2B'],   ['Glacier Sage', '#B7CCBF'],   ['Electric Lime', '#C5F04A']]
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
    let s = v.toFixed(+el.dataset.decimals || 0);
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
     2 · "Al" types in, the stem of the "i" grows and lifts the full stop
         into place as its dot, then "Hamza" types in
     3 · the name glides to the bottom of the hero and grows big
     4 · the tagline types in, then the rest of the page fades in
     Click, scroll or press any key to skip.
     ------------------------------------------------------------------ */
  const nameRun = document.querySelector('.name-run');
  if (nameRun) {
    const ival = nameRun.querySelector('.ival');
    const stem = nameRun.querySelector('.stem');
    const tittle = nameRun.querySelector('.tittle');
    const marker = nameRun.querySelector('.bl');
    const tagBox = document.querySelector('.hero-tag');
    const tagText = tagBox && tagBox.querySelector('.tag-anim');
    const DOT = { cx: 0.14, cy: 0.7025, d: 0.17 };   // Poppins 600 "i" dot in em; refined at runtime

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

    // Measure the "i" dot of whatever font is rendering right now: draw "i" and dotless "ı", diff the pixels
    const measureDot = () => {
      try {
        const S = 200, W = 260, H = 300, base = 230, x0 = 40;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.font = `600 ${S}px ${getComputedStyle(nameRun).fontFamily}`;
        const scan = ch => { ctx.clearRect(0, 0, W, H); ctx.fillText(ch, x0, base); return ctx.getImageData(0, 0, W, H).data; };
        const withDot = scan('i');
        const dotless = scan('ı');
        let x1 = W, y1 = H, x2 = -1, y2 = -1;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const k = (y * W + x) * 4 + 3;
            if (withDot[k] > 127 && dotless[k] < 20) {
              if (x < x1) x1 = x;
              if (x > x2) x2 = x;
              if (y < y1) y1 = y;
              if (y > y2) y2 = y;
            }
          }
        }
        const d = (x2 - x1 + 1) / S;
        if (x2 < 0 || d < 0.06 || d > 0.4) return null;
        return { cx: ((x1 + x2 + 1) / 2 - x0) / S, cy: (base - (y1 + y2 + 1) / 2) / S, d };
      } catch (e) { return null; }
    };

    // Put the dot over the stem, in em so it scales with the name. Works mid-intro too (divides out the scale).
    const placeTittle = () => {
      const fs = parseFloat(getComputedStyle(nameRun).fontSize);
      const scale = (nameRun.getBoundingClientRect().width / nameRun.offsetWidth) || 1;
      const base = (marker.getBoundingClientRect().top - ival.getBoundingClientRect().top) / (fs * scale);
      tittle.style.left = (DOT.cx - DOT.d / 2) + 'em';
      tittle.style.top = (base - DOT.cy - DOT.d / 2) + 'em';
      tittle.style.width = tittle.style.height = DOT.d + 'em';
      stem.style.transformOrigin = `50% ${base}em`;
    };
    const refreshDot = () => {
      const measured = measureDot();
      if (measured) Object.assign(DOT, measured);
      placeTittle();
    };
    // Re-place the dot whenever the real font arrives (it can be late on phones) and on rotate / resize
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(refreshDot).catch(() => {});
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refreshDot);
    }
    let dotTimer = 0;
    addEventListener('resize', () => { clearTimeout(dotTimer); dotTimer = setTimeout(refreshDot, 120); });

    const running = [];
    const listeners = 'AbortController' in window ? new AbortController() : null;
    let finished = false;
    // Tells the dot portrait (below) that the name has settled and it may assemble
    const heroReady = () => {
      if (window.AH_HERO_READY) return;
      window.AH_HERO_READY = true;
      document.dispatchEvent(new Event('ah:hero-ready'));
    };
    // Once the full stop has landed, show the font's own "i": its dot is drawn by the font itself,
    // so it sits exactly right on every phone, browser and font. The separate dot stays in the
    // layout (invisible) as the launch point for the portrait dots.
    const settleI = () => {
      if (stem.textContent !== 'i') stem.textContent = 'i';
      tittle.style.visibility = 'hidden';
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      running.forEach(a => { try { a.cancel(); } catch (e) { /* already gone */ } });
      nameRun.style.transform = '';
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

    const fontsReady = Promise.race([
      document.fonts && document.fonts.load
        ? document.fonts.load('600 100px Poppins', 'Aliı Hamza').then(() => document.fonts.ready)
        : Promise.resolve(),
      sleep(1800)
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
      setTimeout(finish, 9000);   // safety net

      try {
        const fs = parseFloat(getComputedStyle(nameRun).fontSize);
        const r = nameRun.getBoundingClientRect();
        const s = Math.min(0.85, Math.min(innerWidth * 0.62, 640) / r.width);
        const dx = innerWidth / 2 - (r.left + r.width / 2);
        const dy = innerHeight / 2 - (r.top + r.height / 2);
        const start = `translate(${dx}px, ${dy}px) scale(${s})`;
        stem.textContent = 'ı';            // intro: dotless letter + the separate full stop
        tittle.style.visibility = 'visible';
        nameRun.style.transformOrigin = '50% 50%';
        nameRun.style.transform = start;
        tittle.style.transformOrigin = '50% 100%';

        const rest = DOT.cy - DOT.d / 2;          // em: lowers the dot onto the baseline, like a full stop
        const drop = (innerHeight * 0.8) / s;     // px above the baseline where the dot starts
        const at = (lift, squash = '') => `translateY(calc(${rest}em - ${lift}px))${squash}`;
        const EASE_IN = 'cubic-bezier(.55,0,1,.45)';
        const EASE_OUT = 'cubic-bezier(0,.55,.45,1)';
        const SMOOTH = 'cubic-bezier(.65,0,.35,1)';
        const SOFT = 'cubic-bezier(.22,1,.36,1)';

        // 1 · the full stop drops and bounces
        play(tittle, [
          { opacity: 1, transform: at(drop), easing: EASE_IN },
          { opacity: 1, transform: at(0, ' scale(1.28, .74)'), offset: 0.48, easing: EASE_OUT },
          { opacity: 1, transform: at(fs * 0.42), offset: 0.68, easing: EASE_IN },
          { opacity: 1, transform: at(0, ' scale(1.1, .9)'), offset: 0.84, easing: EASE_OUT },
          { opacity: 1, transform: at(fs * 0.1), offset: 0.93, easing: EASE_IN },
          { opacity: 1, transform: at(0) }
        ], { duration: 1200, delay: 300 });

        // 2 · "Al" types in, the stem lifts the full stop into the dot of the "i", then "Hamza"
        const letters = Array.from(nameRun.querySelectorAll('.ch'));
        const typeIn = (el, delay) => play(el, [
          { opacity: 0, transform: 'translateY(.3em)', filter: 'blur(8px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ], { duration: 700, delay, easing: SOFT });
        typeIn(letters[0], 1350);
        typeIn(letters[1], 1450);
        play(stem, [{ opacity: 1, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }],
          { duration: 650, delay: 1750, easing: SMOOTH });
        play(tittle, [{ opacity: 1, transform: at(0) }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 650, delay: 1750, easing: SMOOTH, fill: 'forwards' })
          .finished.then(settleI).catch(() => {});   // the moment it lands, the real "i" takes over
        letters.slice(2).forEach((el, i) => typeIn(el, 2350 + i * 90));

        // 3 · the name glides to the bottom of the hero and grows
        play(nameRun, [{ transform: start }, { transform: 'none' }],
          { duration: 1250, delay: 3450, easing: 'cubic-bezier(.76,0,.24,1)' });

        // 4 · tagline, then the rest of the page
        Array.from(document.querySelectorAll('.hero-tag .tc')).forEach((el, i) => play(el, [
          { opacity: 0, transform: 'translateY(.45em)' },
          { opacity: 1, transform: 'none' }
        ], { duration: 520, delay: 4300 + i * 24, easing: SOFT }));

        await sleep(4700);
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
     · colours come from the active palette (--dots colour stops)
     · edge dots shrink with their coverage, so the silhouette stays crisp
     · once assembled, the portrait stays perfectly still (no hover effect)
     ------------------------------------------------------------------ */
  const hero = document.querySelector('.hero');
  const portraitBox = document.querySelector('.hero-portrait');
  const PD = window.AH_PORTRAIT;
  if (hero && portraitBox && PD && PD.data) {
    const canvas = document.createElement('canvas');
    canvas.className = 'dots';
    canvas.setAttribute('aria-hidden', 'true');
    hero.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const CH = PD.channels || 1;
    const raw = atob(PD.data);
    const cells = [];
    for (let i = 0; i < PD.cols * PD.rows; i++) {
      const v = raw.charCodeAt(i * CH);
      if (!v) continue;
      cells.push({
        c: i % PD.cols, r: Math.floor(i / PD.cols), t: (v - 1) / 254,
        cov: CH > 1 ? raw.charCodeAt(i * CH + 1) / 255 : 1
      });
    }

    const SHADES = 48;
    let W = 0, H = 0, dpr = 1, gap = 4, stride = 1;
    let parts = [], buckets = [], shades = [];
    let state = 'idle';                       // idle → flying → settled
    let flyStart = 0, raf = 0, heroVisible = true;

    // Palette colour stops → SHADES fill colours (dark photo tones → first stop, light → last)
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
      if (stops.length < 2) stops = [[toRGB(cs.getPropertyValue('--c30').trim()), 0], [toRGB(cs.getPropertyValue('--head').trim()), 1]];
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
        const pick = stride === 1 ? cells : cells.filter(q => q.c % 2 === 0 && q.r % 2 === 0);
        parts = pick.map(q => ({ c: q.c, r: q.r, t: q.t, cov: q.cov }));
        buckets = Array.from({ length: SHADES }, () => []);
        parts.forEach(p => buckets[Math.round(p.t * (SHADES - 1))].push(p));
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
      for (let b = 0; b < SHADES; b++) {
        const list = buckets[b];
        if (!list.length) continue;
        ctx.fillStyle = shades[b];
        for (const p of list) {
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
      if (state === 'flying' && !moving) state = 'settled';
      // Animate only while the dots are flying in; once settled the picture is drawn once and left alone
      if (heroVisible && state === 'flying') raf = requestAnimationFrame(frame);
    };
    const loop = () => { if (!raf && state !== 'idle') raf = requestAnimationFrame(frame); };

    const launch = () => {
      const hr = hero.getBoundingClientRect();
      const dot = document.querySelector('.tittle');
      let sx = W * 0.25, sy = H * 0.7;
      if (dot) {
        const d = dot.getBoundingClientRect();
        sx = d.left - hr.left + d.width / 2;
        sy = d.top - hr.top + d.height / 2;
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
      if (reduceMotion) { state = 'settled'; loop(); return; }
      launch();
    };
    if (window.AH_HERO_READY) start();
    else document.addEventListener('ah:hero-ready', start, { once: true });

    // Re-colour on palette change, re-layout on resize, pause when off screen
    new MutationObserver(() => { readShades(); loop(); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (state !== 'idle') { layout(); loop(); } }, 150);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; if (heroVisible) loop(); }).observe(hero);
    }
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
