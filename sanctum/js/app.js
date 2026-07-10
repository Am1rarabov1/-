/* ============================================================
   SANCTUM — the house cinema
   Title-card veil, scroll-zoom into the screen, curtain wipes,
   scrubbed end-credits roll.
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

  /* ---------- veil: title card ---------- */
  const veil = document.getElementById('veil');
  if (reduceMotion) {
    veil.style.display = 'none';
  } else {
    const tl = gsap.timeline();
    tl.from('.veil__pre', { opacity: 0, y: 8, duration: 0.7, ease: 'power2.out' })
      .from('.veil__word', { opacity: 0, letterSpacing: '0.6em', duration: 1.1, ease: 'power2.out' }, '-=0.3')
      .from('.veil__post', { opacity: 0, duration: 0.6 }, '-=0.4')
      .to(veil, { opacity: 0, duration: 0.9, ease: 'power2.inOut', delay: 0.5 })
      .set(veil, { display: 'none' })
      .from('.hero__title span', { yPercent: 42, opacity: 0, duration: 1.3, stagger: 0.06, ease: 'power3.out', clearProps: 'all' }, '-=0.55')
      .from('.hero__eyebrow, .hero__line', { opacity: 0, y: 14, duration: 1, stagger: 0.15, clearProps: 'all' }, '-=0.9')
      .from('.hero__foot, .bar', { opacity: 0, duration: 0.9, clearProps: 'opacity' }, '-=0.6');

    gsap.to('.hero__video', { scale: 1, duration: 6.5, ease: 'power1.out' });
    gsap.to('.hero__content', {
      y: -70, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  if (reduceMotion) return;

  /* ---------- step inside: zoom through the screen ---------- */
  const insideTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#inside',
      start: 'top top',
      end: '+=260%',
      pin: '#insidePin',
      scrub: 0.7,
    },
  });
  insideTl
    .fromTo('#insideRoom', { scale: 1 }, { scale: 3.1, ease: 'power1.in', duration: 2 }, 0)
    .to('#insideRoom', { filter: 'brightness(1.9)', duration: 0.8 }, 1.2)
    .to('#insideCaption', { opacity: 0, y: -30, duration: 0.5 }, 0.9)
    .fromTo('#insideBeam', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.5)
    .fromTo('#insideBeam img', { scale: 1.25 }, { scale: 1, ease: 'power1.out', duration: 1.2 }, 1.5)
    .fromTo('#insideCaptionLate', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 2.1);

  /* ---------- features: curtain wipes from center ---------- */
  gsap.utils.toArray('[data-wipe]').forEach((media) => {
    gsap.fromTo(media,
      { clipPath: 'inset(0 50% 0 50%)' },
      {
        clipPath: 'inset(0 0% 0 0%)',
        ease: 'power2.inOut',
        duration: 1.3,
        scrollTrigger: { trigger: media, start: 'top 78%', once: true },
      });
    gsap.fromTo(media.querySelector('img'), { yPercent: -5, scale: 1.1 }, {
      yPercent: 5, scale: 1.04, ease: 'none',
      scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  gsap.utils.toArray('.feature__text').forEach((txt) => {
    gsap.from(txt.children, {
      y: 36, opacity: 0, duration: 1, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: txt, start: 'top 76%', once: true },
    });
  });
  gsap.from('.features__heading', {
    y: 44, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.features', start: 'top 80%', once: true },
  });

  /* ---------- marquee ---------- */
  const now = gsap.to('#nowTrack', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => {
      gsap.to(now, { timeScale: gsap.utils.clamp(0.5, 3, Math.abs(self.getVelocity() / 300)), duration: 0.4, overwrite: true });
    },
  });

  /* ---------- credits: scrubbed roll ---------- */
  const roll = document.getElementById('creditsRoll');
  gsap.fromTo(roll, { yPercent: 0 }, {
    yPercent: -100,
    y: () => -window.innerHeight * 0.15,
    ease: 'none',
    scrollTrigger: {
      trigger: '#credits',
      start: 'top top',
      end: '+=280%',
      pin: '#creditsPin',
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  /* ---------- booking reveals ---------- */
  gsap.utils.toArray('.booking__kicker, .booking__title, .booking__btn, .booking__note').forEach((el) => {
    gsap.from(el, {
      y: 36, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
})();
