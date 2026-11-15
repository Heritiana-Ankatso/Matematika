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
| Meaning | `--accent` indigo = brand and actions (`#2c3d8f` Jour, `#8c9bff` Nuit); `--object` ochre = the studied object as a fill (`#c98b1e`, graphite on it), `--object-ink` for its lines and words (`#8a5a00` Jour, 4.9:1); `--obj2` laterite = second object; `--pos` moss = valid; `--neg` crimson = error, always with an icon and a word. |
| Data colours | `--c1…--c8` are unchanged: they are data (graph colourings, series), not interface. |
| Type | Archivo (SIL OFL, self-hosted, `site/fonts/`) for headings and interface; width 125 for page titles and the name, 112 for h1 and h2. Source Serif 4 (SIL OFL) for reading. STIX Two for mathematics. |
| Shape | square corners (`--r` 0), circles stay circles. Structure by 2 px graphite rules, 1 px hairlines in tables, an 8 px rule opens the page. No shadow, gradient, blur or glow. |
| Buttons | primary: indigo, graphite on hover. Secondary: graphite outline, filled on hover. Quiet: underlined text. Focus: 3 px indigo ring in Jour, ochre in Nuit. |
| Motion | none for decoration; a figure eases to its new state. Nothing moves under reduced motion. |
| Voice | state the idea plainly, then show where it reaches; give place, date and source of every historical claim; never present one culture as the origin of an idea several found; Malagasy, French and English copy are equals, each read by a native speaker. |

## Done in this change

Tokens of both themes (`site/styles/explorer.css`), the v6 override block of `site/styles/pages.css` adapted for v7,
the mark and favicon, the theme colour of the browser bar (`site/index.html`, `site/js/ui.js`), the slide player
tokens and fonts (`site/slides/player.css`, `scripts/export-slides.py`), the timeline page mark. Schibsted Grotesk left
the site (it stays in the TeX sources until the PDFs are restyled).

## Still to do

1. Figures and the laboratory still draw the studied object with `--accent` (indigo). Moving it to `--object` (ochre)
   needs the figure and laboratory engines to read the new token.
2. PDFs and Beamer lectures (`content/tex/core/`) still use the v6 palette and Schibsted Grotesk: restyle them, then
   rebuild every PDF.
3. Standalone pages with their own style (`site/resources/basics/*.html`, `site/resources/document-theme.css`).
4. A share image (1280 × 640) for GitHub and social previews, built from the tile pattern.

The full brand guide (logo system, both palettes with contrast, components, slides, PDF page, share card) is the
canvas "Brand identity proposals", page "Pavage guide".
