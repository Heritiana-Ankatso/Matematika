# Claude Code entry point: Matematika

**Edition rule (owner, 14 November 2026, hard rule): Matematika is the full version.** Its scope is everything: the
French lycée curriculum, the Malagasy curriculum (T10, T11, T12 C and D), the international curricula (IB, SAT),
Olympiad, university, and every shared collection (laboratory, galleries, curiosities, foundations, challenges,
history, reading). T12 C and D are planned, not yet published (step 4 of the owner's plan). Maths-explorer (https://github.com/ARHeritiana/Maths-explorer) is the limited edition: the French
lycée curriculum only. Matematika must never lack anything Maths-explorer has.

**Curricula stay distinct.** Malagasy, French, IB, SAT and Olympiad are separate curricula, each with its own levels
and chapters; never merge or relabel one as another.

## Current state (until the source moves here)

- This repository holds only the built site. The source is still in Maths-explorer; the full edition is that code built
  with `FULL_EDITION = true` in `site/js/live-curriculum.js`, plus the Mikajy Atlas download link in `js/config.js`.
- Making Matematika the source repository is step 2 of the owner's plan (private handoff
  `coordination/handoff-20261113/README.md` in ARHeritiana/Maths-explorer-backup). Until it is done, update this site
  with the sync recipe of Maths-explorer's `CLAUDE.md`: `FULL_EDITION = true`, `make site`, rsync `dist/` here
  (excluding `LICENSE*`, `README.md`, `.nojekyll`, `CLAUDE.md`), commit with this repository's author identity, push,
  then restore the flag in Maths-explorer.
- Every sync must keep the Atlas link and must leave nothing of Maths-explorer behind: compare before pushing.

## Publishing

GitHub Pages serves branch `main`, root folder (https://heritiana-ankatso.github.io/Matematika/). **A push to `main`
is live at once**, and every file at the root is public, this one included: never put private material, credentials
or personal details in this repository. Work on a feature branch and open a pull request; merge only once verified,
with a rollback note (revert the merge commit).

## Language rule (owner, 11 November 2026)

Each lesson is written in its target language(s). French curriculum: French. Malagasy curriculum: French.
International curricula: English. University: the input language of the resource, or bilingual. Foundations,
Olympiad, problems, galleries and all extra-curricular activities: bilingual (French and English).

## Private material

Audits, drafts, review ledgers and handoffs live in the private repository ARHeritiana/Maths-explorer-backup, never
here.
