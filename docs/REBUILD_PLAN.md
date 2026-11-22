# Rebuild plan for design v8 (22 November 2026)

Technical plan for `docs/DESIGN_V8.md` (four worlds). Status: **proposed, awaiting the owner's go-ahead.** Each stage is
one pull request (or a short series), merged only with "Website checks" green, under the Git rule of `CLAUDE.md`.

## 1. Principles

1. **Nothing breaks on the live site.** A merge to `main` is live at once, so v8 is built behind a switch (section 3)
   and becomes the default only in the last stage.
2. **Speed first.** Stages 0 and 1 change no design; they cut what every page loads. They help the current site
   immediately and are the foundation for v8.
3. **Plain JavaScript modules, no framework.** The site has 124 hand-written ES modules, node tests and no JS build
   step. The loading problem comes from the import graph, not from a missing framework; a framework would add a
   runtime and a rewrite without fixing it. Static GitHub Pages, hash routes and the import map stay.
4. **One source per fact** (`MAP.md` section 5): world tokens in `site/styles/tokens.css`; curated museum and
   university data in one file each; counts always computed from the sources.
5. **Content is kept.** Every feature and every page of today stays reachable; Maths-explorer parity (`CLAUDE.md`) is
   unaffected because v8 changes Matematika's design only.

## 2. Baseline (22 November 2026, `main` at `9d88599`)

Every page loads about 535 requests (516 JavaScript modules), about 2.7 MB gzip (3.4 MB on a lycée chapter page).
Cause: `site/js/app.js` statically imports 50 modules; `site/js/catalogue-data.js` (915 KB raw) and every exercise
generator are reached from the home page. The code already loads 11 modules on demand (`import()` for the dock, search,
teacher dashboard, explainers), so the technique is proven here. MathJax (`site/vendor/mathjax-tex-svg.js`, 2.2 MB raw)
must load only on pages with formulas.

## 3. The switch

