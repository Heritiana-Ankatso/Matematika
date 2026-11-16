// Experiment `logic-truth` (Malagasy T10 chapter 1, unpublished): the pure model against truth tables written by hand, the mission
// contract of docs/LAB_DESIGN.md (checked here because the experiment is not registered in registry.js until publication), the
// owner's design rules (no hint panel or hint button, 44 px targets declared in the template, reduced motion) and the DOM surface
// played through the shared shell in both languages. The independent Python check is scripts/check-mada-t10-logic.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import * as M from '../site/js/lab/models/logic-truth.js';
import exp from '../site/js/lab/experiments/logic-truth.js';

const V = true, F = false;
const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('truth tables of the five connectors, line by line (VV, VF, FV, FF)', () => {
  assert.deepEqual(M.column('and'), [V, F, F, F]);
  assert.deepEqual(M.column('or'), [V, V, V, F]);
  assert.deepEqual(M.column('xor'), [F, V, V, F]);
  assert.deepEqual(M.column('imp'), [V, F, V, V]);
  assert.deepEqual(M.column('iff'), [V, F, F, V]);
  assert.deepEqual(M.ROWS, [[V, V], [V, F], [F, V], [F, F]]);
});

test('the six pairs: five equivalences and the converse, which differs on exactly two rows', () => {
  assert.deepEqual(M.PAIR_IDS.map((id) => [id, M.pairModel(id).equivalent]),
    [['morgan', true], ['impor', true], ['negimp', true], ['iff2', true], ['xor', true], ['conv', false]]);
  assert.equal(M.pairModel('conv').diff, 2);
  assert.deepEqual(M.pairModel('conv').differing, [false, true, true, false]);
  assert.deepEqual(M.pairModel('morgan').left, [F, V, V, V]);
});

test('the counter-example hunt: 16 is the first failure of n^2+n+17, 2^n > n^2 fails at 2, 3, 4, n^2 >= n never fails on 0 to 40', () => {
  assert.deepEqual(M.counterexamples('prime'), Array.from({ length: 41 }, (_, n) => n).filter((n) => !isPrime(n * n + n + 17)));
  assert.equal(M.counterexamples('prime')[0], 16);
  assert.equal(16 * 16 + 16 + 17, 289);
  assert.deepEqual(M.counterexamples('pow'), [2, 3, 4]);
  assert.deepEqual(M.counterexamples('sq'), []);
  for (let n = 0; n < 16; n++) assert.ok(isPrime(n * n + n + 17), String(n));
  function isPrime(x) { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; }
});

test('quantified statements on a finite set: one counter-example refutes a for-all, an exists needs every element tested', () => {
  const base = { stmt: 'all-even', checked: 0 };
  assert.equal(M.negateModel(base).verdict, 'open');
  const odd = M.STATEMENTS['all-even'].set.indexOf(13);
  assert.equal(M.negateModel({ ...base, checked: 1 << odd }).verdict, 'false');
  assert.equal(M.negateModel({ ...base, checked: 1 << odd }).refuted, true);
  assert.equal(M.negateModel({ ...base, checked: 0b11 }).verdict, 'open');   // 2 and 4: both fine, no conclusion
  assert.equal(M.negateModel({ ...base, checked: 0b11111111 }).truth, false);
  const some = { stmt: 'some-seven', checked: 0 };
  assert.equal(M.negateModel({ ...some, checked: 0b1111111 }).verdict, 'open');   // seven of eight tested, none a multiple of 7
  assert.equal(M.negateModel({ ...some, checked: 0b11111111 }).verdict, 'false');
  assert.equal(M.STATEMENTS['some-seven'].set.some((x) => x % 7 === 0), false);
});

test('mission contract: predict first, explain last, set keys exist, answers recomputed, no hint anywhere', () => {
  const ms = exp.missions;
  assert.ok(ms.length >= 4 && ms.length <= 6, `${ms.length} missions`);
  assert.equal(ms[0].kind, 'predict'); assert.equal(ms.at(-1).kind, 'explain');
  assert.equal(new Set(ms.map((m) => m.id)).size, ms.length);
  for (const m of ms) {
    for (const k of Object.keys(m.set || {})) assert.ok(k in exp.state, `${m.id}: set key ${k}`);
    for (const k of m.unlock || []) assert.ok(k in exp.controls, `${m.id}: unlock ${k}`);
    const un = (m.unlock || []).map((k) => exp.controls[k].kind);
    assert.ok(un.filter((k) => k === 'handle').length <= 2 && un.filter((k) => k === 'slider').length <= 1 && un.filter((k) => k === 'choice').length <= 1, `${m.id}: control count`);
    assert.ok(!('hint' in m), `${m.id}: owner rule, no hint field (the shell would draw a hint box)`);
    assert.notEqual(m.kind, 'check', `${m.id}: a check mission adds a show-answer button`);
  }
  assert.equal(ms[0].correct, M.quantity('falseLinesImp', exp.state));
  // every string is a [fr, en] pair without em or en dashes
  const strings = [];
  (function walk(v) { if (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === 'string')) strings.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })({ ...exp, model: null });
  assert.ok(strings.length > 30);
  for (const [fr, en] of strings) { assert.ok(!/[–—]/.test(fr + en), fr); assert.ok(fr.trim() && en.trim()); }
});

