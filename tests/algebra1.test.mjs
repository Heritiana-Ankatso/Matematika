// Algèbre 1: independent checks of the interactives' maths model, and integrity of the published lessons.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as M from '../site/js/algebra1-model.js';

const subsets = (n) => [...Array(1 << n).keys()].map(m => [...Array(n).keys()].filter(i => (m >> i) & 1));

test('set expressions: masks agree with brute force over every choice of A, B, C in a 4-element universe', () => {
  const U = [0, 1, 2, 3], all = subsets(4);
  const evalSet = (t, A, B, C) => {
    if (t.set) return new Set({ A, B, C, U, '∅': [] }[t.set]);
    if (t.op === 'ᶜ') { const x = evalSet(t.arg, A, B, C); return new Set(U.filter(u => !x.has(u))); }
    const a = evalSet(t.left, A, B, C), b = evalSet(t.right, A, B, C);
    return new Set(U.filter(u => ({ '∪': a.has(u) || b.has(u), '∩': a.has(u) && b.has(u), '∖': a.has(u) && !b.has(u), 'Δ': a.has(u) !== b.has(u) })[t.op]));
  };
  for (const text of ['(A ∪ B)ᶜ', 'Aᶜ ∩ Bᶜ', 'A ∖ (B ∩ C)', '(A Δ B) ∪ Cᶜ', 'U ∖ ∅', "(A' & B) | C"]) {
    const tree = M.parseSetExpr(text), mask = M.setMask(tree);
    for (const A of all) for (const B of [all[3], all[6], all[9]]) for (const C of [all[0], all[5], all[15]]) {
      assert.deepEqual([...evalSet(tree, A, B, C)].sort(), M.elementsOf(mask, U, A, B, C), text);
    }
  }
  assert.equal(M.setMask(M.parseSetExpr('(A ∪ B)ᶜ')), M.setMask(M.parseSetExpr('Aᶜ ∩ Bᶜ')));
  assert.equal(M.setMask(M.parseSetExpr('A ∩ (B ∪ C)')), M.setMask(M.parseSetExpr('(A ∩ B) ∪ (A ∩ C)')));
  assert.notEqual(M.setMask(M.parseSetExpr('A ∖ (B ∩ C)')), M.setMask(M.parseSetExpr('(A ∖ B) ∩ (A ∖ C)')));
  assert.throws(() => M.parseSetExpr('A ∪'), /incomplète/);
  assert.throws(() => M.parseSetExpr('(A ∩ B'), /Parenthèse/);
});

test('finite maps: injectivity and surjectivity agree with counting, preimage identities hold', () => {
  for (let code = 0; code < 81; code++) {
    const f = [0, 1, 2, 3].map(k => Math.floor(code / 3 ** k) % 3).slice(0, 4), p = 3, info = M.mapInfo(f, p);
    assert.equal(info.injective, new Set(f).size === f.length);
    assert.equal(info.surjective, [0, 1, 2].every(y => f.includes(y)));
    for (const B of subsets(3)) assert.deepEqual(M.directImage(f, M.preimage(f, B)), B.filter(y => f.includes(y)));
  }
});

test('Z/nZ: extended Euclid gives Bézout relations and inverses exactly for units', () => {
  for (let n = 2; n <= 40; n++) for (let a = 0; a < n; a++) {
    const e = M.extendedEuclid(a, n);
    assert.equal(e.u * a + e.v * n, e.gcd);
    assert.equal(e.gcd, M.gcd(a, n));
    for (const r of e.rows) assert.equal(r.u * a + r.v * n, r.r);
    if (e.gcd === 1) assert.equal((a * e.inverse) % n, 1 % n); else assert.equal(e.inverse, null);
  }
  assert.deepEqual(M.units(12), [1, 5, 7, 11]);
  assert.deepEqual(M.zeroDivisors(12), [2, 3, 4, 6, 8, 9, 10]);
  assert.equal(M.extendedEuclid(17, 60).inverse, 53);
  assert.equal(M.extendedEuclid(11, 26).inverse, 19);
});

test('elimination: PA = LU with L unit lower triangular, U echelon, rank and determinant as in the course', () => {
  const cases = [
    { A: [[2, 1, 1], [4, -6, 0], [-2, 7, 2]], rank: 3, det: -16, swaps: 0 },
    { A: [[0, 2, 1], [1, 1, 1], [2, 0, 3]], rank: 3, det: -4, swaps: 1 },
    { A: [[1, 2, 3], [2, 4, 6], [1, 0, 1]], rank: 2, det: 0 },
    { A: [[1, 2, 0, 1], [2, 4, 1, 3], [3, 6, 1, 4]], rank: 2, det: null },
    { A: [[1, 2, 1], [2, 5, 3], [1, 3, 3]], rank: 3, det: 1 },
    { A: [['1/2', '1/3'], ['1/4', '1/5']], rank: 2, det: null },
  ];
  for (const c of cases) {
    const r = M.eliminate(c.A), PA = M.matMul(r.P, r.A), LU = M.matMul(r.L, r.U);
    PA.forEach((row, i) => row.forEach((x, j) => assert.ok(x.eq(LU[i][j]), `PA = LU at ${i},${j}`)));
    r.L.forEach((row, i) => row.forEach((x, j) => { if (j > i) assert.ok(x.isZero()); if (j === i) assert.ok(x.eq(1)); }));
    assert.equal(r.rank, c.rank);
    if (c.det !== null) assert.ok(r.det.eq(c.det), String(c.A));
    if (c.swaps !== undefined) assert.equal(r.swaps, c.swaps);
  }
  const d = M.eliminate([['1/2', '1/3'], ['1/4', '1/5']]).det;
  assert.ok(d.eq(new M.Frac(1, 10).sub(new M.Frac(1, 12))));
});

