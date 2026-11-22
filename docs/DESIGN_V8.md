# Design v8: four worlds (direction chosen 22 November 2026)

Status: **direction approved by the owner on 22 November 2026, not built yet.** `docs/DESIGN_V7.md` stays the live look
until the switch described in `docs/REBUILD_PLAN.md` (stage 8). The clickable prototype was reviewed with the owner and
is kept privately (it contains the unpublished native T11 S chapter 1); it is not in this repository.

How it was reached: a first brief (21 November), three rejected directions (Livre, Documentation, Dossier), then
"Nuit et or", then the four worlds below, refined in nine rounds of owner review.

## 1. Why a rebuild, not a patch

Measured on `main` (`9d88599`, local server, Chromium, no throttling), 22 November 2026:

| Page | Requests | of which JavaScript | Transferred, gzip estimate |
|---|---|---|---|
| `#home` | 535 | 516 | about 2.7 MB |
| `#chapter/t11s-01` | 537 | 517 | about 3.4 MB |
| `#lab` | 535 | 516 | about 2.7 MB |

Every page loads almost the whole site: `site/js/app.js` statically imports 50 modules, which pull in the rest (course
catalogue 893 KB raw, exercise generators of every class, gallery data, biographies). CSS has grown to about 3,700
lines over five looks (v3 to v7). Every page uses the same hairline-list pattern, so nothing has priority. These causes
are structural; a new skin would not remove them.

## 2. Brief (owner, 21 and 22 November 2026)

| Question | Answer |
|---|---|
| Audiences | Teachers first for the courses; **and** casual visitors, enthusiasts, students and laypeople, drawn in by the museum. The site must show how beautiful and how vast mathematics is, and that ideas nobody suspected are studied seriously. |
| Devices | Phone over mobile data, and laptop at home. |
| Depth | Rebuild the foundations; content is kept. Only hard limit: a static site on GitHub Pages. |
| Teacher tasks | Prepare a lesson (full course text first, then exercises with solutions) and project in class (slide decks). |
| Menus | **Folded by default.** The visitor sees only the top-level choices and opens what they want. |
| Curricula | Stay distinct (`CLAUDE.md`): Malagasy, French, international, university and Olympiad are never merged. |

## 3. The four worlds

One site, one structure, four committed atmospheres. A world is chosen by `data-world` on the root element; every
component reads the world's tokens. Each world is either night or day by design: there is no Jour/Nuit switch, except
in projection (below).

| | Musée | Université | Lycée | Olympiades |
|---|---|---|---|---|
| Feeling (owner) | Solemn: galleries of curiosities, timelines of great minds; the visitor contemplates the marvels of mathematics. | Mesmerising: living at the edge of human knowledge, the vastness of mathematics. | Building the ground of the knowledge to come: teenage, playful, dynamic, curious. | A competitive place: challenging, fast, sharp. |
| Ground | Night blue `#121826`, panels `#1b2336` | Deep space `#04050b`, panels `#0b0e1c` | White page, Seyès ruling (section 5) | Black `#0a0b0d`, panels `#131519` |
| Ink | Warm white `#e8e6df` | `#eceeff` | Pen blue `#1b3796` | `#f5f6f8` |
| Accent | Gold `#d9b25f` | Violet `#a594ff`, cyan `#62e3ea` | Red pen `#d22f45`, green pen `#16804f` | Signal red `#ff3b30` |
| Type | Newsreader (titles), Literata (reading), Instrument Sans (interface) | Instrument Serif (titles), Literata (reading), IBM Plex Sans and Mono (interface, coordinates) | Playwrite FR Moderne (titles, French school cursive), Kalam (everything else) | Archivo condensed capitals (titles), Literata (problems), JetBrains Mono (figures) |
| Shapes | Soft 14 px corners, placards ("Salle I" to "Salle VIII"), a cartel on each exhibit | Thin 6 px corners, thin glowing rules | Frames drawn around writing on the lines | Square corners, thick red bar, no rounding |
| Signature | Exhibit of the day drawing itself (chaos game); rooms that open in place | Live map of 24 fields joined by 34 links; lit stars are our courses; "Les grands assauts" | The page is a copybook; "Attrape le sommet !"; a quick challenge | Problem of the day with hint and solution; the 50 problems as squares by level |
| Holds | Curiosities (49), against intuition (11), fractals (14), laboratory (44), challenges (43), timelines (69 people, 82 advances), stories (23), biographies (61), famous errors (46) | Algèbre 1, Fondements, Mathématiques appliquées L1, Séries de Fourier | Lycée malgache (T10, T11 S, T12 C, T12 D), Lycée français (Seconde, Première, Terminale, Maths expertes), International (IB, SAT) | 10 strategies, 50 problems: national selection 20, pan-African 19, international 11 |

