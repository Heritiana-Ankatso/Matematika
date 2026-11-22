// Design v8, stage 4: the Université world. The map of the fields (university-map.js) has the 24 fields and 34 links of
// docs/DESIGN_V8.md, the lit courses are the university sections of the manifest, the topic map and the field map are
// the same fields (decision 4), "Les grands assauts" has a source per entry and no fallen problem without dates, and
// the page renders in both languages.
import test from 'node:test';
import assert from 'node:assert/strict';

const { FIELDS, LINKS, LIT, fieldById } = await import('../site/js/university-map.js');
const { SIEGES, resisted } = await import('../site/js/sieges-data.js');
const { TOPICS } = await import('../site/js/topic-registry.js');
const { university } = await import('../site/js/catalogue-data.js');

test('24 fields, 34 links between existing fields, on the sky', () => {
  assert.equal(FIELDS.length, 24); assert.equal(LINKS.length, 34);
  assert.equal(new Set(FIELDS.map((f) => f.id)).size, 24);
  for (const [a, b] of LINKS) assert.ok(fieldById(a) && fieldById(b) && a !== b, `${a}-${b}`);
  for (const f of FIELDS) { assert.ok(f.x >= 0 && f.x <= 1 && f.y >= 0 && f.y <= 1, f.id); assert.ok(f.name[0] && f.name[1] && f.line[0] && f.line[1]); }
});

test('the lit courses are the university courses, and the topic map is the field map', () => {
  assert.deepEqual(Object.keys(LIT).sort(), university.sections.map((s) => s.id).sort());
  for (const ids of Object.values(LIT)) for (const id of ids) assert.ok(fieldById(id), id);
  const topics = new Set(TOPICS.map((x) => x.id));
  for (const f of FIELDS) for (const id of f.topics) assert.ok(topics.has(id), `${f.id}: ${id}`);
  const covered = new Set(FIELDS.flatMap((f) => f.topics));
  assert.deepEqual([...topics].filter((id) => id !== 'history' && !covered.has(id)), [], 'every topic belongs to a field');
});

test('the great assaults: sources, dates, statuses; Riemann open with its note', () => {
  for (const x of SIEGES) {
    assert.match(x.source, /^https:\/\//, x.id);
    assert.ok(['done', 'open'].includes(x.st), x.id);
    if (x.st === 'done') { assert.ok(x.to > x.from && x.by, x.id); assert.equal(resisted(x, 2026), x.approx ? Math.round((x.to - x.from) / 100) * 100 : x.to - x.from); }
    else assert.equal(x.to, undefined, x.id);
    for (const pair of [x.name, x.q]) assert.ok(pair[0] && pair[1], x.id);
  }
  const r = SIEGES.find((x) => x.id === 'riemann');
  assert.equal(r.st, 'open'); assert.match(r.note[0], /20 novembre 2026/); assert.match(r.note[0], /contestée/);
});

test('the page renders in both languages; Syracuse', async () => {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const { univPage, collatz } = await import('../site/js/v8/univ.js');
  assert.deepEqual(collatz(27), { steps: 111, top: 9232 });
  assert.deepEqual(collatz(1), { steps: 0, top: 1 });
  for (const lang of ['fr', 'en']) {
    document.body.innerHTML = univPage({ t: (p) => p[lang === 'fr' ? 0 : 1], lang, siteName: 'M' });
    assert.equal(document.querySelectorAll('[data-course]').length, university.sections.length);
    assert.equal(document.querySelectorAll('[data-field]').length, 24);
    assert.equal(document.querySelectorAll('[data-siege]').length, SIEGES.length);
    assert.ok(document.querySelector('[data-course="foundations"] a[href^="#basics/"]'), 'the foundation lessons sit beside Fondements');
  }
});
