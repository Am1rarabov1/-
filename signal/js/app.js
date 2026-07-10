/* ============================================================
   THE SIGNAL STANDARD — kinetic print
   Velocity-skewed type, self-drawing schematic, press-style reveals
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* Lenis bridged to GSAP */
  let lenis = null;
  if (!reduceMotion) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.11 });
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

  if (reduceMotion) return;

  /* ---------- masthead: letters press themselves onto the page ---------- */
  const mastWords = document.querySelectorAll('.masthead__word');
  mastWords.forEach((w) => {
    const inner = document.createElement('span');
    inner.textContent = w.textContent;
    w.textContent = '';
    w.appendChild(inner);
  });
  gsap.from('.masthead__word > span', {
    yPercent: 108,
    duration: 1.15,
    stagger: 0.09,
    ease: 'power4.out',
    delay: 0.15,
  });
  gsap.from('.masthead__meta, .masthead__nav', { opacity: 0, y: -8, duration: 0.8, delay: 0.7, clearProps: 'all' });

  /* ---------- front headline rises ---------- */
  document.querySelectorAll('.front__headline .line').forEach((line) => {
    const inner = document.createElement('span');
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
  });
  gsap.from('.front__headline .line > span', {
    yPercent: 112,
    duration: 1.2,
    stagger: 0.12,
    ease: 'power4.out',
    delay: 0.5,
  });

  /* ---------- ticker ---------- */
  const ticker = gsap.to('#tickerTrack', { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });

  /* ---------- velocity skew on big serif blocks ---------- */
  const skewTargets = gsap.utils.toArray('.section-title, .front__headline, .spec__figure, .pullquote');
  const skewSetters = skewTargets.map((el) => gsap.quickTo(el, 'skewY', { duration: 0.4, ease: 'power2.out' }));
  ScrollTrigger.create({
    onUpdate: (self) => {
      const skew = gsap.utils.clamp(-4, 4, self.getVelocity() / -420);
      skewSetters.forEach((set) => set(skew));
      gsap.to(ticker, { timeScale: gsap.utils.clamp(0.6, 4, Math.abs(self.getVelocity() / 260)), duration: 0.3, overwrite: true });
    },
  });
  // settle skew back to 0 when scrolling stops
  let skewTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(skewTimeout);
    skewTimeout = setTimeout(() => skewSetters.forEach((set) => set(0)), 120);
  }, { passive: true });

  /* ---------- schematic draws itself ---------- */
  const svgPaths = document.querySelectorAll('#houseSvg .draw');
  svgPaths.forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.to('#houseSvg .sch-house .draw', {
    strokeDashoffset: 0,
    duration: 1.4,
    stagger: 0.3,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: '#houseSvg', start: 'top 74%', once: true },
  });
  gsap.to('#houseSvg .sch-runs .draw', {
    strokeDashoffset: 0,
    duration: 1.1,
    stagger: 0.32,
    delay: 0.9,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: '#houseSvg', start: 'top 74%', once: true },
  });
  gsap.from('.sch-nodes .node, .sch-nodes text', {
    scale: 0,
    transformOrigin: 'center',
    opacity: 0,
    stagger: 0.06,
    duration: 0.5,
    delay: 2.2,
    ease: 'back.out(2)',
    scrollTrigger: { trigger: '#houseSvg', start: 'top 74%', once: true },
  });

  /* travelling pulses along two runs, once schematic is on screen */
  const runA = document.querySelectorAll('#houseSvg .sch-runs .draw')[1];
  const runB = document.querySelectorAll('#houseSvg .sch-runs .draw')[3];
  function animatePulse(dot, path, dur, delay) {
    const len = path.getTotalLength();
    const obj = { d: 0 };
    gsap.set(dot, { opacity: 1 });
    gsap.to(obj, {
      d: len,
      duration: dur,
      delay,
      repeat: -1,
      repeatDelay: 1.1,
      ease: 'power1.inOut',
      onUpdate: () => {
        const pt = path.getPointAtLength(obj.d);
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
      },
    });
  }
  ScrollTrigger.create({
    trigger: '#houseSvg',
    start: 'top 74%',
    once: true,
    onEnter: () => {
      animatePulse(document.getElementById('pulse1'), runA, 2.4, 2.6);
      animatePulse(document.getElementById('pulse2'), runB, 2.0, 3.2);
    },
  });

  /* ---------- spec counters ---------- */
  document.querySelectorAll('.spec__figure span[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const group = el.dataset.group === '1';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(obj, {
        v: end,
        duration: 2,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = group
            ? Math.round(obj.v).toLocaleString('en-US')
            : obj.v.toFixed(dec);
        },
      }),
    });
  });

  /* ---------- section titles: typeset on entry ---------- */
  gsap.utils.toArray('.section-title').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* ---------- notes: press in with tiny rotation like laid-down photos ---------- */
  gsap.utils.toArray('.note').forEach((el, i) => {
    gsap.from(el, {
      y: 48,
      rotation: i % 2 === 0 ? -1.2 : 1.2,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* ---------- listing rows slide in ---------- */
  gsap.from('.listing', {
    x: -32,
    opacity: 0,
    duration: 0.7,
    stagger: 0.07,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.index__list', start: 'top 85%', once: true },
  });

  /* ---------- coupon wobbles into place ---------- */
  gsap.from('.coupon', {
    y: 60,
    rotation: 3,
    opacity: 0,
    duration: 1,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.coupon', start: 'top 85%', once: true },
  });
})();
