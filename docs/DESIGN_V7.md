# Design v7: "Pavage" (15 November 2026)

Chosen by the owner on 15 November 2026 from four brand proposals (two per site). It builds on the grid of v6
"Grille" and replaces its palette, type and mark. Maths-explorer received its own identity, "Bac à sable", at the same
time: the two sites are independent products and no longer share a look. The rules of v3 that come from the site's
purpose stay (find first, the figure is the page, phone first, accessible, honest labelling, no AI notice, no owner
identity).

## Idea

Mathematics as an architecture of simple rules that build infinite worlds: one tile, one axiom, one grid, and from them
every curriculum, field and culture fits together like a pavement. Elegant, structured, international.

## Rules

| | |
|---|---|
| Mark | four copies of one Truchet tile (two quarter circles); turned so that a circle appears in the middle, a shape no single tile contains. Indigo square, bone arcs; in Nuit a light indigo square with night arcs. `site/js/app.js` `brandMark`; the favicon is copied from it. The name is set in capitals, Archivo wide. |
| Palette, Jour | page `#eeeae1` bone, surface `#ffffff`, ink `#18181b` graphite (14.8:1), secondary `#3a3d47` (9.0:1), muted `#444854` (7.6:1), control borders `#5c6170`. |
| Palette, Nuit | page `#121216`, surface `#1c1c22`, ink `#eeeae1` (15.6:1), secondary `#b9bcc6` (9.9:1), muted `#a4a8b4` (7.9:1). |
| Meaning | `--accent` indigo = brand and actions (`#2c3d8f` Jour, `#8c9bff` Nuit); `--object` ochre = the studied object as a fill (every figure, with `--object-soft` and `--object-on`) (`#c98b1e`, graphite on it), `--object-ink` for its lines and words (`#8a5a00` Jour, 4.9:1); `--obj2` laterite = second object; `--pos` moss = valid; `--neg` crimson = error, always with an icon and a word. |
| Data colours | `--c1…--c8` are unchanged: they are data (graph colourings, series), not interface. |
| Type | Archivo (SIL OFL, self-hosted, `site/fonts/`) for headings and interface; width 125 for page titles and the name, 112 for h1 and h2. Atkinson Hyperlegible (SIL OFL) for reading (16 November 2026, replacing Source Serif 4). STIX Two for mathematics. Below 600 px headings use normal width, and headings and summaries may break a long word: Archivo is wider than the v6 face and must still pass the 200 % text checks. |
| Shape | square corners (`--r` 0), circles stay circles. Structure by 2 px graphite rules, 1 px hairlines in tables, an 8 px rule opens the page. No shadow, gradient, blur or glow. |
| Buttons | primary: indigo, graphite on hover. Secondary: graphite outline, filled on hover. Quiet: underlined text. Focus: 3 px indigo ring in Jour, ochre in Nuit. |
| Motion | none for decoration; a figure eases to its new state. Nothing moves under reduced motion. |
| Voice | state the idea plainly, then show where it reaches; give place, date and source of every historical claim; never present one culture as the origin of an idea several found; Malagasy, French and English copy are equals, each read by a native speaker. |

## Done in this change

Tokens of both themes (`site/styles/explorer.css`), the v6 override block of `site/styles/pages.css` adapted for v7,
the mark and favicon, the theme colour of the browser bar (`site/index.html`, `site/js/ui.js`), the slide player
tokens and fonts (`site/slides/player.css`, `scripts/export-slides.py`), the timel## Done on 16 November 2026

1. Figures and the laboratory draw the studied object with `--object-ink` (lines, words) and `--object` (fills), ochre;
   the canvas palette (`object-kit.js` `palette()`, the laboratory colour name `object`, the slide widgets `C.obj`)
   reads them. `--accent` (indigo) stays for brand and actions.
2. Reading text in Atkinson Hyperlegible instead of Source Serif 4: legible at small sizes and in the 13 px figure
   labels, set apart from the serif mathematics, made for low vision, and 190 KB less to load.
3. PDFs and Beamer lectures restyled through one brand file, `content/tex/core/mx-brand.sty` (style apart from content:
   the other core files are the same in both sites; `docs/TEX_STYLE_GUIDE.md`). Archivo titles, § sections, square
   boxes structured by rules, ochre chips, indigo title slide with Truchet tiles. Every PDF and lecture rebuilt.
