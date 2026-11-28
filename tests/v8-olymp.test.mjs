// Design v8, the Olympiades arena (site/js/v8/olymp.js, docs/REBUILD_PLAN.md stage 6): the problem of the day is fixed by
// the date and cycles through every problem, the squares and their counts come from olympiad-content.js, every warm-up is
// a challenge that exists, and the page renders in both languages.
import test from 'node:test';
import assert from 'node:assert/strict';
import { STRATEGIES } from '../site/js/olympiad-content.js';
import { WARMUPS } from '../site/js/olympiad-warmups.js';
import { CHALLENGE_LINES } from '../site/js/catalogue-lines.js';
import { PROBLEMS, problemOfTheDay, olympPage } from '../site/js/v8/olymp.js';

const t = (fr, en) => (Array.isArray(fr) ? fr[0] : fr);
const total = STRATEGIES.reduce((n, s) => n + s.problems.length, 0);

test('every problem of the content is a square, with its level', () => {
  assert.equal(PROBLEMS.length, total);
  for (const p of PROBLEMS) assert.ok(['mg', 'pan', 'intl'].includes(p.level), p.title);
  const html = olympPage({ t, lang: 'fr', siteName: 'Matematika' });
  assert.equal((html.match(/class="v8-sq is-/g) || []).length, total + 3); // + the three legend marks
  // owner rule (23 November 2026): no problem count anywhere on the arena
  assert.ok(!html.includes(String(total)), 'the arena must not state how many problems there are');
  for (const lv of ['mg', 'pan', 'intl']) assert.ok(!html.includes(`(${PROBLEMS.filter((p) => p.level === lv).length})`), lv);
});

test('the problem of the day is fixed by the date and reaches every problem', () => {
  const d = new Date(2026, 10, 22);
  assert.equal(problemOfTheDay(d), problemOfTheDay(new Date(2026, 10, 22, 23, 59)));
  const seen = new Set();
  for (let i = 0; i < PROBLEMS.length; i++) seen.add(problemOfTheDay(new Date(2026, 0, 1 + i)));
  assert.equal(seen.size, PROBLEMS.length);
});

test('every warm-up is a challenge that exists', () => {
  const ids = new Set(CHALLENGE_LINES.map((c) => c.id));
  for (const id of WARMUPS) assert.ok(ids.has(id), id);
});

test('the arena renders in both languages, with no countdown', () => {
  const fr = olympPage({ t, lang: 'fr', siteName: 'Matematika' });
  const en = olympPage({ t, lang: 'en', siteName: 'Matematika' });
  assert.match(fr, /L’arène/); assert.match(en, /The arena/);
  assert.match(fr, /Problème du jour/); assert.match(en, /Problem of the day/);
  for (const s of STRATEGIES) assert.ok(fr.includes(`#olympiad/${s.id}`), s.id);
  assert.doesNotMatch(fr + en, /chronomètre|countdown|stopwatch|minuteur/i);
  // the solution of the problem of the day is on its own page, never in the arena
  const day = problemOfTheDay();
  assert.ok(fr.includes(`#olympiad/${day.strategy.id}/${day.index + 1}`));
  assert.doesNotMatch(fr + en, /<summary>Solution<\/summary>/);
});
