# Rebuild plan for design v8 (22 November 2026)

Technical plan for `docs/DESIGN_V8.md` (four worlds). Status: **approved with the owner's decisions of 22 November 2026; stages 0 and 1 may start.** Each stage is
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

### Stage 0 measurement (22 November 2026, `main` at `f506e18`)

`npm run test:budget` (`tests/budget_browser.mjs`): `dist/` served over HTTP/2 with gzip, a fresh Chromium context per
page (no cache, no service worker), 390 × 844. Kilobytes are gzip bytes transferred; "without fonts" is what the budget
checks. Timings with `--timings`: Chrome DevTools "Slow 4G" (562.5 ms latency, 1.44 Mbit/s down) and CPU ×4, in ms
from navigation start; "content" is the first heading drawn in `#app`, "settled" the end of the last request.

| Page | Route | Requests | JS | KB | KB without fonts | First paint | Content | Settled |
|---|---|---|---|---|---|---|---|---|
| home | `#home` | 535 | 516 | 2695 | 2540 | 18916 | 20227 | 20162 |
| lycée chapter | `#chapter/seconde-01` | 537 | 517 | 3396 | 3248 | 18996 | 25480 | 25413 |
| university lesson | `#university/algebre-1-guide` | 540 | 519 | 3496 | 3269 | 19204 | 25586 | 25531 |
| laboratory | `#lab` | 535 | 516 | 2687 | 2540 | 19012 | 20269 | 20205 |
| gallery exhibit | `#gallery/galton` | 538 | 517 | 2726 | 2544 | 19096 | 20608 | 20514 |
| Olympiad | `#olympiad` | 535 | 517 | 3377 | 3238 | 19148 | 24920 | 24872 |

On a phone over slow mobile data nothing is drawn for about 19 s, on every page, because the whole import graph must
arrive before `app.js` runs. Budgets (`tests/budgets.json`) start at these values plus 2 %.

### Stage 1 result (22 November 2026)

Same measurement after stage 1 (one shell, page code on demand, light generated data):

| Page | Requests | JS | KB without fonts | First paint | Content | Before (content) |
|---|---|---|---|---|---|---|
| home | 47 | 28 | 174 | 4936 | 4930 | 20227 |
| lycée chapter | 62 | 43 | 1037 | 6356 | 6348 | 25480 |
| university lesson | 55 | 34 | 975 | 5696 | 5697 | 25586 |
| laboratory | 126 | 107 | 505 | 7564 | 7557 | 20269 |
| gallery exhibit | 453 | 432 | 1766 | n/a | 16456 | 20608 |
| Olympiad | 53 | 35 | 901 | 6048 | 6040 | 24920 |

What was done: `site/js/routes.js` (every page, its world, its code groups) and `app.js` `LOADERS` (`import()` on first
opening; a page already loaded is drawn at once, as before); the generated catalogue split in three
(`catalogue-data.js`, `asset-versions.js` for pages that link files, `annals-data.js`); `pathways-data.js` out of
`content.js`; MathJax in `mathjax.js` (no longer behind the exercise generators); light generated lines
(`catalogue-lines.js`, `lab/lines.js`) for pages that only name experiments or challenges; the box "Cette idée dans le
site" filled from generated data (`discovery-context-data.js`) when the end of the page nears the viewport, like the
related box. The chapter and Olympiad pages fetch the laboratory and the slide widgets only when they show one.

Kilobytes of the chapter, university and Olympiad pages are mostly MathJax (about 700 KB gzip), which those pages need
for their formulas. Targets of section 4: the home is at 28 JavaScript requests and 174 KB, but 47 requests in all
because every page still loads 13 stylesheets and 5 fonts; stage 2 (one stylesheet per world) brings it near 30. Not
done yet, left for stage 3 where the exhibit page is rebuilt: the gallery exhibit still loads every exhibit
(`lab-objects.js` imports all of them) and the laboratory index every experiment (`lab/registry.js`). The service worker
still precaches every module on the first visit (offline use of pages never opened); narrowing it to the shell would let
a page mix two versions during an update, so it waited for an owner decision; owner, 22 November 2026: precache the shell only (smaller offline copy), done in a follow-up pull request.

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

