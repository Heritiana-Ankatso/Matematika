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
| `\chapitre[English prerequisites]{n}{Titre}{English title}` | lesson head; `n` is the chapter number, or a word (Guide, Synthèse) for an unnumbered lesson |
| `\resume{...}`, `\summary{...}` | one-paragraph summary, French and English (site cards) |
| `\begin{objectifs} \item ... \end{objectifs}`, `\begin{prerequis} ... \end{prerequis}` | lesson head boxes |
| `\section{...}`, `\subsection{...}` | numbered § in the chapter |
| `\begin{definition}[titre] ... \end{definition}` | also `theoreme`, `proposition`, `lemme`, `corollaire`, `exemple` (numbered), `methode`, `remarque`, `attention`, `intuition`, `essentiel`, `histoire` (unnumbered) |
| `\label{key}` inside a box or an exercise, `\voir{key}` anywhere | cross-reference, rendered "Théorème 4.7" with a link |
| `\begin{preuve}[titre] ... \end{preuve}` | proof (open by default on the web) |
| `\widget{venn}`, `\widget[ring]{zn}` | interactive figure (`site/js/algebra1-widgets.js`): `venn`, `maps`, `zn`, `lu`, `cayley`, `perms`, `dihedral`; a note in the PDFs |
| `\exercices` | starts the exercise part of the lesson |
| `\rubrique{A}` | rubric A, B, C or D |
| `\begin{exo}[S][titre] ... \begin{indication} ... \end{indication} \begin{corrige} ... \end{corrige} \end{exo}` | exercise, level S, A or D |
| `\begin{erreurs} \item ... \end{erreurs}`, `\begin{bilan} \item ... \end{bilan}` | frequent errors; self-assessment checklist |
| `\begin{tabular}{ll} a & b \\ ... \end{tabular}` | simple table, first row is the header |
| `$...$`, `\[...\]`, `\begin{align*}` | mathematics; macros from `MACROS` in the builder (`\Z`, `\K`, `\Ker`, `\Img`, `\GL`, `\cl{a}`, `\ens{...}`, `\parties`, `\Card`, `\tr`...) |
| `\site{lab/rubik}{texte}` | a page of the site (hash without `#`): a link opened in the whole window on the web, the text followed by « (site Matematika) » in the PDFs |
| `\textbf`, `\emph`, `\og ... \fg`, `\nom{Cantor}`, `\href{url}{text}`, `~` | inline text |

No em or en dashes in the text.