test('every explore goal is false at the start of its mission and reachable', () => {
  const start = (m) => ({ ...exp.state, ...m.set });
  const goals = { build: { cells: 'VFVV' }, equiv: { pair: 'conv' }, hunt: { n: 16 }, negate: { checked: 1 << M.STATEMENTS['all-even'].set.indexOf(13) } };
  for (const m of exp.missions.filter((x) => x.kind === 'explore')) {
    assert.ok(!m.goal(start(m), M.model(start(m))), `${m.id} is not already done at its start`);
    const reach = { ...start(m), ...goals[m.id] };
    assert.ok(m.goal(reach, M.model(reach)), `${m.id} is reachable`);
  }
  // the wrong table is not accepted
  const wrong = { ...exp.state, cells: 'VVVV' };
  assert.equal(M.model(wrong).table.allCorrect, false);
  assert.equal(M.model(wrong).table.wrong, 1);
});

test('the experiment is not registered or listed anywhere yet (unpublished)', () => {
  assert.ok(!/logic-truth/.test(read('site/js/lab/registry.js')), 'registry.js');
  assert.ok(!/logic-truth|mada-t10/.test(read('content/data/manifest.json')), 'manifest.json');
});

test('the surface plays through the shell in both languages: cells, tiles, keyboard, no hint box, reduced motion', async () => {
  const dom = new JSDOM('<main></main>', { pretendToBeVisual: true }), w = dom.window;
  for (const key of ['window', 'document', 'Event', 'MouseEvent', 'KeyboardEvent', 'CustomEvent', 'HTMLElement']) globalThis[key] = w[key];
  let reduced = false, n = 0; const frames = new Map();
  globalThis.matchMedia = () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} });
  globalThis.requestAnimationFrame = (fn) => { frames.set(++n, fn); return n; };
  globalThis.cancelAnimationFrame = (id) => frames.delete(id);
  const tick = () => { const pending = [...frames.values()]; frames.clear(); for (const fn of pending) fn(100); };
  const { createShell } = await import('../site/js/lab/shell.js');
  const tpl = await import('../site/js/lab/templates/logic.js');
  for (const lang of ['fr', 'en']) {
    const host = w.document.createElement('section'); w.document.body.append(host);
    const api = createShell(host, exp, tpl, { mode: 'full', lang, mission: 'build' });
    tick();
    const root = host.querySelector('.lab2-logic');
    assert.ok(root);
    const cells = [...root.querySelectorAll('.lg-cell')]; assert.equal(cells.length, 4);
    // click the four cells until they show the right values V F V V
    const want = ['V', 'F', 'V', 'V'];
    cells.forEach((c, i) => { while (api.getState().cells[i] !== want[i]) { c.click(); tick(); } });
    tick();
    assert.equal(api.getState().cells, 'VFVV');
    assert.ok(api.root.querySelector('.lab2-card.is-done') || api.root.querySelector('[data-kind="explore"].is-done'), 'goal reached marks the mission done');
    // typing a letter sets a cell directly
    cells[0].dispatchEvent(new w.KeyboardEvent('keydown', { key: 'f', bubbles: true })); tick();
    assert.equal(api.getState().cells[0], 'F');
    assert.equal(cells[0].dataset.right, 'false');
    // no hint box, no hint button
    assert.equal(host.querySelectorAll('.lab2-hintbox, details').length, 0);
    assert.ok(![...host.querySelectorAll('button, summary')].some((b) => /indice|hint|aide|help/i.test(b.textContent)), 'no hint button');
    // hunt
    api.setMission('hunt'); tick();
    const tiles = [...root.querySelectorAll('.lg-tile')].filter((b) => b.dataset.n !== undefined);
    assert.equal(tiles.length, 41);
    tiles[16].click(); tick();
    assert.equal(api.getState().n, 16);
    assert.match(root.querySelector('.lg > section:not([hidden]) .lg-bubble').textContent, /289/);
    tiles[16].dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); tick();
    assert.equal(api.getState().n, 15);
    // negate
    api.setMission('negate'); tick();
    const nt = [...root.querySelectorAll('.lg-tile')].filter((b) => b.dataset.i !== undefined);
    assert.equal(nt.length, 8);
    nt[5].click(); tick();
    assert.equal(api.getState().checked, 1 << 5);
    assert.match(root.querySelector('.lg > section:not([hidden]) .lg-bubble').textContent, /13/);
    // reduced motion: no animation class is added
    reduced = true; nt[6].click(); tick();
    assert.ok(!nt[6].classList.contains('lg-pop'));
    reduced = false;
    assert.ok(!/NaN|undefined|Infinity/.test(root.textContent), lang);
    api.destroy();
  }
  // targets are declared at 44 px or more in the template's style
  const css = read('site/js/lab/templates/logic.js');
  assert.match(css, /\.lg-cell \{[^}]*min-height: 48px/); assert.match(css, /\.lg-tile \{[^}]*min-width: 44px; min-height: 44px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