Done 22 November 2026: `site/js/v8.js` (switch), the `--w-*` tokens and the faces in `site/styles/tokens.css`
(`site/fonts/v8/`, OFL licences, not precached), the shared frame at the end of `site/styles/controls.css` with its
markup in `site/js/v8/kit.js`, `site/styles/world-<id>.css`, and the review page `#v8/<world>` (`site/js/v8/sampler.js`,
only under `?v8`). Tests: `tests/v8-tokens.test.mjs` (contrast of every text colour of every world, faces and
licences, v8 rules scoped), `tests/v8_foundation_browser.py` (switch off untouched, overflow at 360, 390 and 1280 px,
reduced motion, components). The Lycée hover panel is `#f4f6fd` (not `#eef1fb`) so the red pen keeps 4.5:1 on it.

- `site/styles/tokens.css`: shared scale plus one token block per world (`[data-world="musee" | "univ" | "lycee" |
  "olymp" | "home"]`), values from `DESIGN_V8.md` section 3.
- Fonts self-hosted in `site/fonts/` with their licence files (all SIL OFL, licences to be confirmed when vendored):
  Newsreader, Literata, Instrument Sans, Instrument Serif, IBM Plex Sans and Mono, Playwrite FR Moderne, Caveat,
  JetBrains Mono (Archivo is already there). Latin and Latin Extended subsets only; each world loads only its own faces.
  No Google Fonts at run time (privacy, offline, speed).
- One stylesheet per world (`site/styles/world-<id>.css`) loaded when the world is entered; shared components in
  `controls.css`: top bar and folded world menu, disclosure lists (one open at a time), side sheet, chapter outline,
  deck controls.
- Tests: WCAG contrast of every text and accent pair of each world (node), no horizontal overflow at 360, 390 and
  1280 px per world (browser), nothing animates under reduced motion (browser: no `requestAnimationFrame` loop).

### Stage 3: threshold and Musée

Done 22 November 2026 (behind `?v8`): threshold `site/js/v8/threshold.js` (`#home`), hall `site/js/v8/musee.js` (`#musee`),
exhibit template `site/js/v8/exhibit.js` for every `#gallery/<id>`; curated ids `site/js/museum-data.js`, titles and
counts generated in `site/js/world-lines.js`. Inside a dark world the current token names map onto the world, so the
exhibits' figures take the Musée palette. Reading pages keep the current look for now. Tests `tests/v8-musee.test.mjs`,
`tests/v8_musee_browser.py`.

- Threshold page with the four doors (live drawings stop when off screen and under reduced motion).
- Musée hall: exhibit of the day, "Là où on ne les attend pas", the eight rooms. Rooms and counts come from the
  existing sources (`content.js` labs, `intuition-data.js`, `fractals-data.js`, `history-data.js`,
  `reading-content.js`, `challenges/registry.js`, `errors-data.js`); the curated selection lives in one new file
  `site/js/museum-data.js` that only references existing ids.
- Exhibit page template applied to gallery entries (`#gallery/<id>`) and reading pages; Benford first, then the rest.

### Stage 4: Université

Done 22 November 2026 (behind `?v8`): `site/js/v8/univ.js` (`#university`), `site/js/university-map.js` (24 fields, 34
links; each field lists the topics of `topic-registry.js` it gathers, so the topic map and the field map are one list),
`site/js/sieges-data.js`. Riemann: listed as open as of the date its status was last checked; announced attempts are not
listed (owner, 22 November 2026).
Under `?v8` every page without its own v8 version is drawn in its world (`app.js` `v8Frame`: the world's top bar with the
language buttons; `world-<id>.css` maps the current tokens onto the world), so no page mixes two looks.

- `site/js/university-map.js`: the fields, their links and which course lights which field (one source); the sky map
  with a keyboard and list alternative.
- "Les grands assauts": `site/js/sieges-data.js` with dates, solvers, status (fell, open, with the date an open status was checked) and a source per
  entry; the Riemann status is re-checked before publication.
