# Algèbre 1: sources

One file per lesson, in the order of `manifest.json` (`university.sections[id=algebre-1].sequences[].source`).
`scripts/build-algebre1.py` parses each file once and renders the web lessons
(`dist/resources/university/algebre-1/lecons/`) and the three PDF editions (cours, exercices, corrigés) from the same
tree. Titles, summaries and outlines reach the site through `content/data/algebre1-build.json`; do not copy them into
the manifest.

The exercises follow the mastery guide: four
rubrics (A techniques, B proofs, C decisions and counterexamples, D synthesis) and three levels (S, A, D).

## Dialect (a small subset of LaTeX)

| Write | Meaning |
|---|---|
| `\chapitre[English prerequisites]{n}{Titre}{English title}` | lesson head; `n` is the chapter number, or a word (Guide, Synthèse) for an unnumbered lesson, or `Kicker\|prefix` for an unnumbered lesson whose boxes, exercises and QCM carry their own prefix (`Complément au chapitre 4\|4C`: Proposition 4C.5) |
| `\resume{...}`, `\summary{...}` | one-paragraph summary, French and English (site cards) |
| `\begin{objectifs} \item ... \end{objectifs}`, `\begin{prerequis} ... \end{prerequis}` | lesson head boxes |
| `\section{...}`, `\subsection{...}` | numbered § in the chapter |
| `\begin{definition}[titre] ... \end{definition}` | also `theoreme`, `proposition`, `lemme`, `corollaire`, `exemple` (numbered), `methode`, `remarque`, `attention`, `intuition`, `essentiel`, `histoire` (unnumbered) |
| `\label{key}` inside a box or an exercise, `\voir{key}` anywhere | cross-reference, rendered "Théorème 4.7" with a link |
| `\begin{preuve}[titre] ... \end{preuve}` | proof (open by default on the web) |
| `\widget{venn}`, `\widget[ring]{zn}` | interactive figure (`site/js/algebra1-widgets.js`): `venn`, `maps`, `zn`, `lu`, `cayley`, `perms`, `dihedral`, `burnside` (colourings up to symmetry); a note in the PDFs |
| `\exercices` | starts the exercise part of the lesson |
| `\rubrique{A}` | rubric A, B, C or D |
| `\begin{exo}[S][titre] ... \begin{indication} ... \end{indication} \begin{corrige} ... \end{corrige} \end{exo}` | exercise, level S, A or D |
| `\begin{qcm}[titre] intro \begin{question} ... \end{question} ... \end{qcm}` | a QCM series (numbered QCM 4.1, anchor `<lesson id>-qcm-<k>`), placed after `\exercices`; web: instant or end-of-series correction (`site/js/algebra1-widgets.js`, grading in `algebra1-model.js`); PDF: questions in the exercise edition, explained answers in the solutions edition |
| `\banque{c1}` | after `\exercices`: the chapter's question bank (`site/js/algebra1-bank-<key>.js`, keys `c1`, `c2`, `c3`, `c4`, `c4c`, `c5`): series of 10 to 30 QCM or short-answer quiz questions drawn at random, with a replayable code; the lesson's own `qcm` questions join the QCM draws; a note in the exercise PDF |
| `\begin{question}[plusieurs] Énoncé. \choix{texte}{retour} \bonchoix{texte}{retour} \begin{explication} ... \end{explication} \end{question}` | one question: `[plusieurs]` for one or more right answers (checkboxes), none for exactly one (radio buttons). At least three choices, each with its own feedback, and an explanation; the builder refuses anything else. Choices are shuffled on the web: never write « les deux précédentes » or « aucune des réponses ». A question counts as right only if exactly the right choices are ticked |
| `\begin{erreurs} \item ... \end{erreurs}`, `\begin{bilan} \item ... \end{bilan}` | frequent errors; self-assessment checklist |
| `\begin{tabular}{ll} a & b \\ ... \end{tabular}` | simple table, first row is the header |
| `$...$`, `\[...\]`, `\begin{align*}` | mathematics; macros from `MACROS` in the builder (`\Z`, `\K`, `\Ker`, `\Img`, `\GL`, `\cl{a}`, `\ens{...}`, `\parties`, `\Card`, `\tr`...) |
| `\textbf`, `\emph`, `\og ... \fg`, `\nom{Cantor}`, `\href{url}{text}`, `~` | inline text |

A reference after a word that names its kind (`le théorème \voir{thm-x}`, `l'exercice \voir{exo-y}`) prints only the number; alone, `\voir{thm-x}` prints « Théorème 4.7 ».

No em or en dashes in the text.
