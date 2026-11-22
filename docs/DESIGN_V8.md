# Design v8: brief for the rebuild (21 November 2026, draft)

Status: **brief agreed with the owner, direction not chosen yet.** Three clickable prototypes of the same screens
(home, chapter page, projection) are presented to the owner; the chosen one becomes the look and structure of v8, and
this file then records it. Until then `docs/DESIGN_V7.md` stays the current look and nothing in `site/` changes.

## Why a rebuild, not a patch

Measured on `main` (`2cc61f8`, local server, Chromium, no network throttling), 21 November 2026:

- Opening `#home` downloads 532 resources, 513 of them JavaScript modules, about 7.5 MB uncompressed. The largest are
  the course catalogue data (893 KB), the resource data (324 KB), the knot catalogue (164 KB), the major biographies
  (137 KB) and the Première and Terminale exercise generators (88 to 106 KB each): none is needed on the home page.
  First contentful paint 0.9 s on localhost; not yet measured on a throttled mobile network.
- About 3,700 lines of CSS (`site/styles/`, `pages.css` alone 1,746 lines) built up over five looks (v3 to v7).
- Every page uses the same visual pattern (hairline-ruled text lists), so nothing has priority; on phones some lists
  break (class rows of `#resources` shrink to their text).

The causes are structural (what loads, what each page is for), so a new skin would not fix them.

## Brief (owner answers, 21 November 2026)

| Question | Answer |
|---|---|
| Who first | **Teachers** (the owner and colleagues). |
| Where | **Phone over mobile data** and **laptop at home**. |
| Feeling | **Calm and serious.** |
| Depth | **Rebuild the foundations**: page structure, loading and style system may change; content is kept. |
| Main tasks | **Prepare a lesson** and **project in class**. |
| Curricula leading | **University and lycée equally** (Malagasy and French). International and Olympiad are secondary entrances. Curricula stay distinct (`CLAUDE.md`). |
| Chapter page gives, in order | 1. **the full course text** (definitions, theorems, proofs, examples), 2. **exercises with solutions**. Downloads and figures remain, after these. |
| Projection | **Slide decks** (prepared, step-by-step, live figures inside), opened from the chapter. |
| Collections (curiosities, labs, fractals, stories, biographies, challenges) | **Resources for class**: each is attached to the chapters it serves. |
| Hard technical limit | **Static site on GitHub Pages.** A framework, new addresses and a new style system are allowed. |
| Reference | None: judged on prototypes. |

## Consequences

1. **The chapter page is the centre of the site.** Home leads to a chapter in at most three choices (curriculum, level,
   chapter), and remembers the last one.
2. **Each page loads only its own code and data.** The home page must not load exercise generators, catalogues of
   other pages or gallery data. Target to be set after the throttled measurement.
3. **Typography carries the look.** Course text set like a book (measure about 70 characters, numbered statements,
   proofs, mathematics at text quality). Colour stays for meaning.
4. **Collections move into chapters.** A curiosity or experiment appears in the chapter it serves; the collection
   pages remain as indexes, quieter, out of the main path.
5. **Kept regardless of the rebuild:** every feature Maths-explorer has (`CLAUDE.md` edition rule); old addresses
   redirect to the new ones, so links already shared keep working.

## Owner decision needed: the "experiment first" rule

`PROJECT_BRIEF.md` section 6 says: "Experiment first: the manipulable figure is the main content of a chapter, and the
first screen offers a way into one." This brief puts the course text first and figures after the text and exercises.
The two conflict on the chapter page. The prototypes follow this brief (text first, each figure inside the paragraph
it illustrates). If the owner confirms, section 6 of `PROJECT_BRIEF.md` is amended in the same change as the chosen
design.

## Relation to `docs/TEACHER_STRUCTURE.md`

Its modes map onto the brief: Préparer = prepare a lesson (chapter page), En classe = project (decks, launch pad).
Détente becomes the collection indexes. Which parts of the launch pad survive is decided with the chosen prototype.

## Prototypes

Same three screens in each, built from real sources: Algèbre 1, chapter 1 "Théorie naïve des ensembles"
(`content/university/algebre-1/01-ensembles.tex`) and Malagasy T11 S, chapter 1 "Généralités sur les fonctions
numériques" (`content/tex/courses/mada-t11s/c01.fr.tex`, unpublished; the prototypes are private and not in `dist/`).

| | Direction | Idea |
|---|---|---|
| A | Livre (book) | The chapter is a well-set book page: one column, running heads, margin notes, statements in the text flow. |
| B | Documentation | A permanent chapter sidebar and outline, fast search and jumps; built for looking up and preparing. |
| C | Dossier | A chapter is a teacher's folder: tabs Cours, Exercices, Projeter, with the session's material at hand. |

Next, once a direction is chosen: the technical plan (loading per page, page structure, style system), then a rebuild
in stages, one pull request each.

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