- Courses from `manifest.json` key `university`; the chapter page in the university look renders the existing web
  lessons (Algèbre 1 from `scripts/build-algebre1.py`, Fourier, foundations, module), whose HTML gets v8 classes.
- The foundation lessons (`#basics`, `site/resources/basics/`) move into this world beside "Fondements
  mathématiques"; the topic map (`#topics`, `discovery.js`, `topic-registry.js`) merges with the map of fields, so
  `university-map.js` and the topic registry share one list of fields (decision 4).

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
- The teacher launch pad and "Ma séance" (`teacher-dashboard.js`, `seance-model.js`) are kept and restyled; the
  chapter actions lead into them (decision 5).

- Done (22 November 2026), first part: `site/js/v8/lycee.js` (the three notebooks, levels from the live courses,
  chapters from the generated `LYCEE_CHAPTERS`), `site/js/v8/copybook.js` (the chapter page on the copybook, text from
  the chapter deck as on the current chapter page, outline in the margin, sheets Exercices and Le chapitre, Projeter
  through the existing player, which keeps its ground switch), `site/js/seyes-rhythm.js` (first baseline of every block
  on a heavy line; `tests/v8_lycee_browser.py` measures it at 390 and 1280 px, and finds 49 of 56 blocks off the lines
  without it). Exercises bank, slides index and the teacher pages stay the current pages, framed in the world.
  Remaining: the TeX converter `build/mxbuild/texhtml.py`, course by course (definitions and theorems are then told
  apart: until then every notion of a deck takes the green frame).

### Stage 6: Olympiades

- Arena page and strategy pages from `site/js/olympiad-content.js`; the problem of the day is chosen from the date
  (deterministic, no server); the 50-squares figure is computed from the problem levels.
- Warm-ups: a list of challenge ids from `site/js/challenges/registry.js`, shown in the arena and opening the
  challenge itself (decision 2).
- Done (22 November 2026): `site/js/v8/olymp.js` (arena: problem of the day by date, folded hints and solution, the ten
  strategies, the 50 squares with counts per level from the content, warm-ups from `site/js/olympiad-warmups.js`); the
  strategy pages are the current ones, framed in the world. Tests `tests/v8-olymp.test.mjs`, arena checks in
  `tests/v8_worlds_browser.py`.

### Stage 7: addresses

- `site/js/route-aliases.js`: every current route of `MAP.md` section 3 maps to its v8 address; old links (shared with
  students, in PDFs, in slide decks) keep working. Test: every alias resolves to a page that renders.

- Done (22 November 2026): the v8 pages kept every current address (none was renamed), so no alias table was needed;
  `tests/v8_addresses_browser.py` opens one address per route of `MAP.md` section 3 (it fails when a route head of that
  table is not covered) and checks that each renders in its world with no « Page introuvable ». `#history/people` still
  opens the standalone portrait timeline. A renamed address must add `site/js/route-aliases.js` and its case here.

### Stage 8: switch and clean-up

- Flip `V8_ACTIVE` on by default; remove the v7 page paths, the unused parts of `pages.css` and the v7-only modules;
  move `DESIGN_V7.md` to `docs/history/`; update `MAP.md`, `site/CLAUDE.md`, `docs/CLAUDE.md`, `PROJECT_BRIEF.md`
  section 6 (owner decision 1 of `DESIGN_V8.md`).

## 5. Order and dependencies

Stages 0 and 1 can start now and need no design decision. Stage 2 is needed by 3 to 6. Stages 3, 4 and 6 are
independent of each other; stage 5 is the longest because of the converter. Stage 7 before stage 8. The owner
decisions of `DESIGN_V8.md` section 8 were taken on 22 November 2026; nothing is blocked.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Font weight (nine families) | Subsets, per-world loading, `font-display: swap`, budget test includes fonts per world |
| Handwriting legibility | Caveat for text, cursive only for titles (decision 6); 200 % text check |
| TeX to HTML fidelity, TikZ | Course by course; PDF stays the reference and is always one click away |
| Baseline script and zoom | Re-run on resize, font load, formulas and folding; browser test |
| Live-site regressions | Switch, budgets and route tests; each stage small |
| Claims in the Université world (Riemann status) | One data file with sources; re-checked before publication |
