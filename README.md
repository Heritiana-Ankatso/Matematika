# Matematika

Complete edition of the Maths Explorer site: the French lycée curriculum plus the Malagasy, international and university
curricula, Olympiad, and the shared collections (laboratory, galleries, curiosities, foundations, challenges, history,
reading). Published at https://heritiana-ankatso.github.io/Matematika/. The French-only edition is
[Maths-explorer](https://github.com/ARHeritiana/Maths-explorer) (https://arheritiana.github.io/Maths-explorer/).

This repository holds the source and the built site:

- `site/` hand-written web source, `content/` courses, slides and data, `build/mxbuild/` the pipeline, `scripts/`,
  `tests/`, `docs/`;
- `dist/` the served folder, written by `make site` and published by `.github/workflows/pages.yml`.

Build: `pip install pymupdf==1.26.6`, then `make site` (the full edition is fixed: `FULL_EDITION = true` in
`site/js/live-curriculum.js`). Checks: `npm run check`, `npm test`, `make check`. Agent instructions: `CLAUDE.md`.

Licences: see `LICENSE.md` (content) and `LICENSE-CODE`.