- `site/js/v8.js` exports `V8_ACTIVE`: false by default; true when the address carries `?v8` (remembered on the device
  for the owner's review) or, after stage 8, always.
- While false, the site renders exactly as today. The owner reviews each stage on the real site with `?v8`.
- Stage 8 flips the default and removes the old paths.

## 4. Stages

### Stage 0: measure and guard (no visible change)

- Browser test `tests/budget_browser.py` (or `.mjs`): loads `#home`, one lycée chapter, one university lesson, the lab,
  one gallery exhibit, the Olympiad page; records requests, JavaScript requests and transferred bytes, with and without
  a throttled mobile profile (Chrome DevTools "Slow 4G", CPU ×4). Budgets start at today's values (non-regression) and
  tighten in stage 1.
- Record the throttled timings (first content, interactive) in this file.

### Stage 1: load only what a page needs (no visible change)

- `site/js/routes.js`: one table `{ match, world, load: () => import('./pages/…') }` for every route of `MAP.md`
  section 3. `app.js` keeps only the shell: router, header, footer, theme and language, search trigger.
- Page modules become `import()` targets; shared helpers stay static imports of the pages that use them.
- Split generated data: the build writes one catalogue file per course (`dist/js/catalogue/<course>.js` or JSON) and a
  separate lazy search index, instead of one 915 KB file (`build/mxbuild/site.py`, `catalog.py`).
- MathJax and the exercise generators load only on pages that render formulas or exercises.
- Service worker (`build/mxbuild/offline.py`, `site/sw.js`): precache the shell and world styles; cache pages and data
  when opened (`docs/OFFLINE.md`).
- Targets, to confirm against stage 0: home ≤ 30 requests and ≤ 300 KB gzip excluding fonts; a chapter page ≤ 60
  requests excluding its PDFs. The budget test fails above them.

### Stage 2: design foundation (behind the switch)

- `site/styles/tokens.css`: shared scale plus one token block per world (`[data-world="musee" | "univ" | "lycee" |
  "olymp" | "home"]`), values from `DESIGN_V8.md` section 3.
- Fonts self-hosted in `site/fonts/` with their licence files (all SIL OFL, licences to be confirmed when vendored):
  Newsreader, Literata, Instrument Sans, Instrument Serif, IBM Plex Sans and Mono, Playwrite FR Moderne, Kalam,
  JetBrains Mono (Archivo is already there). Latin and Latin Extended subsets only; each world loads only its own faces.
  No Google Fonts at run time (privacy, offline, speed).
- One stylesheet per world (`site/styles/world-<id>.css`) loaded when the world is entered; shared components in
  `controls.css`: top bar and folded world menu, disclosure lists (one open at a time), side sheet, chapter outline,
  deck controls.
- Tests: WCAG contrast of every text and accent pair of each world (node), no horizontal overflow at 360, 390 and
  1280 px per world (browser), nothing animates under reduced motion (browser: no `requestAnimationFrame` loop).

### Stage 3: threshold and Musée

- Threshold page with the four doors (live drawings stop when off screen and under reduced motion).
- Musée hall: exhibit of the day, "Là où on ne les attend pas", the eight rooms. Rooms and counts come from the
  existing sources (`content.js` labs, `intuition-data.js`, `fractals-data.js`, `history-data.js`,
  `reading-content.js`, `challenges/registry.js`, `errors-data.js`); the curated selection lives in one new file
  `site/js/museum-data.js` that only references existing ids.
- Exhibit page template applied to gallery entries (`#gallery/<id>`) and reading pages; Benford first, then the rest.

### Stage 4: Université

- `site/js/university-map.js`: the fields, their links and which course lights which field (one source); the sky map
  with a keyboard and list alternative.
- "Les grands assauts": `site/js/sieges-data.js` with dates, solvers, status (fell, announced, open) and a source per
  entry; the Riemann status is re-checked before publication.
- Courses from `manifest.json` key `university`; the chapter page in the university look renders the existing web
  lessons (Algèbre 1 from `scripts/build-algebre1.py`, Fourier, foundations, module), whose HTML gets v8 classes.

### Stage 5: Lycée, the copybook

- `site/styles/world-lycee.css` (Seyès ruling, margin, pen colours, frames) and `site/js/seyes-rhythm.js` (font metrics,
  moving text onto the heavy lines), with a browser test that every text baseline of a sample chapter sits on a heavy
  line at 390 and 1280 px.
- Notebooks and levels from the manifest; chapter lists folded.
- **Course text on the web.** Today the lycée courses exist only as PDFs plus companion notes; Algèbre 1 is the only
  converter from source to web. A shared converter `build/mxbuild/texhtml.py` (generalised from the Algèbre 1 parser)
  turns the course environments of `docs/TEX_STYLE_GUIDE.md` into HTML; TikZ figures are compiled to SVG with
  `dvisvgm` and cached. Rolled out course by course; until a course is converted, its chapter page shows the companion
  notes, the PDF and the exercises in the new look. This is the largest stage.
- Exercises sheet from the existing bank (`site/js/exercises/`), projection with the existing slide player restyled
  per world, "Fond clair / Fond sombre" remembered.

### Stage 6: Olympiades

- Arena page and strategy pages from `site/js/olympiad-content.js`; the problem of the day is chosen from the date
  (deterministic, no server); the 50-squares figure is computed from the problem levels.

### Stage 7: addresses

- `site/js/route-aliases.js`: every current route of `MAP.md` section 3 maps to its v8 address; old links (shared with
  students, in PDFs, in slide decks) keep working. Test: every alias resolves to a page that renders.

### Stage 8: switch and clean-up

- Flip `V8_ACTIVE` on by default; remove the v7 page paths, the unused parts of `pages.css` and the v7-only modules;
  move `DESIGN_V7.md` to `docs/history/`; update `MAP.md`, `site/CLAUDE.md`, `docs/CLAUDE.md`, `PROJECT_BRIEF.md`
  section 6 (owner decision 1 of `DESIGN_V8.md`).

## 5. Order and dependencies

Stages 0 and 1 can start now and need no design decision. Stage 2 is needed by 3 to 6. Stages 3, 4 and 6 are
independent of each other; stage 5 is the longest because of the converter. Stage 7 before stage 8. The open owner
decisions of `DESIGN_V8.md` section 8 block: decision 4 for stages 3 and 5, decision 5 for stage 5, decision 6 for
stage 5, decision 1 for stage 8.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Font weight (nine families) | Subsets, per-world loading, `font-display: swap`, budget test includes fonts per world |
| Handwriting legibility | Owner decision 6; 200 % text check; print handwriting for long text |
| TeX to HTML fidelity, TikZ | Course by course; PDF stays the reference and is always one click away |
| Baseline script and zoom | Re-run on resize, font load, formulas and folding; browser test |
| Live-site regressions | Switch, budgets and route tests; each stage small |
| Claims in the Université world (Riemann status) | One data file with sources; re-checked before publication |
