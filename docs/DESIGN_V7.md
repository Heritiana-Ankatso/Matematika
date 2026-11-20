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
