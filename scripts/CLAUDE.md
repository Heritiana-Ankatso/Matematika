# scripts/: index

Builders called by `build/mxbuild` (see `pipeline.py` `COURSES`) or by `make`. Each file starts with a one-line purpose.

| Script | Builds or does | Called by |
|---|---|---|
| `build-tex-resources.py` | Seconde, Première, Terminale PDFs | `make tex COURSE=...` |
| `build-expertes.py`, `build-stmg.py`, `build-automatismes.py` | Maths expertes, STMG, automatismes PDFs | `make tex` |
| `build-enrichment.py`, `enrichment_sections.py` | enrichment PDFs, HTML and site data | `make tex COURSE=enrichment` |
| `build-slides.py` | slide decks and figures from TeX and `content/slides` (`WIDGETS` table places canvases) | `make slides` |
| `build-mada.py` | Malagasy curriculum (T10, T11 S): chapter and supplement PDFs cut from the owner's compiled Mada-Boky books, manifest records | by hand, then `make site` |
| `export-slides.py` | one self-contained HTML per deck | `make slides`, `make site` |
| `build-lecture-slides.py` | Beamer lecture PDFs | `make lectures` |
| `extract-terminale-slides.py` | one-off: Terminale French drafts from LaTeX | by hand |
| `build-university.py`, `build-module-maths.py` | university foundations; applied mathematics module | `make university`, `make site` |
| `error-coverage.mjs` | `docs/ERROR_COVERAGE.md` (error correction coverage matrix by curriculum and misconception); `--check` compares | `node scripts/error-coverage.mjs`; `tests/errors.test.mjs` fails if stale |
| `build-study-guides.mjs` | study guide HTML pages from `site/js/study-guides.js` | by hand |
| `publish-sources.py` | publish `.tex` sources to `dist/sources/` (refuses identifying content) | `make tex` |
| `finalize-resources.py` | PDF hygiene, then catalogue | by hand |
| `tex-fonts.py` | the TeX fonts (`content/tex/core/fonts/`) from the site's web fonts, list in `content/tex/core/fonts/fonts.json`: static instances, subsets merged, missing characters from STIX Two Text | by hand, after a font change |
| `share-image.py` | `site/share.png`, the 1280 x 640 link preview of the brand | by hand |
| `tex-inventory.py` | `docs/TEX_INVENTORY.md` | `make inventory` |
| `check-stmg-twins.py` | kept for an old command; real check is `tests/twin_parity.py` | |
| `check-syntax.mjs` | syntax of every served script | `npm run check` |
| `serve.mjs` | local server of `dist/` on port 4173 | `npm start` |
| `optimise-gomboc.py` | the visibly shaped Gömböc: support-function polynomial found by sequential linear programming (`site/js/gomboc-support-data.js`) | by hand |
| `build-gallery-data.py` | Gerver's sofa from Romik's equations (`site/js/gallery/gallery-sofa-gerver.js`); best known square packings from a checkout of github.com/jlevy/squares (`site/js/gallery/gallery-squares-data.js`); needs numpy, scipy, shapely, pyyaml | by hand |

`build-algebre1.py`: the Algèbre 1 course from `content/university/algebre-1/*.tex` (one parse, two renderers): seven web lessons with interactives, three XeLaTeX editions (cours, exercices, corrigés), source bundle, receipt `content/data/algebre1-build.json` (also feeds titles, summaries and outlines to `content_index.py`); `--check` verifies it, `--web` rebuilds only the pages while drafting. Called by `make site` (job `algebre-1`).

`build-fourier.py`: six web lessons, four XeLaTeX PDF editions, source bundle and checked build receipt.


`prerequisite-model.mjs`: internal concept DAG, course scope/order, local question scaffolding and source fingerprints. `check-prerequisites.mjs`: advisory scan of the real bank, generated samples, authored French decks and chapter TeX; reports in ignored build output. See `docs/PREREQUISITES.md`.

`build-annals.py`: structured HTML, original-source SVG figures and downloadable LaTeX for the locally hosted annales bank; source and output hashes in content/data/annals-build.json.

`build-annals-pdf.py`: native course-style annales statement/correction PDFs and their portable source bundle with precompiled vector figures; `data/annals-pdf-build.json` records source/output integrity.

`annals-code.py`: protects literal listings and table-based programs before semantic HTML conversion; retains indentation, source operators, line numbers and mathematical pseudocode. Used by `build-annals.py`; `--html-only` reuses published figures, and `build-annals-pdf.py --reuse-inputs` retains PDF books only when their archived typesetting inputs and output hashes are identical.

`build-mada-t10.py`: the native Malagasy T10 course (unpublished; `COURSES['mada-t10']`, `make tex COURSE=mada-t10`): writes its own French-only student and teacher mains (not in `manifest.json`) from `content/tex/courses/mada-t10/` and leaves the two PDFs in the `mada-t10` folder of the build output (ignored by git); nothing goes to `dist/`.

`check-mada-t10-logic.py`: independent brute-force check of every computation of the chapter 1 (Logique) of that course: the connector tables read back from the TeX unit, equivalences, tautologies, the numbers of the exercises and solutions, the puzzles (knights and knaves, the vase, the four cards), the lamp circuit. Exits 1 on the first disagreement; run it after any change to `content/tex/courses/mada-t10/c01.fr.tex` or `content/tex/courses/mada-t10/corriges/c01.fr.tex`.

`build-mada-t11s.py`: the native Malagasy T11 S course (unpublished; `COURSES['mada-t11s']`, `make tex COURSE=mada-t11s`): same shape as `build-mada-t10.py`, from `content/tex/courses/mada-t11s/`, the two PDFs stay in the git-ignored build output; nothing goes to `dist/`.

`check-mada-t11s-functions.py`: independent check (exact fractions, dense sampling, period scans) of every computation of chapter 1 of that course: images and antecedents, domains, variation, parity, axes and centres, periods and their minimality, the table of the activity read back from the TeX unit, the two problems, and the facts of the laboratory model. Exits 1 on the first disagreement; run it after any change to `content/tex/courses/mada-t11s/c01.fr.tex`, its solutions or `site/js/lab/models/function-symmetry.js`.