4. The site's tokens moved to `site/styles/tokens.css`, imported by `explorer.css` and by the foundation lessons
   through `site/resources/basics/basics-theme.css`: the lessons keep only their data colours and follow the site's
   fonts, corners and both themes.
5. Share image `site/share.png` (1280 × 640, `scripts/share-image.py`, tile pattern), declared in `site/index.html`
   (Open Graph). Upload it by hand as the repository's social preview (GitHub, Settings, General, Social preview).

Still to do: `site/resources/document-theme.css` (generated HTML resource pages) keeps its own dark look.

t-theme.css`).
4. A share image (1280 × 640) for GitHub and social previews, built from the tile pattern.

The full brand guide (logo system, both palettes with contrast, components, slides, PDF page, share card) is the
canvas "Brand identity proposals", page "Pavage guide".

## Structure (16 November 2026, not part of the brand)

Owner request: "Learn" opened on the French curriculum with no way to choose one first. Cause: with no level in the
address and none remembered, `libraryPage` took the first course of the manifest (Seconde), and the level rails of
Lessons and Exercises listed only the French levels, so the published Malagasy levels (T10, T11 S) were unreachable
from them. Changes (`site/js/curriculum-picker.js`):

- An address without a level (`#resources`, `#bank`, `#slides`) opens a curriculum chooser: Malagasy and French with
  their levels, University and International as links to their own pages. Nothing is preselected.
- An address with a level opens it, under a line naming its curriculum, saying it is remembered on this device, and
  offering "Changer de programme". The remembered class still fills the navigation links (`navigation-state.js`).
- The level rails are grouped by curriculum, with "Autres programmes" (University, International) at the end. The
  Exercises chooser lists only levels with online exercises; the Malagasy card says there are none yet.
- Apprendre keeps six study tabs (Cours, Exercices, Réviser, Annales, Bases, Programmes, formerly Parcours) and folds
  the classroom tools (Diaporamas, Automatismes, Fiches, Dossier sur mesure) under "Pour enseigner", open on those pages
  and for the teacher profile.

## Polish (18 November 2026, not part of the brand)

Owner request: make the site look and work like a professional website (practical, intuitive, easy to navigate).
A critique of the live pages at 1440 and 390 px found that the phone chrome (header on two rows, page tabs on two
rows, chapter tabs on two rows) took about 500 px before any content, that the curriculum chooser repeated the level
rail beside it, that chapter lessons left a third of a wide screen empty, and that the footer was one flat row of
unrelated links. Changes (styles at the end of `site/styles/ergonomics.css`):

- Phone header on one row: mark, search, Menu. Profile, theme and language join the open menu under the sections.
- Phone page tabs and chapter tabs on one row that scrolls sideways, with a fade at the edge; the current tab is
  scrolled into view (`app.js` `bindCommon`).
- The chooser pages (`#resources`, `#bank`, `#slides` without a level) drop the rail at every width: the chooser is the
  list of levels.
- Chapter lesson, 1080 px and wider: "Dans ce cours" lists the ideas beside the text, stays in view and marks the idea
  being read (`chapter-sequence.js`, `aria-current="location"`). Narrower screens keep the list in the text.
- Footer: a site map of every section and page (from `SECTIONS`), then the other pages, with 44 px targets. Reaching
  it also loads the related-resources box, which sits just above it.
- Second round: the visitor home leads with two actions under the title ("Choisir mon programme et ma classe",
  "Chercher une notion"); "Par où commencer ?" becomes "Explorer librement" and "Tu viens pour travailler ?" becomes
  "Élève ou professeur ?" with what the choice does. The Exercises page loses its own "Par chapitre / Annales" switch:
  the Apprendre tabs already offer Exercices and Annales.

## Design skills (20 November 2026, same as Maths-explorer)

Two third-party skills sit in `.claude/skills/` and are used for every new or changed page, exhibit or control:
`frontend-design` (Anthropic, Apache 2.0) and `web-design-guidelines` (Vercel Web Interface Guidelines, MIT, rules pinned
in `rules.md`, project overrides in its `SKILL.md`). This document wins where they disagree. Rules from the first review:
phone first with the figure in reach (choices and question above a figure, its buttons right under it, measures after;
`.exhibit-band` in `site/styles/pages.css`); feedback lines keep their place; the phone header is one row of 64 px so
`scroll-padding-top` matches it; every drag has a button or key alternative.
