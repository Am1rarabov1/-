/* ============================================================
   SMART INSTALLERS — the real homepage, Atelier motion system
   Veil, dusk video hero, sticky project lens, platform dial,
   counters, soft reveals.
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

  /* ---------- veil ---------- */
  const veil = document.getElementById('veil');
  if (reduceMotion) {
    veil.style.display = 'none';
  } else {
    const tl = gsap.timeline();
    tl.from('.veil__word', { opacity: 0, letterSpacing: '0.7em', duration: 1.1, ease: 'power2.out' })
      .from('.veil__sub', { opacity: 0, y: 10, duration: 0.6 }, '-=0.5')
      .to(veil, { opacity: 0, duration: 0.8, ease: 'power2.inOut', delay: 0.25 })
      .set(veil, { display: 'none' })
      .from('.hero__row', { yPercent: 42, opacity: 0, duration: 1.25, stagger: 0.12, ease: 'power3.out', clearProps: 'all' }, '-=0.55')
      .from('.hero__eyebrow, .hero__sub, .hero__ctas', { opacity: 0, y: 16, duration: 1, stagger: 0.12, ease: 'power2.out', clearProps: 'all' }, '-=0.9')
      .from('.hero__foot, .bar', { opacity: 0, duration: 0.9, clearProps: 'opacity' }, '-=0.6');

    gsap.to('.hero__video', { scale: 1, duration: 6.5, ease: 'power1.out' });
    gsap.to('.hero__content', {
      y: -60, opacity: 0.3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- clients row ---------- */
  if (!reduceMotion) {
    gsap.from('#clientsRow li', {
      y: 22, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '.clients', start: 'top 82%', once: true },
    });
  }

  /* ---------- intent scrub ---------- */
  if (!reduceMotion) {
    const split = new SplitText('#intentText', { type: 'words', wordsClass: 'w' });
    gsap.fromTo(split.words,
      { opacity: 0.16 },
      {
        opacity: 1,
        stagger: 0.03,
        ease: 'none',
        scrollTrigger: { trigger: '#intentText', start: 'top 80%', end: 'bottom 48%', scrub: 0.5 },
      });
  }

  /* ---------- projects: sticky lens ---------- */
  const roomImgs = document.querySelectorAll('.rooms__img');
  const counter = document.getElementById('roomsCounter');
  const numerals = ['No. 1', 'No. 2', 'No. 3'];
  function setRoom(i) {
    roomImgs.forEach((img) => img.classList.toggle('is-active', +img.dataset.room === i));
    counter.textContent = numerals[i];
  }
  document.querySelectorAll('.chapter').forEach((ch) => {
    ScrollTrigger.create({
      trigger: ch,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: () => setRoom(+ch.dataset.room),
      onEnterBack: () => setRoom(+ch.dataset.room),
    });
  });
  if (!reduceMotion) {
    gsap.from('.rooms__head > *', {
      y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.rooms__head', start: 'top 80%', once: true },
    });
    document.querySelectorAll('.chapter').forEach((ch) => {
      gsap.from(ch.children, {
        y: 34, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: ch, start: 'top 72%', once: true },
      });
    });
  }

  /* ---------- solutions rows ---------- */
  if (!reduceMotion) {
    gsap.from('.solutions__head > *', {
      y: 34, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.solutions', start: 'top 76%', once: true },
    });
    gsap.from('.solution', {
      y: 34, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.solutions__grid', start: 'top 82%', once: true },
    });
  }

  /* ---------- details trio: three-speed parallax ---------- */
  if (!reduceMotion) {
    gsap.utils.toArray('.detail').forEach((card) => {
      const speed = parseFloat(card.dataset.speed || 1);
      gsap.fromTo(card, { y: 0 }, {
        y: () => (1 - speed) * 240,
        ease: 'none',
        scrollTrigger: { trigger: '.details__grid', start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.from(card, {
        y: 60, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      });
    });
  }

  /* ---------- the platform dial ---------- */
  const scenes = {
    arrive: {
      wash: 'linear-gradient(180deg, rgba(255, 214, 150, 0.0), rgba(255, 196, 130, 0.14))',
      opacity: 0.5,
      filter: 'brightness(1.12) saturate(1.06)',
      caption: '“Arrive” — entry unlocked, lobby warm, elevator called',
    },
    entertain: {
      wash: 'linear-gradient(180deg, rgba(255, 205, 140, 0.12), rgba(255, 185, 115, 0.22))',
      opacity: 0.6,
      filter: 'brightness(1.05) saturate(1.1)',
      caption: '“Entertain” — audio to the amenity floor, lighting at 80%',
    },
    secure: {
      wash: 'linear-gradient(180deg, rgba(30, 34, 48, 0.3), rgba(24, 26, 40, 0.42))',
      opacity: 0.6,
      filter: 'brightness(0.86) saturate(0.9)',
      caption: '“Secure” — doors confirmed, cameras recording, perimeter armed',
    },
    goodnight: {
      wash: 'linear-gradient(180deg, rgba(8, 8, 18, 0.5), rgba(4, 4, 10, 0.72))',
      opacity: 0.88,
      filter: 'brightness(0.6) saturate(0.75)',
      caption: '“Goodnight” — common areas dimmed, locks verified, house asleep',
    },
  };
  const dialImg = document.getElementById('dialImg');
  const dialWash = document.getElementById('dialWash');
  const dialCaption = document.getElementById('dialCaption');
  function applyScene(name) {
    const s = scenes[name];
    dialWash.style.background = s.wash;
    dialWash.style.opacity = s.opacity;
    dialImg.style.transition = 'filter 0.9s ease';
    dialImg.style.filter = s.filter;
    dialCaption.style.opacity = 0;
    setTimeout(() => {
      dialCaption.textContent = s.caption;
      dialCaption.style.opacity = 1;
    }, 320);
  }
  applyScene('arrive');
  document.querySelectorAll('.scene').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scene').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      applyScene(btn.dataset.scene);
    });
  });

  /* ---------- why: 500+ counter ---------- */
  const countEl = document.getElementById('whyCount');
  if (!reduceMotion) {
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: '.why__stat', start: 'top 80%', once: true,
      onEnter: () => gsap.to(obj, {
        v: parseFloat(countEl.dataset.count),
        duration: 2.2,
        ease: 'power3.out',
        onUpdate: () => { countEl.textContent = Math.round(obj.v); },
      }),
    });
  } else {
    countEl.textContent = countEl.dataset.count;
  }

  /* ---------- gentle rises ---------- */
  if (!reduceMotion) {
    gsap.utils.toArray('.dial__head, .dial__stage, .why__title, .whyrow, .why__stat, .enquire__kicker, .enquire__title, .enquire__note, .enquire__actions, .enquire__areas').forEach((el) => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 1.05, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 87%', once: true },
      });
    });
  }

  /* late media shifts layout — recompute triggers */
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
