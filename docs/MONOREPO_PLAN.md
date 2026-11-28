# Monorepo plan: one source, two editions (option B, owner go-ahead 21 November 2026)

Home: **this repository (Matematika)**, owner decision of 21 November 2026. Status: plan only. It reverses the independence rule of 14 November 2026 once step 2 below lands; until then the
independence rule and the double-PR habit stay in force.

## Measured starting point (21 November 2026, both `main` at their tips)

Of 3,334 tracked paths present in both repositories (`site/`, `content/`, `build/`, `scripts/`, `tests/`, `docs/`),
269 differ. They fall in three kinds:

| Kind | Examples | What to do |
|---|---|---|
| **Theme** (intended) | `site/styles/{tokens,pages,ergonomics,explorer}.css`, `comic.css`, `motion.js`, `home-art.js`, fonts, `content/tex/core/mx-brand.sty`, the 118 `content/tex` lecture units that carry the brand, `scripts/share-image.py`, `docs/DESIGN_V8.md` | one theme folder per edition, chosen at build time |
| **Scope** (intended) | `live-curriculum.js`, `curriculum-picker.js`, `edition.json`, `manifest.json`, `relax-model.js` (Olympiad), `bank-page.js` (Malagasy), `content/{malagasy,university}`, Olympiad and university modules and tests | superset code, switched by an edition scope file, not by `FULL_EDITION` |
| **Drift** (unintended) | order of functions in `home-art.js`, comment-only and test-only differences, a few ported-late changes | resolved once, in the merge |

Generated files (`manifest.json`, `RESOURCE_PROVENANCE.json`, `build-state.json`, `dist/`) are not source and are
rebuilt per edition.

## Target layout

```
site/ content/ build/ scripts/ tests/ docs/      shared source: the superset (Matematika's scope)
editions/
  explorer/    edition.json  scope.json  theme/ (css, fonts, mx-brand.sty, share image)
  matematika/  edition.json  scope.json  theme/
content/malagasy, content/university, ...         shared tree, listed in scope.json of the editions that show it
dist/<edition>/                                   built in CI, NOT committed
content/built/<edition>/                          committed PDFs only (local TeX lacks pplr8t)
```

`make site EDITION=explorer|matematika` builds one edition. `scope.json` lists curricula, routes and collections.

**Superset guarantee (the owner's hard rule, now a test):** `tests/editions.test.mjs` builds the course list, routes,
resource index and gallery/lab ids of both editions and fails if Matematika lacks anything Maths-explorer has.

## Steps (one PR each, `main` stays green and deployable throughout)

1. **Cut the cost of generated output** (re-measured 21 November 2026: of the 7,269 files of `dist/`, only 659 files /
   12 MB are plain copies of `site/`; the other 388 MB are build products: annals 114 MB, slide exports 105 MB, lecture
   PDFs 15 MB, university 6 MB, the rest small). The first idea, "CI builds `dist/`", is therefore not a one-PR
   change: the annals, lectures and decks need TeX and fonts that CI and the local machine lack. Sub-steps, each
   proved by a CI experiment before it merges: (a) CI builds the `site/` copies and the slide exports (no TeX needed:
   `scripts/export-slides.py`), so `dist/slides/export` leaves git; (b) TeX-bound products (annals, lectures) stay
   committed under `content/built/<edition>/` or move to Git LFS (owner choice if it comes to that).
2. **Edition seam.** Introduce `editions/<name>/` and `scope.json`; replace `FULL_EDITION` and the Python edition
   reads with the scope file; both editions still build from their own repository, byte-equal to today.
3. **Merge the explorer edition.** Port Maths-explorer's theme (v8 comic look, fonts, `mx-brand.sty`) and its newer
   French/general changes into this repository as `editions/explorer/` (scope = today's Maths-explorer). Resolve the
   drift once; open Maths-explorer PRs are merged or ported first. Gate: the Maths-explorer edition built here equals the live Maths-explorer site.
4. **Both editions from here.** `EDITION=matematika` equals today's live Matematika site apart from the drift fixes.
5. **Deploy and retire.** Matematika's Pages stay published from this repository. Maths-explorer's Pages are
   published by a workflow here that builds `EDITION=explorer` and pushes it to the Maths-explorer repository with a
   deploy key (owner creates the key and stores it as a secret here). Then Maths-explorer's source is archived.
6. **Guard rails.** The superset test in CI; `AGENTS.md`, both `CLAUDE.md` and the memory rules rewritten.
7. **Then** `site/js/` feature folders and a shorter `MAP.md`.

## Step 3a findings (21 November 2026): the small differences are not missed ports

All 45 files of the "other" group were read (the ten where Maths-explorer's file is newer, with the Fourier, bank,
library and test files, and `app.js` and `content.js`). Every difference is one of two things, none a missed port:

- **Scope**: Matematika's file is a superset (Malagasy bank `bank-mada.js`, pathways in `library.js` and
  `lab-engine.test.mjs`, the university catalogue in `fourier-links.js`, Olympiad in `offline_browser.mjs`,
  `FULL_EDITION` branches in tests). These stay in the shared source; the scope file switches them.
- **Information architecture and identity**: `site/js/app.js` defines different main navigation (Maths-explorer: four
  sections Cours, Exercices, Labo, Bibliothèque with hover flyouts; Matematika: three sections Apprendre, Explorer,
  Lire, with a "Pour enseigner" fold and Programmes/Olympiades) and a different brand mark; `tests/history.test.mjs`
  counts 4 versus 3 main links accordingly. `content.js` has no Maths-explorer-only line.

Consequence for the plan: the edition layer holds more than CSS. Each edition carries its **navigation structure
(`SECTIONS`, `TAB_OF`) and brand mark** (`editions/<id>/nav.js`, `brand.js`, copied or imported by `app.js` at build
time), and the tests that count navigation links read the edition's structure. This goes into step 3b with the theme.

## Decisions (owner, 21 November 2026)

1. Home repository: Matematika.
2. Two Pages sites: a workflow in the home builds the explorer edition and pushes it to the Maths-explorer repository
   with a deploy key (owner action: create the key, store it as a secret here).
3. Open Matematika PRs: all were already merged or closed when checked (#24 closed, superseded by #43).

## Rollback

Every step is one squash-merged PR: revert it. Until step 5, Maths-explorer's repository stays the live source of its site.
