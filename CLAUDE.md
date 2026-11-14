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
  with `FULL_EDITION = true` in `site/js/live-curriculum.js`. The name Matematika and the Mikajy Atlas link follow that
  flag in the source: never patch the files here by hand. The Atlas URL itself is kept only here, in
  `.github/edition.env` (`MX_ATLAS_URL`), because the account it names must not be written in Maths-explorer; the full
  build there needs it (`MX_ATLAS_URL=... make site`).
- Making Matematika the source repository is step 2 of the owner's plan (private handoff
  `coordination/handoff-20261113/README.md` in ARHeritiana/Maths-explorer-backup). Until it is done, update this site
  with the sync recipe of Maths-explorer's `CLAUDE.md`: `FULL_EDITION = true`, `make site`, copy `dist/` here
  (keeping `LICENSE*`, `README.md`, `.nojekyll`, `CLAUDE.md` and `.github/`), then follow the git rule below, and
  restore the flag in Maths-explorer.
- Every sync must leave nothing of Maths-explorer behind: compare before pushing.

## Git rule (owner, 14 November 2026, binding in every session)

Same rule as Maths-explorer (its `CLAUDE.md`): every change goes through a branch and a pull request. Start a branch from
an up-to-date `main` (a session branch is fine), commit there with this repository's author identity, push it and open
a pull request, ready for review, whose text gives the changes, the verification and a rollback note. This repository
has no CI: the verification is the source's (green CI on the Maths-explorer commit the build comes from) plus a check
of the built site in a browser under `/Matematika/`, written in the pull request. Merge only when that is done and there
is no conflict; use a squash merge, so `main` gets one commit per pull request. Never push or force-push to `main`
directly. The agent may merge its own verified pull request unless the owner asked to review it first. After the
merge, delete the branch; when the session cannot, list it for the owner.

## Publishing

`.github/workflows/pages.yml` publishes the site on every push to `main` (https://heritiana-ankatso.github.io/Matematika/),
without `CLAUDE.md` and `.github/`. It needs the Pages source set to "GitHub Actions" (Settings > Pages > Build and
deployment); while the source is still "Deploy from a branch", Pages serves the branch itself, this file included
(`.github/` is never served). **A merge to `main` is live at once.** Never put private material, credentials or personal
details in this repository (the site is public).

## Language rule (owner, 11 November 2026)

Each lesson is written in its target language(s). French curriculum: French. Malagasy curriculum: French.
International curricula: English. University: the input language of the resource, or bilingual. Foundations,
Olympiad, problems, galleries and all extra-curricular activities: bilingual (French and English).

## Private material

Audits, drafts, review ledgers and handoffs live in the private repository ARHeritiana/Maths-explorer-backup, never
here.
