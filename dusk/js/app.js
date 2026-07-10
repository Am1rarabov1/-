/* ============================================================
   DUSK — one evening, scrolled
   The page's palette falls from golden hour to midnight while
   a fixed clock scrubs 17:42 → 23:58 with the scroll.
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* Lenis */
  let lenis = null;
  if (!reduceMotion) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.085 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); lenis.scrollTo(target); }
      });
    });
  }

  const bar = document.getElementById('bar');
  window.addEventListener('scroll', () => {
    bar.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ---------- the evening phases (scrubbed CSS variables) ---------- */
  const phases = {
    golden:   { bg: '#ecdfc3', fg: '#33251a', fgSoft: 'rgba(51,37,26,0.66)', fgFaint: 'rgba(51,37,26,0.34)', accent: '#b4763b', hairline: 'rgba(51,37,26,0.18)', ghost: 'rgba(51,37,26,0.07)' },
    blue:     { bg: '#c9c3cd', fg: '#2a2333', fgSoft: 'rgba(42,35,51,0.68)', fgFaint: 'rgba(42,35,51,0.36)', accent: '#a06a8e', hairline: 'rgba(42,35,51,0.2)', ghost: 'rgba(42,35,51,0.08)' },
    night:    { bg: '#4a3d44', fg: '#f0e4d2', fgSoft: 'rgba(240,228,210,0.7)', fgFaint: 'rgba(240,228,210,0.4)', accent: '#e5b96f', hairline: 'rgba(240,228,210,0.2)', ghost: 'rgba(240,228,210,0.06)' },
    midnight: { bg: '#16131d', fg: '#efe6d6', fgSoft: 'rgba(239,230,214,0.66)', fgFaint: 'rgba(239,230,214,0.36)', accent: '#e5b96f', hairline: 'rgba(239,230,214,0.16)', ghost: 'rgba(239,230,214,0.05)' },
  };
  const root = document.documentElement;
  function applyPhase(p) {
    root.style.setProperty('--bg', p.bg);
    root.style.setProperty('--fg', p.fg);
    root.style.setProperty('--fg-soft', p.fgSoft);
    root.style.setProperty('--fg-faint', p.fgFaint);
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--hairline', p.hairline);
    root.style.setProperty('--ghost', p.ghost);
  }
  if (!reduceMotion) {
    const order = ['golden', 'blue', 'night', 'midnight'];
    document.querySelectorAll('.chapter').forEach((ch) => {
      const phase = phases[ch.dataset.phase];
      const idx = order.indexOf(ch.dataset.phase);
      const prev = phases[order[Math.max(0, idx - 1)]];
      const state = { t: 0 };
      gsap.to(state, {
        t: 1,
        ease: 'none',
        scrollTrigger: { trigger: ch, start: 'top 85%', end: 'top 15%', scrub: 0.4 },
        onUpdate: () => {
          applyPhase({
            bg: gsap.utils.interpolate(prev.bg, phase.bg, state.t),
            fg: gsap.utils.interpolate(prev.fg, phase.fg, state.t),
            fgSoft: gsap.utils.interpolate(prev.fgSoft, phase.fgSoft, state.t),
            fgFaint: gsap.utils.interpolate(prev.fgFaint, phase.fgFaint, state.t),
            accent: gsap.utils.interpolate(prev.accent, phase.accent, state.t),
            hairline: gsap.utils.interpolate(prev.hairline, phase.hairline, state.t),
            ghost: gsap.utils.interpolate(prev.ghost, phase.ghost, state.t),
          });
        },
      });
    });
  } else {
    applyPhase(phases.night);
  }

  /* ---------- the clock rail: 17:42 → 23:58 by scroll ---------- */
  const railTime = document.getElementById('railTime');
  const railFill = document.getElementById('railFill');
  const heroClock = document.querySelector('.hero__scroll');
  const START = 17 * 60 + 42;
  const END = 23 * 60 + 58;
  function fmt(mins) {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  ScrollTrigger.create({
    onUpdate: () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      const t = START + (END - START) * p;
      railTime.textContent = fmt(t);
      railFill.style.transform = `scaleY(${p})`;
      if (heroClock && heroClock.firstChild) heroClock.firstChild.textContent = fmt(t);
    },
  });

  /* ---------- veil: the sun sets behind the word ---------- */
  const veil = document.getElementById('veil');
  if (reduceMotion) {
    veil.style.display = 'none';
  } else {
    const tl = gsap.timeline();
    tl.from('#veilSun', { y: 90, opacity: 0, duration: 1.1, ease: 'power2.out' })
      .from('.veil__word', { opacity: 0, letterSpacing: '0.7em', duration: 1, ease: 'power2.out' }, '-=0.7')
      .to('#veilSun', { y: 140, opacity: 0, duration: 0.9, ease: 'power2.in', delay: 0.3 })
      .to(veil, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.35')
      .set(veil, { display: 'none' });

    /* hero entrance */
    const heroSplit = new SplitText('.hero__title', { type: 'words', wordsClass: 'w' });
    heroSplit.words.forEach((w) => {
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      while (w.firstChild) inner.appendChild(w.firstChild);
      w.appendChild(inner);
    });
    tl.from('.hero__title .w > span', { yPercent: 105, duration: 1.25, stagger: 0.1, ease: 'power4.out' }, '-=0.5')
      .from('.hero__eyebrow, .hero__line', { opacity: 0, y: 14, duration: 1, stagger: 0.15, clearProps: 'all' }, '-=0.85')
      .from('.hero__foot, .bar, .rail', { opacity: 0, duration: 0.9, clearProps: 'opacity' }, '-=0.6');

    gsap.to('.hero__video', { scale: 1, duration: 6.5, ease: 'power1.out' });
    gsap.to('.hero__content', {
      y: -70, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  if (reduceMotion) return;

  /* ---------- chapters: ghost numerals drift, images unclip + parallax ---------- */
  document.querySelectorAll('.chapter').forEach((ch, i) => {
    const ghost = ch.querySelector('.chapter__ghost');
    gsap.fromTo(ghost, { xPercent: i % 2 ? -62 : -38 }, {
      xPercent: i % 2 ? -38 : -62,
      ease: 'none',
      scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    const media = ch.querySelector('.chapter__media');
    gsap.fromTo(media, { clipPath: 'inset(6% 8% 6% 8%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: ch, start: 'top 80%', end: 'center center', scrub: 0.5 },
    });
    gsap.fromTo(media.querySelector('img'), { yPercent: -6, scale: 1.12 }, {
      yPercent: 6, scale: 1.04,
      ease: 'none',
      scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    gsap.from(ch.querySelectorAll('.chapter__time, .chapter__title, .chapter__body, .chapter__spec'), {
      y: 38, opacity: 0, duration: 1, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: ch, start: 'top 62%', once: true },
    });
  });

  /* ---------- close: stars twinkle in, image parallax ---------- */
  const stars = document.getElementById('stars');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.setProperty('--tw', (2 + Math.random() * 4).toFixed(2) + 's');
    s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
    stars.appendChild(s);
  }
  gsap.from(stars, {
    opacity: 0, duration: 2,
    scrollTrigger: { trigger: '.close', start: 'top 60%', once: true },
  });
  gsap.fromTo('.close__media img', { yPercent: -6 }, {
    yPercent: 6, ease: 'none',
    scrollTrigger: { trigger: '.close__media', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.utils.toArray('.close__kicker, .close__title, .close__link, .close__note').forEach((el) => {
    gsap.from(el, {
      y: 36, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* late media (video metadata, images) shifts layout — recompute triggers */
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
