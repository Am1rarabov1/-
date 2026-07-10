/* ============================================================
   MAISON — a house tour at dusk
   Double-door veil, pinned mask-wipe tour, drifting details,
   parallax numerals, arch morph.
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* Lenis bridged into GSAP */
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

  /* bar state + progress hairline */
  const bar = document.getElementById('bar');
  const progressFill = document.getElementById('progressFill');
  window.addEventListener('scroll', () => {
    bar.classList.toggle('is-scrolled', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    progressFill.style.transform = `scaleX(${Math.min(1, window.scrollY / max)})`;
  }, { passive: true });

  /* ---------- veil: doors part ---------- */
  const veil = document.getElementById('veil');
  if (reduceMotion) {
    veil.style.display = 'none';
  } else {
    const tl = gsap.timeline();
    tl.from('#veilRule', { scaleY: 0, duration: 0.7, ease: 'power2.out' })
      .from('.veil__word', { opacity: 0, letterSpacing: '0.9em', duration: 1, ease: 'power2.out' }, '-=0.3')
      .from('.veil__sub', { opacity: 0, y: 10, duration: 0.6 }, '-=0.5')
      .to('.veil__center', { opacity: 0, duration: 0.45, delay: 0.35 })
      .to('.veil__panel--l', { xPercent: -101, duration: 1.15, ease: 'power4.inOut' }, '<')
      .to('.veil__panel--r', { xPercent: 101, duration: 1.15, ease: 'power4.inOut' }, '<')
      .set(veil, { display: 'none' })
      .from('.hero__title span', { yPercent: 46, opacity: 0, duration: 1.3, stagger: 0.06, ease: 'power3.out', clearProps: 'all' }, '-=0.8')
      .from('.hero__eyebrow, .hero__line', { opacity: 0, y: 14, duration: 1, stagger: 0.15, clearProps: 'all' }, '-=0.9')
      .from('.hero__foot, .bar', { opacity: 0, duration: 0.9, clearProps: 'opacity' }, '-=0.6');

    gsap.to('.hero__video', { scale: 1, duration: 6.5, ease: 'power1.out' });
    gsap.to('.hero__content', {
      y: -70, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  if (reduceMotion) return;

  /* ---------- intent: brass rule draws, lines rise ---------- */
  gsap.from('#intentRule', {
    scaleY: 0, duration: 1, ease: 'power2.out',
    scrollTrigger: { trigger: '.intent', start: 'top 74%', once: true },
  });
  const intentSplit = new SplitText('#intentText', { type: 'lines', linesClass: 'ln' });
  intentSplit.lines.forEach((line) => {
    const inner = document.createElement('div');
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
  });
  gsap.from('#intentText .ln > div', {
    yPercent: 105,
    duration: 1.1,
    stagger: 0.09,
    ease: 'power4.out',
    scrollTrigger: { trigger: '#intentText', start: 'top 78%', once: true },
  });

  /* ---------- THE TOUR: pinned mask-wipe sequence ---------- */
  const rooms = [
    { count: 'i.', name: 'The Corridor', desc: 'Light greets you four steps before you arrive and dims four steps after you pass. The house walks with you.', spec: 'Presence sensing · Tunable pools · Silent drivers' },
    { count: 'ii.', name: 'The Library', desc: 'One button labeled nothing. The lamp knows evening from midnight, the speakers know Chopin from conversation.', spec: 'Reading scenes · Invisible audio · Shade choreography' },
    { count: 'iii.', name: 'The Bath', desc: 'Stone warmed before you wake, light the color of candles, and something quiet playing from nowhere at all.', spec: 'Radiant scenes · Steam-proof sound · Dawn simulation' },
    { count: 'iv.', name: 'The Dining Room', desc: 'The pendant falls half a step as plates land and the playlist leans closer. Dinner, conducted.', spec: 'Scene-linked dimming · Zoned audio · One brass keypad' },
  ];
  const panel = {
    count: document.getElementById('tourCount'),
    name: document.getElementById('tourName'),
    desc: document.getElementById('tourDesc'),
    spec: document.getElementById('tourSpec'),
  };
  const dots = document.querySelectorAll('.tour__dot');
  let currentRoom = 0;
  function setRoom(i) {
    if (i === currentRoom) return;
    currentRoom = i;
    const r = rooms[i];
    gsap.timeline()
      .to('.tour__panel', { y: 14, opacity: 0, duration: 0.28, ease: 'power2.in' })
      .add(() => {
        panel.count.textContent = r.count;
        panel.name.textContent = r.name;
        panel.desc.textContent = r.desc;
        panel.spec.textContent = r.spec;
        dots.forEach((d, di) => d.classList.toggle('is-on', di === i));
      })
      .to('.tour__panel', { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
  }

  const roomEls = gsap.utils.toArray('.tour__room');
  gsap.set(roomEls, { visibility: 'visible' });
  const tourTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#tour',
      start: 'top top',
      end: '+=340%',
      pin: '#tourPin',
      scrub: 0.7,
      onUpdate: (self) => {
        const idx = Math.min(3, Math.floor(self.progress * 3.999));
        setRoom(idx);
      },
    },
  });
  // continuous slow zoom on every visible room image
  roomEls.forEach((room) => {
    gsap.fromTo(room.querySelector('img'), { scale: 1.12 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '#tour', start: 'top top', end: '+=340%', scrub: true },
    });
  });
  // wipe 1: circle iris opens onto the library
  tourTl.fromTo('.tour__room--circle',
    { clipPath: 'circle(0% at 50% 55%)' },
    { clipPath: 'circle(75% at 50% 55%)', duration: 1, ease: 'power2.inOut' }, 0.35);
  // wipe 2: vertical blind sweeps in the bath
  tourTl.fromTo('.tour__room--blinds',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power3.inOut' }, 1.55);
  // wipe 3: arch rises onto the dining room, then widens
  tourTl.fromTo('.tour__room--arch',
    { clipPath: 'inset(100% 12% 0 12% round 45vw 45vw 0 0)' },
    { clipPath: 'inset(0% 12% 0 12% round 45vw 45vw 0 0)', duration: 0.85, ease: 'power2.inOut' }, 2.75);
  tourTl.to('.tour__room--arch',
    { clipPath: 'inset(0% 0% 0 0% round 0vw 0vw 0 0)', duration: 0.35, ease: 'power2.out' }, 3.6);

  /* ---------- details: drift marquee + parallax cards ---------- */
  const drift = gsap.to('#driftTrack', { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => {
      gsap.to(drift, { timeScale: gsap.utils.clamp(0.5, 3, Math.abs(self.getVelocity() / 300)), duration: 0.4, overwrite: true });
    },
  });
  gsap.utils.toArray('.detail').forEach((card) => {
    const speed = parseFloat(card.dataset.speed || 1);
    gsap.fromTo(card, { y: 0 }, {
      y: () => (1 - speed) * 260,
      ease: 'none',
      scrollTrigger: { trigger: '.details__grid', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from(card, {
      y: 60, opacity: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
    });
  });

  /* ---------- measure: counters + drifting numerals ---------- */
  document.querySelectorAll('.mrow__num').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(obj, {
        v: end, duration: 1.9, ease: 'power3.out',
        onUpdate: () => { el.textContent = Math.round(obj.v); },
      }),
    });
    gsap.fromTo(el, { x: 0 }, {
      x: 40, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  gsap.from('.measure__title', {
    y: 40, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.measure', start: 'top 78%', once: true },
  });

  /* ---------- commission: arch morph + inner parallax ---------- */
  const arch = document.getElementById('commissionArch');
  gsap.fromTo(arch, { borderRadius: '2px 2px 2px 2px' }, {
    borderRadius: '45vw 45vw 2px 2px',
    ease: 'none',
    scrollTrigger: { trigger: '.commission', start: 'top 90%', end: 'top 30%', scrub: 0.6 },
  });
  gsap.fromTo(arch.querySelector('img'), { y: '-12%' }, {
    y: '0%', ease: 'none',
    scrollTrigger: { trigger: arch, start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.utils.toArray('.commission__kicker, .commission__title, .commission__btn, .commission__note').forEach((el) => {
    gsap.from(el, {
      y: 36, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
})();