Counts are read from the source files on 22 November 2026; the build must compute them, never type them.

## 4. Shared frame

- **Threshold (home).** "Quatre mondes, une seule passion." Four doors, each already in its world's look, ground and
  colour, with a solid 2 px frame in the world's accent so the four are distinct from each other and from the page. A
  click anywhere on a door enters (no "Entrer" label). On phones the four doors share the first screen as four bands
  (name and short line left, live drawing right); verified down to 360 × 640.
- **Top bar.** Brand, one folded world menu, search. Nothing else is unfolded by default.
- **Folding.** Rooms, notebooks, levels, chapter lists, courses: closed until clicked, one open at a time.
- **Chapter page** (Lycée and Université). The course text and a slim outline that follows the reading. Everything
  else on demand: Exercices (side sheet, solutions one by one or all), chapter information (objectives, prerequisites,
  files), Projeter. Proofs are folded under "Démonstration".
- **Projection.** Slide decks with step-by-step reveal and live figures; a "Fond clair / Fond sombre" switch that is
  remembered, because classroom projectors wash out dark slides.
- **Exhibit page** (Musée). Hook, live figure, "Ce qui se passe" with the mathematics, "Où on la rencontre", links back
  to the chapters it serves ("Dans les cours"), and the same room.

## 5. The Lycée copybook (exact rules)

- Seyès ruling: heavy lines every 8 mm (32 px) in both directions, three fine horizontal lines between (every 2 mm,
  8 px), violet-blue. **The margin line is the first vertical line, drawn in red; left of it there are no vertical
  lines**, only the horizontal ruling. The chapter outline is written in the margin.
- Writing sits on the ruling: every line of text has its baseline on a heavy line; small letters are one interline
  tall; titles take two lines. Sizes come from the fonts' measured x-height, and a small script moves each text block to
  the next heavy line after fonts, formulas, resizing and proof folding (prototype: every text block of the chapter
  measured on a heavy line at 390 and 1280 px).
- Blue pen for writing; red pen for titles, numbers and double underlining of key words; green frame for definitions,
  red frame for theorems. **No yellow highlighter** (owner: it reads as generated). Frames are transparent: the ruling
  shows through.
- Notebook covers: Lycée malgache uses the flag of Madagascar (white band at the hoist, then red over green); Lycée
  français uses blue, white, red; International is deep navy with fine meridians.
- Mathematics stays typeset (handwriting fonts cannot set fractions and roots), in pen blue.

## 6. Content rules from the review

- Exhibits are real site content; counts and titles are generated from the sources.
- "Les grands assauts" (Université): problems that fell, with dates, solvers and how long they resisted (ancient
  durations rounded to the century, marked "environ"); problems announced and under review; problems still open, with
  how long they have resisted. The Riemann hypothesis is listed as **announced** (20 November 2026, formal proof in Lean,
  community review in progress) until the mathematical community accepts it; re-check before each publication.
- French typography: narrow non-breaking space before ? ! ; : in French text.
- No countdown or stopwatch in the Olympiad world (owner).

## 7. Accessibility and motion

Kept from `PROJECT_BRIEF.md` section 6: phone first, no horizontal scroll at 320 px, 44 px targets, readable at 200 %
text, visible focus, keyboard for every interactive figure, contrast checked per world, nothing moves under reduced
motion (every live drawing renders its final state instead). Handwriting is a deliberate choice for the Lycée world;
the reading size and the cursive/print split are owner decisions (section 8).

## 8. Owner decisions still open

1. `PROJECT_BRIEF.md` section 6, "Experiment first: the manipulable figure is the main content of a chapter", conflicts
   with "course text first". Amend it in the switch pull request?
2. Défis (43 puzzles) live in the Musée; should some appear in the Olympiades as warm-ups?
3. International (IB, SAT) is a notebook of the Lycée world, distinct from the others. Confirm.
4. Foundations (`#basics`: place value, operations, fractions, sets, logic) and the topic map (`#topics`): which world?
   Proposal: foundations in the Lycée world ("Les bases"), topics folded into search.
5. Teacher modes of `docs/TEACHER_STRUCTURE.md` (Préparer, En classe, Détente): the chapter page actions and projection
   replace Préparer and En classe; Détente becomes the Musée. Keep the launch pad and "Ma séance"?
6. Lycée reading: body text in print handwriting (Kalam, about 15 px so small letters fill one interline) or in
   cursive, or letters two interlines tall (larger, like younger pupils write).

## 9. What this supersedes when built

The palette, type, shapes and home of `docs/DESIGN_V7.md`. The purpose rules of `docs/DESIGN_V3.md` and
`PROJECT_BRIEF.md` section 6 stay, except decision 1 above. Maths-explorer keeps its own design (owner, 20 November
2026); content changes still flow both ways under the independence rule of `CLAUDE.md`.