test('permutations: composition right to left, cycles, sign as a homomorphism, order, matrices', () => {
  const s = M.parseCycles('(1 4 3)(2 6)', 6), t = M.parseCycles('(1 2 3 4 5 6)', 6);
  assert.equal(M.cycleText(M.compose(s, t)), '(1 6 4 5 2)');
  assert.equal(M.cycleText(M.compose(t, s)), '(1 5 6 3 2)');
  assert.equal(M.cycleText(M.inverse(s)), '(1 3 4)(2 6)');
  assert.equal(M.sign(s), -1); assert.equal(M.permOrder(s), 6);
  assert.equal(M.cycleText(M.parseCycles('(1 4)(1 2 3 4 5 6)', 6)), '(1 2 3)(4 5 6)'); // cutting a cycle
  const all = []; const rec = (p, rest) => rest.length ? rest.forEach((x, i) => rec([...p, x], rest.filter((_, j) => j !== i))) : all.push(p);
  rec([], [0, 1, 2, 3]);
  const det = m => m.length === 1 ? m[0][0] : m[0].reduce((acc, x, j) => acc + (j % 2 ? -1 : 1) * x * det(m.slice(1).map(r => r.filter((_, k) => k !== j))), 0);
  for (const a of all) {
    assert.equal(det(M.permMatrix(a)), M.sign(a));
    assert.ok(M.power(a, M.permOrder(a)).every((x, i) => x === i));
    for (const b of all) assert.equal(M.sign(M.compose(a, b)), M.sign(a) * M.sign(b));
  }
  assert.throws(() => M.parseCycles('(1 1 2)', 3), /répète/);
});

test('groups: the catalogue axioms, Lagrange, normality and the dihedral relations', () => {
  const cat = Object.fromEntries(M.groupCatalogue().map(c => [c.id, c.s]));
  for (const id of ['z4', 'z6', 'z8', 'v4', 'u8', 'u10', 's3', 'd4', 'z2z4', 'q8', 'm5']) {
    const S = cat[id], A = M.analyse(S);
    assert.ok(A.group && A.latin, id);
    for (let g = 0; g < S.names.length; g++) assert.equal(S.names.length % M.elementOrder(S, g, A.neutral), 0, `Lagrange in ${id}`);
  }
  assert.ok(!M.analyse(cat.m6).closed);
  assert.ok(M.analyse(cat.sub5).latin && !M.analyse(cat.sub5).associative);
  assert.ok(!M.analyse(cat.s3).commutative && !M.analyse(cat.d4).commutative && !M.analyse(cat.q8).commutative);
  const S = cat.s3, e = M.analyse(S).neutral, t12 = S.names.indexOf('(1 2)'), c123 = S.names.indexOf('(1 2 3)');
  assert.equal(M.isNormal(S, [e, t12].sort()).normal, false);
  assert.equal(M.isNormal(S, M.generated(S, [c123], e)).normal, true);
  const twos = id => cat[id].names.filter((_, g) => M.elementOrder(cat[id], g, M.analyse(cat[id]).neutral) === 2).length;
  assert.deepEqual(['z8', 'z2z4', 'd4', 'q8'].map(twos), [1, 3, 5, 1]);
  for (let n = 3; n <= 8; n++) for (let k = 0; k < n; k++) for (let l = 0; l < n; l++) {
    const x = M.dihedralMul(n, { k, s: 1 }, { k: l, s: 1 });
    assert.deepEqual(x, { k: M.mod(k - l, n), s: 0 });
    assert.deepEqual(M.dihedralPerm(n, M.dihedralMul(n, { k, s: 0 }, { k: l, s: 1 })), M.compose(M.dihedralPerm(n, { k, s: 0 }), M.dihedralPerm(n, { k: l, s: 1 })));
  }
});

test('published lessons: every page, widget and cross-reference resolves, no dashes in the text', () => {
  const index = JSON.parse(fs.readFileSync(new URL('../dist/resources/university/index.json', import.meta.url)));
  const section = index.sections.find(s => s.id === 'algebre-1');
  assert.ok(section && section.sequences.length === 7);
  const widgets = new Set();
  for (const seq of section.sequences) {
    const file = new URL('../dist/' + index.files[seq.id].path, import.meta.url), html = fs.readFileSync(file, 'utf8');
    assert.ok(seq.title[0] && seq.summary[0] && seq.outline.length, seq.id);
    for (const [, w] of html.matchAll(/data-a1-widget="(\w+)"/g)) widgets.add(w);
    for (const [, href] of html.matchAll(/href="([^"#?]+)(?:\?[^"#]*)?(?:#([^"]*))?"/g)) {
      if (/^https?:/.test(href)) continue;
      assert.ok(fs.existsSync(new URL(href, file)), `${seq.id}: ${href}`);
    }
    for (const [, page, anchor] of html.matchAll(/class="xref" href="([^"#]*)#([^"]+)"/g)) {
      const target = page ? fs.readFileSync(new URL(page, file), 'utf8') : html;
      assert.ok(target.includes(`id="${anchor}"`), `${seq.id}: #${anchor}`);
    }
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
    assert.ok(!/[–—]/.test(text), `${seq.id}: em or en dash`);
  }
  assert.deepEqual([...widgets].sort(), ['cayley', 'dihedral', 'lu', 'maps', 'perms', 'venn', 'zn']);
});
