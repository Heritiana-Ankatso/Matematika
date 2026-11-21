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
