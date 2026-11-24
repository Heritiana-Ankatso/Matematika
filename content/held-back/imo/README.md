# IMO papers, held back

The IMO section of `#contests` is not published (owner decision, 24 November 2026).

- Why: the IMO publishes no open licence. Checked 24 November 2026: imo-official.org (footer "© International
  Mathematical Olympiad", no terms page), the IMO regulations (`RegulationsIMO.pdf`, no clause on reuse) and the
  official problem PDFs (no licence notice) say nothing that allows reproducing the statements. Owner rule: the
  problems are shown verbatim or not at all. Restated text is no longer shown either.
- Files kept here, unpublished and outside `site/` so that `dist/` does not carry them: `imo.js` (2023 to 2026, with the
  written solutions) and `imo-earlier.js` (2002 to 2022). Same `PAPERS` shape as `site/js/contests/euclid.js`.
- To publish again, once the IMO Board has given written permission to reproduce the statements verbatim: move both
  files back to `site/js/contests/`, import them in `registry.js` (`withOfficial('imo', [...IMO_RECENT, ...IMO_EARLIER])`),
  restore the `imo` entry (kind `olympiad`, rights text updated to the permission) and `OFFICIAL.imo` (shortlist PDF
  `https://www.imo-official.org/problems/IMO<year>SL.pdf`, 2006 to 2024), put the statements back to the official
  wording, restore the IMO page tests (git history of `tests/contests.test.mjs`) and the link in `site/js/v8/olymp.js`.
