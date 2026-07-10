/* ============================================================
   CURRENT — Smart Installers
   WebGL signal-field hero + GSAP scroll orchestration
   ============================================================ */
import * as THREE from '../vendor/three.module.min.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ------------------------------------------------------------
   1. WebGL hero: flowing signal filaments (custom fragment shader)
   ------------------------------------------------------------ */
const glCanvas = document.getElementById('gl');
let renderer = null;
let glUniforms = null;

function initGL() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    glCanvas.style.background = 'radial-gradient(90% 90% at 60% 20%, #0b1230 0%, #04060e 70%)';
    return;
  }
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  glUniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uScroll: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms: glUniforms,
    vertexShader: /* glsl */ `
      void main() { gl_Position = vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uTime;
      uniform vec2 uRes;
      uniform vec2 uMouse;
      uniform float uScroll;

      // ---- hash & noise ----
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = p * 2.03 + vec2(11.3, 7.7);
          a *= 0.5;
        }
        return v;
      }

      // one glowing filament: distance of uv.y to a drifting curve
      vec3 filament(vec2 uv, float seed, float baseY, float amp, float speed, vec3 tint, float pulseRate) {
        float t = uTime * speed;
        // curve shape: layered noise drift
        float y = baseY
          + amp * (noise(vec2(uv.x * 1.6 + t * 0.35, seed)) - 0.5)
          + amp * 0.5 * (noise(vec2(uv.x * 3.6 - t * 0.22, seed * 2.7)) - 0.5);

        // mouse bends the field: gaussian push
        vec2 m = uMouse;
        float md = distance(vec2(uv.x, y), m);
        y += 0.09 * exp(-md * md * 22.0) * sign(y - m.y + 0.0001);

        float d = abs(uv.y - y);

        // core + halo
        float core = 0.0016 / (d + 0.0016);
        float halo = 0.014 / (d + 0.028);

        // travelling pulse along x: centered packet so both edges fade smoothly,
        // gated by distance so it never washes a full column
        float pp = fract(uv.x * 0.7 - uTime * pulseRate + seed) - 0.5;
        float packet = exp(-pp * pp * 240.0);
        float pulseGlow = (core * 1.8 + exp(-d * d * 900.0) * 0.5) * packet;

        float lum = core * 0.9 + halo * 0.34;
        vec3 col = tint * lum + vec3(0.92, 0.95, 1.0) * pulseGlow * 0.9;
        return col;
      }

      void main() {
        vec2 frag = gl_FragCoord.xy / uRes.xy;
        float aspect = uRes.x / uRes.y;
        vec2 uv = frag;

        // deep space background: vertical gradient + faint nebula
        vec3 bg = mix(vec3(0.012, 0.02, 0.05), vec3(0.016, 0.024, 0.085), pow(frag.y, 1.4));
        float neb = fbm(vec2(uv.x * 2.2, uv.y * 2.2) + uTime * 0.02);
        bg += vec3(0.02, 0.03, 0.1) * neb * 0.55;

        // faint dot grid, drifting with scroll
        vec2 gp = fract(vec2(uv.x * aspect, uv.y + uScroll * 0.18) * 26.0) - 0.5;
        float dots = smoothstep(0.05, 0.015, length(gp));
        bg += vec3(0.05, 0.07, 0.2) * dots * 0.16;

        // filaments (cobalt family + one warm signal)
        vec3 col = bg;
        vec3 cobalt   = vec3(0.16, 0.24, 1.0);
        vec3 cobaltHi = vec3(0.34, 0.42, 1.0);
        vec3 iceBlue  = vec3(0.5, 0.62, 1.0);
        vec3 signal   = vec3(1.0, 0.3, 0.14);

        col += filament(uv, 1.7,  0.30, 0.16, 0.9,  cobalt,   0.10);
        col += filament(uv, 3.1,  0.44, 0.22, 0.6,  cobaltHi, 0.06);
        col += filament(uv, 5.9,  0.58, 0.18, 1.15, cobalt,   0.14);
        col += filament(uv, 8.4,  0.70, 0.13, 0.75, iceBlue,  0.05);
        col += filament(uv, 12.3, 0.52, 0.30, 0.45, cobalt * 0.7, 0.045);
        col += filament(uv, 15.8, 0.38, 0.10, 1.4,  signal,   0.16) * 0.5;

        // cursor aura
        float ca = exp(-pow(distance(uv, uMouse) * 2.6, 2.0));
        col += vec3(0.10, 0.14, 0.5) * ca * 0.35;

        // vignette
        vec2 vc = frag - 0.5;
        col *= 1.0 - dot(vc, vc) * 0.9;

        // dither to kill banding
        col += (hash(gl_FragCoord.xy) - 0.5) * 0.012;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  const mouseTarget = new THREE.Vector2(0.5, 0.55);
  window.addEventListener('pointermove', (e) => {
    mouseTarget.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  }, { passive: true });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = glCanvas.clientWidth;
    const h = glCanvas.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(dpr);
    glUniforms.uRes.value.set(w * dpr, h * dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  let heroVisible = true;
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }, { threshold: 0 })
    .observe(document.getElementById('hero'));

  function frame() {
    if (heroVisible && !document.hidden) {
      glUniforms.uTime.value = reduceMotion ? 12.0 : clock.getElapsedTime();
      glUniforms.uMouse.value.lerp(mouseTarget, 0.06);
      glUniforms.uScroll.value = window.scrollY / window.innerHeight;
      renderer.render(scene, camera);
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  if (reduceMotion) {
    glUniforms.uTime.value = 12.0;
    renderer.render(scene, camera);
  } else {
    requestAnimationFrame(frame);
  }
}
initGL();

/* ------------------------------------------------------------
   2. Smooth scroll (Lenis) bridged into GSAP ticker
   ------------------------------------------------------------ */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ autoRaf: false, lerp: 0.1, wheelMultiplier: 1.05 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------
   3. Loader -> hero intro
   ------------------------------------------------------------ */
const loader = document.getElementById('loader');
const loaderPct = document.getElementById('loaderPct');
const loaderLine = document.getElementById('loaderLine');

function playIntro() {
  const introTl = gsap.timeline();
  introTl
    .to(loader, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
    .set(loader, { display: 'none' })
    .from('.hero__word, .hero__punct', {
      yPercent: 118,
      duration: 1.1,
      stagger: 0.08,
      ease: 'power4.out',
    }, '-=0.45')
    .from('.hero__eyebrow span', { yPercent: 110, duration: 0.7, ease: 'power3.out' }, '-=0.8')
    .from('.hero__sub, .hero__cue', { y: 24, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }, '-=0.6')
    .from('.chrome, .hud', { y: -14, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }, '-=0.7');
}

if (reduceMotion) {
  loader.style.display = 'none';
} else {
  const state = { p: 0 };
  const fill = gsap.to(state, {
    p: 100,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => {
      loaderPct.textContent = String(Math.round(state.p)).padStart(3, '0');
      loaderLine.style.setProperty('--p', state.p / 100);
    },
    onComplete: playIntro,
  });
  // safety: never trap the page behind the loader
  setTimeout(() => { if (state.p < 100) fill.progress(1); }, 4000);
}

/* ------------------------------------------------------------
   4. Custom cursor + magnetic buttons
   ------------------------------------------------------------ */
if (!isTouch && !reduceMotion) {
  const cursor = document.getElementById('cursor');
  const label = document.getElementById('cursorLabel');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const target = { x: pos.x, y: pos.y };

  window.addEventListener('pointermove', (e) => { target.x = e.clientX; target.y = e.clientY; }, { passive: true });
  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  });

  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const mode = el.dataset.cursor;
      cursor.classList.toggle('is-link', mode === 'link');
      cursor.classList.toggle('is-view', mode === 'view');
      label.textContent = mode === 'view' ? 'VIEW' : '';
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-link', 'is-view'));
  });

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 0.35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * strength,
        y: (e.clientY - r.top - r.height / 2) * strength,
        duration: 0.4, ease: 'power3.out',
      });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
  });
}

/* ------------------------------------------------------------
   5. Scroll choreography
   ------------------------------------------------------------ */
if (!reduceMotion) {
  // marquee: infinite loop, speed reacts to scroll velocity
  const track = document.getElementById('marqueeTrack');
  const loop = gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = gsap.utils.clamp(0.4, 5, Math.abs(self.getVelocity() / 220));
      gsap.to(loop, { timeScale: v, duration: 0.4, overwrite: true });
    },
  });

  // manifesto: word-by-word ink-up on scrub
  const split = new SplitText('#manifesto', { type: 'words', wordsClass: 'w' });
  gsap.fromTo(split.words,
    { opacity: 0.14, y: 8 },
    {
      opacity: 1, y: 0,
      stagger: 0.045,
      ease: 'none',
      scrollTrigger: { trigger: '#manifesto', start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
    });

  // hero headline drifts up as you leave
  gsap.to('.hero__inner', {
    yPercent: -18, opacity: 0.25, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // stats counters
  document.querySelectorAll('.stat__num').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(obj, {
        v: end, duration: 1.8, ease: 'power3.out',
        onUpdate: () => { el.textContent = obj.v.toFixed(dec); },
      }),
    });
  });

  // circuit traces draw in
  document.querySelectorAll('.stats__trace').forEach((path, i) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0, duration: 2, delay: i * 0.3, ease: 'power2.inOut',
      scrollTrigger: { trigger: '#grid', start: 'top 70%', once: true },
    });
  });

  // horizontal work gallery (desktop pin; native swipe on mobile)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = document.getElementById('workTrack');
    const pin = document.getElementById('workPin');
    const progress = document.getElementById('workProgress');
    const getDist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -getDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#work',
        start: 'top top',
        end: () => '+=' + getDist(),
        pin: pin,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(4, Math.floor(self.progress * 4) + 1);
          progress.textContent = `0${idx} / 04`;
        },
      },
    });
    // inner image parallax
    document.querySelectorAll('.card__media img').forEach((img) => {
      gsap.fromTo(img, { y: '-8%' }, {
        y: '0%', ease: 'none',
        scrollTrigger: { trigger: '#work', start: 'top top', end: () => '+=' + getDist(), scrub: true },
      });
    });
    return () => tween.scrollTrigger && tween.scrollTrigger.kill();
  });
  mm.add('(max-width: 900px)', () => {
    const pin = document.getElementById('workPin');
    pin.style.overflowX = 'auto';
    pin.querySelector('.work__track').style.width = 'max-content';
  });

  // process line draw + step activation
  const pline = document.querySelector('#processLine path');
  const plen = pline.getTotalLength();
  gsap.set(pline, { strokeDasharray: plen, strokeDashoffset: plen });
  gsap.to(pline, {
    strokeDashoffset: 0, ease: 'none',
    scrollTrigger: { trigger: '.process__flow', start: 'top 70%', end: 'bottom 55%', scrub: 0.5 },
  });
  document.querySelectorAll('.step').forEach((step) => {
    ScrollTrigger.create({
      trigger: step, start: 'top 68%',
      onEnter: () => step.classList.add('is-active'),
      onLeaveBack: () => step.classList.remove('is-active'),
    });
  });

  // section titles: masked rise
  document.querySelectorAll('.services__title, .work__title, .process__title').forEach((el) => {
    gsap.from(el, {
      yPercent: 60, opacity: 0, duration: 1, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // CTA rows rise on enter
  gsap.from('.cta__row', {
    yPercent: 110, duration: 1.1, stagger: 0.1, ease: 'power4.out',
    scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true },
  });

  // scroll HUD %
  const hud = document.getElementById('hudScroll');
  ScrollTrigger.create({
    onUpdate: () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = Math.round((window.scrollY / max) * 100);
      hud.textContent = `SCROLL ${String(Math.min(100, Math.max(0, p))).padStart(3, '0')}%`;
    },
  });

  // anchor links through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target && lenis) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }); }
    });
  });
}

/* ------------------------------------------------------------
   6. Service hover preview (image follows cursor)
   ------------------------------------------------------------ */
if (!isTouch) {
  const preview = document.getElementById('servicePreview');
  const previewImg = document.getElementById('servicePreviewImg');
  const services = document.getElementById('servicesList');
  let px = 0, py = 0, tx = 0, ty = 0;

  services.addEventListener('pointermove', (e) => { tx = e.clientX + 28; ty = e.clientY - 90; }, { passive: true });
  gsap.ticker.add(() => {
    px += (tx - px) * 0.12;
    py += (ty - py) * 0.12;
    preview.style.transform = `translate(${px}px, ${py}px) scale(${preview.classList.contains('is-on') ? 1 : 0.9})`;
  });

  document.querySelectorAll('.service').forEach((li) => {
    li.addEventListener('mouseenter', () => {
      previewImg.src = li.dataset.img;
      preview.classList.add('is-on');
    });
    li.addEventListener('mouseleave', () => preview.classList.remove('is-on'));
  });
}
