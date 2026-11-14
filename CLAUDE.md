# Claude Code entry point: Matematika

**Edition rule (owner, 14 November 2026, hard rule): Matematika is the full version.** Its scope is everything: the
French lycée curriculum, the Malagasy curriculum (T10, T11, T12 C and D), the international curricula (IB, SAT),
Olympiad, university, and every shared collection (laboratory, galleries, curiosities, foundations, challenges,
history, reading). T12 C and D are planned, not yet published (step 4 of the owner's plan). Maths-explorer
(https://github.com/ARHeritiana/Maths-explorer) is the limited edition: the French lycée curriculum only. Matematika
must never lack anything Maths-explorer has.

**Curricula stay distinct.** Malagasy, French, IB, SAT and Olympiad are separate curricula, each with its own levels
and chapters; never merge or relabel one as another.

## Source repository (since 14 November 2026, step 2 of the owner's plan)

- This repository holds its own source (`site/`, `content/`, `build/`, `scripts/`, `tests/`, `docs/`) and the built
  site `dist/`, committed because Pages has no build step. It started as Maths-explorer `da8a6bc`; the build of that
  source reproduced the previously served site byte for byte.
- `FULL_EDITION = true` in `site/js/live-curriculum.js`, for good: never set it to false here. The site name and
  description come from `content/data/edition.json` (key `full`). The Mikajy Atlas URL is kept in
  `.github/edition.env` (`MX_ATLAS_URL`); `make site` reads it from there (`build/mxbuild/site.py` `edition_env`).
- `tests/banned.py` allows exactly one use of the banned account name: the addresses of the account that publishes
  this site (known by its hash). The name anywhere else is still reported.
- Until step 3 of the plan (the owner's private handoff `coordination/handoff-20261113/README.md` in
  ARHeritiana/Maths-explorer-backup) the two repositories share the same code. A source change made in Maths-explorer
  is made here too in the same round (apply its diff, `make site`, pull request), and the reverse for any change that
  is not specific to the full edition. Files that differ on purpose: this `CLAUDE.md`, `README.md`,
  `.github/edition.env`, `.github/workflows/pages.yml`, `FULL_EDITION`, `edition_env` in `build/mxbuild/site.py`, the
  own-account exception in `tests/banned.py`, and `dist/`. Never copy Maths-explorer's `dist/` here.

## Git rule (owner, 14 November 2026, binding in every session)

Every change goes through a branch and a pull request. Start a branch from an up-to-date `main` (a session branch is
fine), commit there with this repository's author identity, push it and open a pull request, ready for review, whose
text gives the changes, the verification and a rollback note. Merge only when CI ("Website checks": `check` and
`browser`) is green on the branch's last commit and there is no conflict; use a squash merge, so `main` gets one commit
per pull request. Never push or force-push to `main` directly. The agent may merge its own green pull request unless
the owner asked to review it first. After the merge, delete the branch; when the session cannot, list it for the owner.

## Publishing

`.github/workflows/pages.yml` publishes `dist/` on every push to `main` (https://heritiana-ankatso.github.io/Matematika/);
nothing outside `dist/` is served. **A merge to `main` is live at once.** Never put private material, credentials or
personal details in this repository (the site is public). Audits, drafts, review ledgers and handoffs live in the
private repository ARHeritiana/Maths-explorer-backup, never here.

**Language rule (owner, 11 November 2026):** each lesson is written in its target language(s). French curriculum: French. Malagasy curriculum: French. International curricula: English. University: the input language of the resource, or bilingual. Foundations (`#basics`), Olympiad, problems, galleries and all extra-curricular activities: bilingual (French and English). Existing English editions of curriculum lessons are kept as they are.
Details: `PROJECT_BRIEF.md` section 3. There is no pending bilingual goal for curriculum lessons and no reminder to give.

**Long agent work (owner, 25 October 2026):** review and audit work runs from the committed queue
`course-quality/queue/` of the private repository (`QUEUE.json`, `README.md`, `REVIEW-BRIEF.md`): one result file per
finished unit, at most two agents at once, outputs committed after each batch, and a scheduled resume at the reset time
when a usage limit stops agents. Any session continues from the queue, never from memory.

## How to work efficiently here (owner instruction, 18 October 2026)

Do not read the whole repository. For every task:

1. Read `PROJECT_BRIEF.md` (governing rules; short) and, from `HANDOFF.md`, the state table and the task queue.
   `AGENTS.md` repeats the repository rules.
2. Find the task in the router of `MAP.md` (imported below) and open only the files it names. The folder you work in
   has a `CLAUDE.md` index that loads when you open a file there; use it instead of listing the folder.
3. For a recurring task (new challenge, lab, course PDF change, slide widget, release), follow the recipe in the
   `maths-explorer-tasks` skill.
4. Never read `dist/`, generated files, `docs/history/` or `docs/LOG.md` unless the task is about them (MAP.md
   section 1).
5. If a change forces you to edit the same fact in several files, say so and propose moving it to one source.
6. When you add, move or delete a file, update `MAP.md` or the folder's `CLAUDE.md` in the same commit
   (`tests/map.test.mjs` fails otherwise).

The skills in `.claude/skills/` load automatically.

@MAP.md
