// Malagasy T11 S chapter 1 (functions), native adaptation, UNPUBLISHED. Language rule (owner, 11 November 2026): French only, no
// English twin. Publication rule: no manifest entry for this version, nothing new in dist/, the experiment not registered, until two
// independent audits and the owner's approval. The deck's laboratory references resolve against the experiment file.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import exp from '../site/js/lab/experiments/function-symmetry.js';

const url = (p) => new URL('../' + p, import.meta.url);
const read = (p) => fs.readFileSync(url(p), 'utf8');
const exists = (p) => fs.existsSync(url(p));
const UNIT = 'content/tex/courses/mada-t11s/c01.fr.tex', SOL = 'content/tex/courses/mada-t11s/corriges/c01.fr.tex';
const ROOT = new URL('..', import.meta.url).pathname;

const prose = (tex) => tex.replace(/%[^\n]*/g, ' ').replace(/\$[^$]*\$/g, ' ').replace(/\\\[[\s\S]*?\\\]/g, ' ').replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^{}]*\})?/g, ' ');
const ENGLISH = /^(the|and|of|is|are|with|that|this|from|which|there|have|will|should|because)$/i;

test('the unit and its solutions are French only: no English twin, no translation table, no English words', () => {
  for (const f of [UNIT, SOL]) {
    assert.ok(exists(f), f);
    assert.ok(!exists(f.replace('.fr.tex', '.en.tex')) && !exists(f.replace('.fr.tex', '.en.json')), `${f}: no twin`);
    assert.deepEqual(prose(read(f)).split(/[^A-Za-zÀ-ÿ']+/).filter((w) => ENGLISH.test(w)), [], `${f}: English words`);
  }
  assert.deepEqual(fs.readdirSync(url('content/tex/courses/mada-t11s/')).filter((f) => /\.en\./.test(f)), []);
  assert.match(read(UNIT), /^\\mxunit\{mada-t11-s-01\}\{Généralités sur les fonctions numériques\}/);
  for (const w of ['Ensemble de définition', 'Parité', 'Périodicité', 'Sens de variation', 'Fonction, image, antécédent']) assert.match(read(UNIT), new RegExp(`\\\\section\\{${w}\\}`), w);
});

test('solutions: one for every exercise and problem of the unit, no group theory', () => {
  const labels = [...read(UNIT).matchAll(/\\mxlabel\{([^}]+)\}/g)].map((m) => m[1]);
  assert.ok(labels.length >= 20, `${labels.length} exercises`);
  const sol = read(SOL);
  for (const l of labels) assert.ok(sol.includes(`mada-t11-s-01:${l}`), `solution of ${l}`);
  assert.doesNotMatch(read(UNIT) + sol, /\b(groupe|sous-groupe|isomorphisme|homomorphisme)\b/i);
});

test('the twin tool, the pipeline and the builder treat the course as French only', () => {
  assert.match(read('build/mxbuild/twin.py'), /FRENCH_ONLY = \('courses\/mada-t10\/',\) \+ \('courses\/mada-t11s\/',\)/);
  const b = read('scripts/build-mada-t11s.py');
  assert.match(b, /lang=fr/); assert.doesNotMatch(b, /lang=en/);
  assert.match(b, /COURSE = 'mada-t11s'/);
  assert.match(read('build/mxbuild/pipeline.py'), /'mada-t11s': \['scripts\/build-mada-t11s\.py'\]/);
});

test('chapters.json records the programme mapping and the unpublished state', () => {
  const d = JSON.parse(read('content/malagasy/chapters.json'));
  const u = d.units.find((x) => x.id === 'mada-t11-s-01');
  assert.equal(u.curriculum, 'mg'); assert.equal(u.language, 'fr'); assert.equal(u.visible, false);
  assert.equal(u.state, 'native-adaptation-unpublished');
  assert.match(u.programme.section, /^ANALYSE/);
  assert.ok(/1ère|T11/.test(u.programme.document));
  assert.ok(u.programme.contents.some((c) => /parité/.test(c)) && u.programme.contents.some((c) => /périodicité/.test(c)) && u.programme.contents.some((c) => /ensemble de définition/.test(c)));
  for (const k of ['unit', 'solutions', 'builder', 'lab', 'slides', 'checker']) assert.ok(exists(u.native[k]), u.native[k]);
});

test('unpublished: no manifest entry for the native version, only the copied laboratory modules in dist, the experiment not registered', () => {
  const manifest = read('content/data/manifest.json');
  assert.ok(!/mada-t11/.test(manifest), 'manifest.json');
  assert.ok(!/function-symmetry/.test(manifest), 'manifest labs');
  const hits = execFileSync('git', ['ls-files', 'dist'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter((f) => /mada-t11|function-symmetry/.test(f) && !/^dist\/js\/lab\/(experiments|models)\/function-symmetry\.js$/.test(f));
  // the build copies every module under site/js to dist/js, so the two laboratory modules are there; no page, course file or deck is
  assert.deepEqual(hits, [], 'dist/ holds nothing of the course but the copied laboratory modules');
  assert.ok(!/function-symmetry/.test(read('site/js/lab/registry.js')));
});

test('the interactive deck is French only, complete, and its laboratory references resolve against the experiment', () => {
  const deck = JSON.parse(read('content/slides/mada-t11-s-01.json'));
  assert.equal(deck.id, 'mada-t11-s-01'); assert.equal(deck.course, 'mada-t11s');
  assert.deepEqual(Object.keys(deck.editions), ['fr']);
  assert.ok(deck.slides.length >= 15);
  assert.equal(deck.slides[0].k, 'title');
  for (const s of deck.slides) {
    for (const key of ['t', 'b', 'a']) if (key in s) { assert.equal(s[key].length, 2); assert.equal(s[key][1], '', `${s.k}: English slot stays empty`); }
    assert.ok(!('hints' in s) && !('hint' in s), 'no hint field');
    const text = (s.b[0] || '').replace(/<[^>]*>|\\\([^)]*\\\)|\\\[[\s\S]*?\\\]/g, ' ');
    assert.deepEqual(text.split(/[^A-Za-zÀ-ÿ']+/).filter((w) => ENGLISH.test(w)), [], `English in slide: ${s.t[0]}`);
    assert.ok(!/[–—]/.test(JSON.stringify(s)), 'no dash');
  }
  const refs = deck.slides.filter((s) => s.k === 'widget').map((s) => s.w);
  const missions = new Set(exp.missions.map((m) => m.id));
  for (const w of refs) { assert.equal(w.type, 'lab'); const [id, mission] = w.ref.split('/'); assert.equal(id, exp.id); assert.ok(missions.has(mission), w.ref); }
  assert.deepEqual(refs.map((w) => w.ref.split('/')[1]), ['open', 'mirror', 'period', 'why']);
});

test('the numbers printed in the solutions come from the committed checker (it passes)', () => {
  const out = execFileSync('python3', ['scripts/check-mada-t11s-functions.py'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /checks passed/);
});
