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
| Type | Newsreader (titles), Literata (reading), Instrument Sans (interface) | Instrument Serif (titles), Literata (reading), IBM Plex Sans and Mono (interface, coordinates) | Playwrite FR Moderne (titles, French school cursive), Caveat (everything else) | Archivo condensed capitals (titles), Literata (problems), JetBrains Mono (figures) |
| Shapes | Soft 14 px corners, placards ("Salle I" to "Salle VIII"), a cartel on each exhibit | Thin 6 px corners, thin glowing rules | Frames drawn around writing on the lines | Square corners, thick red bar, no rounding |
| Signature | Exhibit of the day drawing itself (chaos game); rooms that open in place | Live map of 24 fields joined by 34 links; lit stars are our courses; "Les grands assauts" | The page is a copybook; "Attrape le sommet !"; a quick challenge | Problem of the day with hint and solution; the 50 problems as squares by level |
| Holds | Curiosities (49), against intuition (11), fractals (14), laboratory (44), challenges (43), timelines (69 people, 82 advances), stories (23), biographies (61), famous errors (46) | Algèbre 1, Fondements, Mathématiques appliquées L1, Séries de Fourier; the foundation lessons (`#basics`); the topic map, merged with the map of fields | Lycée malgache (T10, T11 S, T12 C, T12 D), Lycée français (Seconde, Première, Terminale, Maths expertes), International (IB, SAT) | 10 strategies, 50 problems: national selection 20, pan-African 19, international 11; warm-ups chosen from the Défis |

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
  durations rounded to the century, marked "environ"); problems still open, with
  how long they have resisted. Announced attempts are not listed (owner, 22 November 2026): an open problem such as
  the Riemann hypothesis shows « Ouvert au <date> », the date its status was last checked; re-check before each
  publication and update the date.
- French typography: narrow non-breaking space before ? ! ; : in French text.
- No countdown or stopwatch in the Olympiad world (owner).

## 7. Accessibility and motion

Kept from `PROJECT_BRIEF.md` section 6: phone first, no horizontal scroll at 320 px, 44 px targets, readable at 200 %
text, visible focus, keyboard for every interactive figure, contrast checked per world, nothing moves under reduced
motion (every live drawing renders its final state instead). Handwriting is a deliberate choice for the Lycée world
(section 8, decision 6); its legibility is checked at 200 % text like every other world.

## 8. Owner decisions (22 November 2026)

1. **"Course text first."** `PROJECT_BRIEF.md` section 6 ("Experiment first: the manipulable figure is the main content
   of a chapter") is amended in the switch pull request (`docs/REBUILD_PLAN.md`, stage 8): the course text comes first
   and each figure sits inside the paragraph it illustrates.
2. **Défis as warm-ups.** The 43 challenges stay in the Musée; a selection also appears in the Olympiades as warm-ups,
   referenced by id (one source, never copied).
3. **International** (IB, SAT) is a notebook of the Lycée world, distinct from the Malagasy and French ones.
4. **Foundations and the topic map go to the Université world.** The foundation lessons (`#basics`: place value,
   operations, fractions, sets, logic) sit beside the course "Fondements mathématiques"; the topic map (`#topics`)
   merges with the map of the fields of mathematics.
5. **Teacher modes kept.** The in-class launch pad and "Ma séance" of `docs/TEACHER_STRUCTURE.md` stay, restyled per
   world; the chapter page actions (Exercices, Projeter) lead into them.
6. **Lycée handwriting: Caveat** for all text (a clear ballpoint hand, chosen after comparing Kalam, Caveat, Playwrite
   FR Moderne, Shantell Sans, Patrick Hand and Playpen Sans on the ruling), **Playwrite FR Moderne** (French school
   cursive) for titles. Owner rule: closest to handwriting while readable and clear. Small letters stay one interline
   tall (about 22 px Caveat), every baseline on a heavy line (prototype: 36 of 36 text blocks of the chapter).

## 9. What this supersedes when built

The palette, type, shapes and home of `docs/DESIGN_V7.md`. The purpose rules of `docs/DESIGN_V3.md` and
`PROJECT_BRIEF.md` section 6 stay, amended by decision 1 above. Maths-explorer keeps its own design (owner, 20 November
2026); content changes still flow both ways under the independence rule of `CLAUDE.md`.

## Figure and console (22 November 2026)

Owner: "controls beside the figure on large horizontal screens, always on the same screen as the canvas". Same pass as
Maths-explorer, made with the Impeccable design skill (Paul Bakaus, Apache 2.0; installed for the user, not in this
repository): its Operate, Layout and Craft-floor playbooks. The rules live in `site/js/figure-layout.js` and
`site/styles/figure-layout.css`:
- An exhibit is a strip of two panels: the figure, and the console of its controls. Wide figure area (860 px and more):
  the console beside the figure, top-aligned and sticky, the figure never taller than the viewport under the header.
  Narrow: figure, its caption, the console, then plots and notes, in the page and in the keyboard order.
- Weight follows priority inside the console: the main action on its own row, first (a transport joins back, play and
  forward, with the timeline under it); parameters next; secondary actions are cells of equal size in one joined
  toolbar; exactly one pressed button in a group is a choice (`data-fig="choice"`), other pressed buttons are on/off
  toggles; example lists are rows of one list; live values are a table; the help line closes it. A choice of three is
  one row of three cells; a choice of five or more is two columns, the odd last cell across.
- `figure-layout.css` sets layout only (places, sizes, order, joined cells, the panel frame). How a control looks and
  shows its state (indigo fill for a choice, fill and check mark for a toggle, square corners, no shadow, hover) comes
  from `styles/controls.css` alone, which lists the console choice among the choices of one (22 November 2026, after
  the console's own hover backgrounds left picked choices and the Life buttons unreadable on hover).
- An inset (`data-fig-inset`) is a small map that drives the figure (the Wythoff triangle): in the figure's top left
  corner when the console is beside it, back in the console on a narrow screen.
- Budget: at 1600 × 900 the console holds without scrolling inside. When it does not, move out what is not a control
  (a question to answer goes under the figure, facts the caption already states leave the metrics), put a label beside
  its list, join secondary actions in one row.
- The sentence that says what the figure shows is its caption, under it, one fact per line.
- The laboratory card (`.lab2-card`) speaks the same language: scenes as one list, segments as joined cells.
