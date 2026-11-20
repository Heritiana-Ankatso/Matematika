// Experiment `function-symmetry` (Malagasy T11 S chapter 1, unpublished): the pure model against facts written by hand, the mission
// contract of docs/LAB_DESIGN.md (checked here because the experiment is not registered in registry.js until publication), the
// owner's design rules (no hint field, no check mission) and the scene of both views drawn for every function in both languages.
// The independent Python check is scripts/check-mada-t11s-functions.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as M from '../site/js/lab/models/function-symmetry.js';
import exp from '../site/js/lab/experiments/function-symmetry.js';
import { makeFormat } from '../site/js/lab/format.js';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('seven curves: parity declared and found again by scanning, with the poles and the shifts of the domain respected', () => {
  assert.equal(M.FN_IDS.length, 7);
  for (const id of M.FN_IDS) {
    const scan = M.parityByScan(id), want = M.FUNCTIONS[id].parity;
    assert.equal(scan.even, want === 'even', `${id} even`);
    assert.equal(scan.odd, want === 'odd', `${id} odd`);
  }
  assert.equal(M.imageAt('sq', 3), 1); assert.equal(M.imageAt('sq', -3), 1);
  assert.equal(M.imageAt('inv', 2), 1); assert.equal(M.imageAt('inv', -2), -1);
  assert.ok(Number.isNaN(M.imageAt('inv', 0)));
});

test('periods: the declared period is a period, and no smaller step of pi/12 is one', () => {
  for (const id of M.FN_IDS) {
    const P = M.FUNCTIONS[id].period;
    if (P === null) { for (let k = 1; k <= M.K_MAX; k++) assert.ok(M.periodGap(id, k) > 1e-3, `${id} has no period k=${k}`); continue; }
    const kmin = Math.round(P / M.STEP);
    assert.ok(Math.abs(P - kmin * M.STEP) < 1e-12);
    for (let k = 1; k <= M.K_MAX; k++) assert.equal(M.periodGap(id, k) < 1e-7, k % kmin === 0, `${id} k=${k}`);
  }
  assert.equal(M.quantity('periodSteps'), 12);
  assert.equal(M.periodModel({ fn: 'cos2', k: 12 }).minimal, true);
  assert.equal(M.periodModel({ fn: 'cos2', k: 24 }).minimal, false);
  assert.equal(M.periodModel({ fn: 'cos2', k: 0 }).isPeriod, false);
});

test('mission contract: predict first, explain last, set keys exist, no hint, no check mission, [fr, en] strings without dashes', () => {
  const ms = exp.missions;
  assert.ok(ms.length >= 4 && ms.length <= 6);
  assert.equal(ms[0].kind, 'predict'); assert.equal(ms.at(-1).kind, 'explain');
  assert.equal(new Set(ms.map((m) => m.id)).size, ms.length);
  for (const m of ms) {
    for (const k of Object.keys(m.set || {})) assert.ok(k in exp.state, `${m.id}: set key ${k}`);
    for (const k of m.unlock || []) assert.ok(k in exp.controls, `${m.id}: unlock ${k}`);
    const un = (m.unlock || []).map((k) => exp.controls[k].kind);
    assert.ok(un.filter((k) => k === 'handle').length <= 2 && un.filter((k) => k === 'slider').length <= 1 && un.filter((k) => k === 'choice').length <= 1);
    assert.ok(!('hint' in m), `${m.id}: owner rule, no hint field`);
    assert.notEqual(m.kind, 'check');
  }
  assert.equal(ms[0].choices[ms[0].correct][0], String(M.quantity('oppositeImage')));
  const strings = [];
  (function walk(v) { if (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === 'string')) strings.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })({ ...exp, model: null });
  assert.ok(strings.length > 25);
  for (const [fr, en] of strings) { assert.ok(!/[–—]/.test(fr + en), fr); assert.ok(fr.trim() && en.trim()); }
});

test('every explore goal is false at the start of its mission and reachable', () => {
  const start = (m) => ({ ...exp.state, ...m.set });
  const goals = { mirror: { fn: 'cube' }, neither: { fn: 'shift' }, period: { k: 12 } };
  for (const m of exp.missions.filter((x) => x.kind === 'explore')) {
    assert.ok(!m.goal(start(m), M.model(start(m))), `${m.id} not done at its start`);
    const reach = { ...start(m), ...goals[m.id] };
    assert.ok(m.goal(reach, M.model(reach)), `${m.id} reachable`);
  }
  // a wrong translation does not count
  assert.ok(!exp.missions.find((m) => m.id === 'period').goal({ ...exp.state, fn: 'cos2', k: 7, view: 'period' }, M.model({ ...exp.state, fn: 'cos2', k: 7 })));
});

test('both scenes and the readouts are finite in both languages for every curve, abscissa and translation', () => {
  for (const lang of ['fr', 'en']) {
    const fmt = makeFormat(lang), ctx = { fmt, lang, unlocked: () => true };
    for (const fn of M.FN_IDS) for (const view of ['parity', 'period']) for (const a of [0.5, 2, 4.5]) for (const k of [0, 5, 12, 24]) {
      const s = { fn, a, k, view };
      const sc = exp.views.figure.scene(s, ctx);
      assert.ok(sc.curves.length >= 1);
      for (const p of sc.points || []) assert.ok(p.at.every(Number.isFinite), `${fn} point`);
      const text = JSON.stringify([exp.views.readout(s, ctx), exp.views.figure.measure(s, ctx), exp.views.formula(s, ctx)].map((x) => x));
      assert.ok(!/NaN|undefined|Infinity/.test(text), text);
    }
  }
});

test('the controls: the handle stays on the grid inside [0.5, 4.5], the slider reads in twelfths of pi', () => {
  const h = exp.controls.a;
  assert.deepEqual(h.drag(exp.state, 9, 3), { a: 4.5 }); assert.deepEqual(h.drag(exp.state, -3, 0), { a: 0.5 }); assert.deepEqual(h.drag(exp.state, 2.26, 0), { a: 2.5 });
  const f = exp.controls.k.format;
  assert.deepEqual([0, 1, 12, 13, 24].map(f), ['0', 'π/12', 'π', '13π/12', '2π']);
});

test('the experiment is not registered or listed anywhere yet (unpublished)', () => {
  assert.ok(!/function-symmetry/.test(read('site/js/lab/registry.js')), 'registry.js');
  assert.ok(!/function-symmetry|mada-t11/.test(read('content/data/manifest.json')), 'manifest.json');
});
