// Design v8, stage 5 (docs/REBUILD_PLAN.md): the Lycée. Notebooks and levels come from the live courses, chapters from
// the companion catalogue (the generated LYCEE_CHAPTERS equals the live catalogue); the copybook chapter text folds its
// proofs and keeps every notion of the deck; the Seyès rhythm pads a baseline down to the next heavy line.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resourceCatalog } from '../dist/js/resources-data.js';
import { liveCompanionCatalog, liveCourses } from '../site/js/live-curriculum.js';
import { LYCEE_CHAPTERS } from '../site/js/world-lines.js';
import { NOTEBOOKS, levelsOf, notebookOf, lyceePage } from '../site/js/v8/lycee.js';
import { shiftFor } from '../site/js/seyes-rhythm.js';
import { sequenceModel } from '../site/js/sequence-model.js';
import { sayer } from '../site/js/v8/kit.js';

const t = (x) => (Array.isArray(x) ? x[0] : x);
const live = liveCompanionCatalog(resourceCatalog).chapters;

test('the notebook chapters are the live companion catalogue', () => {
  assert.deepEqual(LYCEE_CHAPTERS.map((c) => c.id), live.map((c) => c.id));
});

test('every live chapter is in exactly one notebook level, linked once', () => {
  const html = lyceePage({ t, lang: 'fr', siteName: 'Matematika' });
  for (const c of live) {
    assert.equal(html.split(`href="#chapter/${c.id}"`).length - 1, 1, c.id);
    assert.ok(NOTEBOOKS.some((n) => n.id === notebookOf(c.course)), c.id);
  }
  for (const n of ['mg', 'fr']) for (const level of levelsOf(n)) assert.ok(liveCourses.some((c) => c.id === level.id && c.curriculum === n));
  assert.match(lyceePage({ t, lang: 'en', siteName: 'Matematika' }), /The lycée/);
});

test('a level in the address opens its notebook and level', () => {
  const html = lyceePage({ t, lang: 'fr', siteName: 'Matematika', course: 't10' });
  assert.match(html, /data-notebook="mg" open/);
  assert.match(html, /data-fold="t10" open/);
  assert.equal((html.match(/class="v8-notebook"[^>]* open/g) || []).length, 1);
});

test('the chapter text folds its proofs and keeps every notion', async () => {
  const { courseText, exercisesText } = await import('../dist/js/v8/copybook.js');
  const deck = JSON.parse(readFileSync(new URL('../dist/slides/data/seconde-01.json', import.meta.url)));
  const model = sequenceModel(deck), s = sayer('fr'), c = { id: 'seconde-01' };
  const { html, sections } = courseText(model, c, 0, s);
  assert.equal(sections.length, model.lessons.length);
  const proofs = model.lessons.flatMap((n) => n.statements).filter((x) => x.k === 'proof').length;
  assert.equal((html.match(/<summary>Démonstration<\/summary>/g) || []).length, proofs);
  assert.doesNotMatch(html, /<details[^>]* open/);
  assert.equal((exercisesText(model, c, 0, s).match(/data-solution/g) || []).length, model.tasks.filter((x) => x.a).length);
});

test('the rhythm pads a baseline down to the next heavy line', () => {
  assert.equal(shiftFor(64), 0);
  assert.equal(shiftFor(64.3), 0);
  assert.equal(shiftFor(70), 26);
  assert.equal(shiftFor(95.8), 0);
  assert.equal(shiftFor(-6), 6);
});
