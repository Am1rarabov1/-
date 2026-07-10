# Smart Installers × Fable — Three Websites, One Company

Three radically different showcase websites for **Smart Installers** (a low-voltage
installation company), designed and built end-to-end by **Claude (Fable 5)** running
autonomously: concept, art direction, copywriting, code, AI-generated imagery and video,
iteration passes, and deployment.

## The three experiences

| # | Site | Universe | Signature techniques |
|---|------|----------|----------------------|
| 01 | [`/current/`](./current/) — **CURRENT** | Dark cinematic WebGL | Custom GLSL "signal-field" shader (six noise-driven light filaments with traveling pulses that bend around the cursor), Lenis + GSAP scroll choreography, pinned horizontal work gallery, magnetic buttons, custom cursor, preloader |
| 02 | [`/signal/`](./signal/) — **The Signal Standard** | Broadsheet newspaper | Variable-font Fraunces at `opsz 144 / WONK 1`, CSS halftone photography, scroll-velocity type skew, self-drawing SVG wiring schematic with traveling pulses, drop caps, dot leaders, cut-out coupon CTA |
| 03 | [`/atelier/`](./atelier/) — **Atelier** | Quiet luxury photography | AI photo set shot to one lighting brief, hero cinemagraph (image-to-video via Kling 3.0 Turbo), sticky room chapters with crossfading lens, interactive lighting-scene dial (CSS blend-mode relighting) |

The root [`index.html`](./index.html) is a triptych hub linking all three.
**Every site documents its own making at `/guide`** — e.g. `/current/guide/`.

## How it was built

1. **Concept first.** Each site got a one-sentence spine ("the invisible nervous system",
   "a trade journal from the golden age of print", "technology you feel, not see") and a
   locked palette + type pairing before any code.
2. **AI asset kit.** All 14 photographs were generated with Higgsfield's image model
   (nano banana pro), each site's set prompted to a single lighting/style brief so it reads
   as one shoot. The Atelier hero was animated from its lead still with Kling 3.0 Turbo.
3. **Hand-written static code.** No frameworks, no build step. Vendored libraries only:
   Three.js (site 1), GSAP 3 + ScrollTrigger + SplitText, Lenis. Fonts self-hosted
   (Syne, Space Grotesk, IBM Plex Mono, Fraunces, Archivo, Italiana, Cormorant Garamond, Karla).
4. **CI asset pipeline.** `tools/assets-manifest.json` maps generated-media URLs to repo
   paths; a GitHub Actions job downloads, resizes and recompresses them (ffmpeg), commits
   the results, and publishes the site.
5. **Three iteration passes per site.** Playwright screenshots at desktop + mobile widths,
   including interaction states (hover previews, dial scenes, drawn schematic), each pass
   producing concrete fixes (shader seam, type overflow, contrast over photography, etc.).

## Hosting

- **Live:** GitHub Pages, deployed by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
  to the `gh-pages` branch on every push.
- **Netlify:** the repo is Netlify-ready (`netlify.toml`, pure static files). Import the repo
  at app.netlify.com, or drag the folder onto <https://app.netlify.com/drop>, or:

  ```bash
  netlify deploy --prod --dir .          # whole bundle (hub + three sites)
  netlify deploy --prod --dir current    # any site standalone
  ```

  (Direct Netlify deployment from the build sandbox was blocked by its network policy,
  so GitHub Pages carries the live links; the artifact is 100% portable.)

## Repo map

```
index.html          the triptych hub
current/            site 1 (WebGL cinematic)  + /guide
signal/             site 2 (broadsheet)       + /guide
atelier/            site 3 (quiet luxury)     + /guide
tools/              asset manifest + fetch/optimize script (runs in CI)
.github/workflows/  fetch assets → commit → deploy to gh-pages
netlify.toml        Netlify config for the whole bundle
```

---

Designed & built by Claude (Fable 5). Imagery & video generated with Higgsfield.
