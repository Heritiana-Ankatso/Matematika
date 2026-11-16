// Malagasy T10 chapter 1 (Logique), native adaptation, UNPUBLISHED (issue 26). Language rule (owner, 11 November 2026): Malagasy
// curriculum lessons are in French only, no English twin. Publication rule: no manifest entry, nothing in dist/ until two independent
// audits and the owner's approval. Programme mapping recorded. The deck's laboratory references resolve against the experiment file.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import exp from '../site/js/lab/experiments/logic-truth.js';

const url = (p) => new URL('../' + p, import.meta.url);
const read = (p) => fs.readFileSync(url(p), 'utf8');
const exists = (p) => fs.existsSync(url(p));
const UNIT = 'content/tex/courses/mada-t10/c01.fr.tex', SOL = 'content/tex/courses/mada-t10/corriges/c01.fr.tex';

// Prose outside the maths, the commands and the comments.
const prose = (tex) => tex.replace(/%[^\n]*/g, ' ').replace(/\$[^$]*\$/g, ' ').replace(/\\\[[\s\S]*?\\\]/g, ' ').replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^{}]*\})?/g, ' ');
const ENGLISH = /\b(the|and|of|is|are|with|that|this|from|which|there|have|will|should|because|statement|proposition is)\b/i;

test('the unit and its solutions are French only: no English twin, no translation table', () => {
  for (const f of [UNIT, SOL]) {
    assert.ok(exists(f), f);
    assert.ok(!exists(f.replace('.fr.tex', '.en.tex')), `${f}: no .en.tex`);
    assert.ok(!exists(f.replace('.fr.tex', '.en.json')), `${f}: no .en.json`);
  }
  assert.deepEqual(fs.readdirSync(url('content/tex/courses/mada-t10/')).filter((f) => /\.en\./.test(f)), []);
  for (const f of [UNIT, SOL]) {
    const words = prose(read(f)).split(/[^A-Za-zÀ-ÿ']+/).filter((w) => ENGLISH.test(w) && /^(the|and|of|is|are|with|that|this|from|which|there|have|will|should|because)$/i.test(w));
    // « et », « est », « de » are French; the English list above has no French word in it
    assert.deepEqual(words, [], `${f}: English words in the prose`);
  }
  const u = read(UNIT);
  assert.match(u, /^\\mxunit\{mada-t10-01\}\{Logique\}/);
  assert.match(u, /Hors programme/);
  assert.match(u, /\\begin\{beyond\}\[Contraposée et raisonnement par l'absurde\]/);
});

test('the twin tool and the builder both treat the course as French only', () => {
  assert.match(read('build/mxbuild/twin.py'), /FRENCH_ONLY = \('courses\/mada-t10\/',\)/);
  const b = read('scripts/build-mada-t10.py');
  assert.match(b, /lang=fr/); assert.doesNotMatch(b, /lang=en/);
  assert.match(read('build/mxbuild/pipeline.py'), /'mada-t10': \['scripts\/build-mada-t10\.py'\]/);
});

test('chapters.json records the programme mapping and the unpublished state', () => {
  const d = JSON.parse(read('content/malagasy/chapters.json'));
  const u = d.units.find((x) => x.id === 'mada-t10-01');
  assert.equal(u.curriculum, 'mg'); assert.equal(u.language, 'fr'); assert.equal(u.visible, false);
  assert.equal(u.state, 'native-adaptation-unpublished');
  assert.equal(u.programme.section, 'ALGEBRE > LOGIQUE');
  assert.ok(/T10/.test(u.programme.document));
  assert.deepEqual(u.programme.outsideProgramme, ['contraposée', "raisonnement par l'absurde"]);
  assert.ok(u.programme.contents.some((c) => /OU \(inclusif et exclusif\)/.test(c)));
  for (const k of ['unit', 'solutions', 'builder', 'lab', 'slides', 'checker']) assert.ok(exists(u.native[k]), u.native[k]);
});

test('unpublished: no manifest entry, nothing under dist/, the experiment not registered', () => {
  const manifest = read('content/data/manifest.json');
  assert.ok(!/mada-t10/.test(manifest), 'manifest.json');
  assert.ok(!/logic-truth/.test(manifest), 'manifest labs');
  const hits = execFileSync('git', ['ls-files', 'dist'], { cwd: new URL('..', import.meta.url).pathname, encoding: 'utf8' }).split('\n').filter((f) => /mada-t10|logic-truth/.test(f));
  assert.deepEqual(hits, [], 'dist/ is untouched');
  assert.ok(!/logic-truth/.test(read('site/js/lab/registry.js')));
});

test('the interactive deck is French only, complete, and its laboratory references resolve against the experiment', () => {
  const deck = JSON.parse(read('content/slides/mada-t10-01.json'));
  assert.equal(deck.id, 'mada-t10-01'); assert.equal(deck.course, 'mada-t10');
  assert.deepEqual(Object.keys(deck.editions), ['fr']);
  assert.ok(deck.slides.length >= 15);
  assert.equal(deck.slides[0].k, 'title');
  for (const s of deck.slides) {
    for (const key of ['t', 'b', 'a']) if (key in s) { assert.equal(s[key].length, 2); assert.equal(s[key][1], '', `${s.k}: English slot stays empty`); }
    assert.ok(s.t[0] || s.k === 'title', s.k);
    assert.ok(!('hints' in s) && !('hint' in s), 'no hint field');
    assert.ok(!ENGLISH.test((s.b[0] || '').replace(/<[^>]*>|\\\([^)]*\\\)|\\\[[\s\S]*?\\\]/g, ' ')), `English in slide: ${s.t[0]}`);
  }
  const refs = deck.slides.filter((s) => s.k === 'widget').map((s) => s.w);
  assert.ok(refs.length >= 4);
  const missions = new Map(exp.missions.map((m) => [m.id, m]));
  for (const w of refs) {
    assert.equal(w.type, 'lab');
    const [id, mission] = w.ref.split('/');
    assert.equal(id, exp.id); assert.ok(missions.has(mission), w.ref);
  }
  // the experiment's four activities are all placed, in the order of the lesson
  assert.deepEqual(refs.map((w) => w.ref.split('/')[1]), ['open', 'equiv', 'hunt', 'negate', 'why']);
  // the out-of-programme slide is marked as such
  const beyond = deck.slides.find((s) => /Hors programme/.test(s.t[0])); assert.ok(beyond);
});

test('the exercise answers printed in the solutions come from the committed checker (it passes)', () => {
  const out = execFileSync('python3', ['scripts/check-mada-t10-logic.py'], { cwd: new URL('..', import.meta.url).pathname, encoding: 'utf8' });
  assert.match(out, /checks passed/);
});
