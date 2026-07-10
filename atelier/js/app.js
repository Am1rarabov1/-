/* ============================================================
   ATELIER — quiet luxury choreography
   Sticky room chapters, lighting-scene dial, soft reveals
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

  /* bar state */
  const bar = document.getElementById('bar');
  window.addEventListener('scroll', () => {
    bar.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ---------- veil intro ---------- */
  const veil = document.getElementById('veil');
  if (reduceMotion) {
    veil.style.display = 'none';
  } else {
    const tl = gsap.timeline();
    tl.from('.veil__word', { opacity: 0, letterSpacing: '1em', duration: 1.1, ease: 'power2.out' })
      .to(veil, { opacity: 0, duration: 0.8, ease: 'power2.inOut', delay: 0.2 })
      .set(veil, { display: 'none' })
      .from('.hero__title span', {
        yPercent: 40, opacity: 0, duration: 1.3, stagger: 0.06, ease: 'power3.out', clearProps: 'all',
      }, '-=0.55')
      .from('.hero__eyebrow, .hero__line', {
        opacity: 0, y: 14, duration: 1, stagger: 0.15, ease: 'power2.out', clearProps: 'all',
      }, '-=0.9')
      .from('.hero__foot, .bar', { opacity: 0, duration: 0.9, clearProps: 'all' }, '-=0.6');
  }

  /* hero video: slow settle from 1.06 scale */
  if (!reduceMotion) {
    gsap.to('.hero__video', { scale: 1, duration: 6, ease: 'power1.out' });
    gsap.to('.hero__content', {
      y: -60, opacity: 0.3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- intent: word-by-word warm-up ---------- */
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

  /* ---------- rooms: sticky media follows chapters ---------- */
  const roomImgs = document.querySelectorAll('.rooms__img');
  const counter = document.getElementById('roomsCounter');
  const numerals = ['No. 1', 'No. 2', 'No. 3', 'No. 4'];
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
    document.querySelectorAll('.chapter').forEach((ch) => {
      gsap.from(ch.children, {
        y: 34, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: ch, start: 'top 72%', once: true },
      });
    });
  }

  /* ---------- the dial: lighting scenes ---------- */
  const scenes = {
    entertain: {
      wash: 'linear-gradient(180deg, rgba(255, 214, 150, 0.0), rgba(255, 190, 120, 0.18))',
      opacity: 0.55,
      filter: 'brightness(1.14) saturate(1.08)',
      caption: '“Entertain” — sconces at 85%, warmth up, music to the terrace',
    },
    screening: {
      wash: 'linear-gradient(180deg, rgba(20, 12, 30, 0.25), rgba(30, 16, 8, 0.4))',
      opacity: 0.5,
      filter: 'brightness(1) saturate(1)',
      caption: '“Screening” — sconces at 30%, screen wash warm',
    },
    unwind: {
      wash: 'linear-gradient(180deg, rgba(120, 70, 30, 0.28), rgba(80, 40, 20, 0.45))',
      opacity: 0.65,
      filter: 'brightness(0.82) saturate(0.92) sepia(0.18)',
      caption: '“Unwind” — candle-level, shades drawn, phone silenced',
    },
    goodnight: {
      wash: 'linear-gradient(180deg, rgba(8, 8, 18, 0.55), rgba(4, 4, 10, 0.78))',
      opacity: 0.9,
      filter: 'brightness(0.55) saturate(0.7)',
      caption: '“Goodnight” — sixty-second fade, doors confirmed, house asleep',
    },
  };
  const dialImg = document.getElementById('dialImg');
  const dialWash = document.getElementById('dialWash');
  const dialCaption = document.getElementById('dialCaption');
  // initialize to screening
  applyScene('screening');
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

  /* ---------- gentle rises everywhere ---------- */
  if (!reduceMotion) {
    gsap.utils.toArray('.dial__head, .dial__stage, .rituals__title, .ritual, .rituals__aside, .enquire__kicker, .enquire__title, .enquire__link, .enquire__note').forEach((el) => {
      gsap.from(el, {
        y: 42, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      });
    });
  }
})();
