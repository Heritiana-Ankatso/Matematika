// Algèbre 1 question banks: every generator, over many seeds, gives a well-formed question; every quiz answer is
// accepted in its own written form; the answer checkers accept the formats they announce and refuse the rest.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Q from '../site/js/algebra1-qbank.js';

export const BANKS = ['c1', 'c2', 'c3', 'c4', 'c4c', 'c5'];
const SEEDS = Number(process.env.BANK_SEEDS || 150);
const fixedQcm = { c1: '01-ensembles', c2: '02-matrices', c3: '03-espaces-vectoriels', c4: '04-groupes', c4c: '04b-groupes-actions', c5: '05-anneaux' };
const load = async key => (await import(`../site/js/algebra1-bank-${key}.js`)).ITEMS;
const bad = /undefined|NaN|Infinity|\[object|\$\$|—|–/;

function checkMathDollars(text, where) {
  const n = (String(text).match(/(?<!\\)\$/g) || []).length;
  assert.equal(n % 2, 0, `${where}: unbalanced $ in ${text}`);
  let depth = 0; for (const c of String(text)) { if (c === '{') depth++; if (c === '}') depth--; assert.ok(depth >= 0, `${where}: brace order in ${text}`); }
}

for (const key of BANKS) {
  test(`bank ${key}: more than 60 QCM questions (generators and fixed questions of the lesson), unique ids`, async () => {
    if (!fs.existsSync(new URL(`../site/js/algebra1-bank-${key}.js`, import.meta.url))) return assert.fail(`missing bank ${key}`);
    const items = await load(key), ids = items.map(i => i.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate id');
    const tex = fs.readFileSync(new URL(`../content/university/algebre-1/${fixedQcm[key]}.tex`, import.meta.url), 'utf8');
    const fixed = (tex.match(/\\begin\{question\}/g) || []).length, gens = items.filter(i => i.kind === 'qcm').length;
    assert.ok(gens + fixed > 60, `${key}: ${gens} generators + ${fixed} fixed`);
    assert.ok(items.filter(i => i.kind === 'quiz').length >= 12, `${key}: quiz generators`);
  });
  test(`bank ${key}: every instance over ${SEEDS} seeds is well formed`, async () => {
    const items = await load(key);
    for (const it of items) for (let s = 1; s <= SEEDS; s++) {
      const q = Q.instance(it, s * 104729 + 17), where = `${it.id} seed ${s}`;
      assert.ok(q.stem && !bad.test(q.stem), `${where}: stem ${q.stem}`);
      checkMathDollars(q.stem, where);
      for (const txt of [q.stem, q.expl, ...(q.choices || []).flatMap(c => [c[1], c[2]])]) {
        const outside = Q.richText(txt).replace(/\\\(.*?\\\)/g, '');
        assert.ok(!/\\/.test(outside), `${where}: TeX macro outside a formula in « ${txt} »`);
      }
      if (it.kind === 'qcm') {
        assert.ok(q.choices.length >= 3, where);
        const oks = q.choices.filter(c => c[0]).length;
        if (q.multi) assert.ok(oks >= 1, where); else assert.equal(oks, 1, where);
        assert.equal(new Set(q.choices.map(c => c[1].replace(/\s+/g, ''))).size, q.choices.length, `${where}: duplicate choices`);
        for (const [, t, fb] of q.choices) { assert.ok(t && fb && !bad.test(t) && !bad.test(fb), `${where}: ${t} / ${fb}`); checkMathDollars(t, where); checkMathDollars(fb, where); }
        assert.ok(q.expl && !bad.test(q.expl), `${where}: explanation`); checkMathDollars(q.expl, where);
      } else {
        assert.ok(Q.FORMATS[q.type], `${where}: type ${q.type}`);
        assert.ok(q.expl && !bad.test(q.expl), `${where}: explanation`); checkMathDollars(q.expl, where);
        const own = Q.answerText(q).replace(/ \(modulo \d+\)$/, '');
        const r = Q.checkAnswer(q, own);
        assert.ok(r.ok, `${where}: its own answer « ${own} » is refused (${r.error || r.note || ''})`);
      }
    }
  });
}

test('answer checkers: accepted formats and refusals', () => {
  assert.ok(Q.checkAnswer({ type: 'int', answer: -12 }, ' −12 ').ok);
  assert.ok(Q.checkAnswer({ type: 'int', answer: 12 }, '+12').ok);
  assert.equal(Q.checkAnswer({ type: 'int', answer: 12 }, '12/1').ok, true);
  assert.ok(Q.checkAnswer({ type: 'int', answer: 3 }, '7/2').error);
  assert.ok(Q.checkAnswer({ type: 'int', answer: 3 }, 'trois').error);
  assert.ok(Q.checkAnswer({ type: 'rat', answer: Q.frac(-3, 4) }, '-6/8').ok);
  assert.ok(Q.checkAnswer({ type: 'rat', answer: Q.frac(-3, 4) }, '-0,75').ok);
  assert.ok(Q.checkAnswer({ type: 'rat', answer: Q.frac(5, 2) }, '2.5').ok);
  assert.equal(Q.checkAnswer({ type: 'rat', answer: Q.frac(1, 3) }, '0.33').ok, false);
  assert.ok(Q.checkAnswer({ type: 'rat', answer: 1 }, '1/0').error);
  assert.ok(Q.checkAnswer({ type: 'mod', answer: 3, n: 7 }, '-4').ok);
  assert.ok(Q.checkAnswer({ type: 'mod', answer: 3, n: 7 }, '24').ok);
  assert.equal(Q.checkAnswer({ type: 'mod', answer: 3, n: 7 }, '4').ok, false);
  assert.ok(Q.checkAnswer({ type: 'set', answer: [1, 4, 7] }, '{7, 1, 4, 4}').ok);
  assert.ok(Q.checkAnswer({ type: 'set', answer: [1, 4, 7] }, '1 4 7').ok);
  assert.equal(Q.checkAnswer({ type: 'set', answer: [1, 4, 7] }, '{1, 4}').ok, false);
  assert.ok(Q.checkAnswer({ type: 'set', answer: [] }, '{}').ok);
  assert.ok(Q.checkAnswer({ type: 'set', answer: [] }, '∅').ok);
  assert.ok(Q.checkAnswer({ type: 'tuple', answer: [1, Q.frac(-1, 2), 3] }, '(1, -1/2, 3)').ok);
  assert.equal(Q.checkAnswer({ type: 'tuple', answer: [1, 2, 3] }, '(3, 2, 1)').ok, false);
  assert.ok(Q.checkAnswer({ type: 'tuple', answer: [1, 2, 3] }, '(1, 2)').note);
  const p = Q.parseCycles('(1 3 2)(4 5)', 5);
  assert.ok(Q.checkAnswer({ type: 'perm', answer: p, n: 5 }, '(4 5)(2 1 3)').ok);
  assert.ok(Q.checkAnswer({ type: 'perm', answer: Q.permIdentity(4), n: 4 }, 'id').ok);
  assert.ok(Q.checkAnswer({ type: 'perm', answer: p, n: 5 }, '(1 1 2)').error);
  assert.ok(Q.checkAnswer({ type: 'matrix', answer: [[1, 2], [0, Q.frac(1, 2)]] }, '1 2 ; 0 1/2').ok);
  assert.ok(Q.checkAnswer({ type: 'matrix', answer: [[1, 2], [0, 1]] }, '1 2\n0 1').ok);
  assert.ok(Q.checkAnswer({ type: 'matrix', answer: [[1, 2], [0, 1]] }, '1 2 0 1').note);
});

test('series: a seed gives the same draw, items are distinct, kinds are kept apart', async () => {
  const items = await load('c1');
  const a = Q.drawSeries(items, 'qcm', 10, 12345), b = Q.drawSeries(items, 'qcm', 10, 12345), c = Q.drawSeries(items, 'qcm', 10, 54321);
  assert.deepEqual(a.map(x => x.stem), b.map(x => x.stem));
  assert.notDeepEqual(a.map(x => x.id), c.map(x => x.id));
  assert.equal(new Set(a.map(x => x.id)).size, 10);
  assert.ok(Q.drawSeries(items, 'quiz', 5, 7).every(x => x.kind === 'quiz'));
});
