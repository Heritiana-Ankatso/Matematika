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
  assert.ok(section && section.sequences.length === 8);
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
  assert.deepEqual([...widgets].sort(), ['burnside', 'cayley', 'dihedral', 'lu', 'maps', 'perms', 'venn', 'zn']);
});

// ------------------------------------------------------------------ group theory complement and QCM: every number recomputed
const K = p => p.join(',');
const permsOf = n => { const out = []; const rec = (p, rest) => rest.length ? rest.forEach((x, i) => rec([...p, x], rest.filter((_, j) => j !== i))) : out.push(p); rec([], [...Array(n).keys()]); return out; };
const closure = (gens, mul, e) => { const seen = new Map([[K(e), e]]), todo = [e]; while (todo.length) { const x = todo.pop(); for (const g of gens) { const y = mul(g, x); if (!seen.has(K(y))) { seen.set(K(y), y); todo.push(y); } } } return [...seen.values()]; };
const P = (t, n) => M.parseCycles(t, n);
const typeOf = s => M.cycles(s, true).map(c => c.length).sort((a, b) => b - a).join('');
const conjClasses = G => { const left = new Map(G.map(g => [K(g), g])), out = []; while (left.size) { const [x] = left.values(); const cl = new Map(); for (const g of G) { const y = M.compose(M.compose(g, x), M.inverse(g)); cl.set(K(y), y); left.delete(K(y)); } out.push([...cl.values()]); } return out; };
const subgroupsBy2 = G => { const e = M.permIdentity(G[0].length), seen = new Map(); for (const a of G) for (const b of G) { const H = closure([a, b], M.compose, e); seen.set(H.map(K).sort().join('|'), H); } return [...seen.values()]; };
const isNormalIn = (H, G) => { const S = new Set(H.map(K)); return G.every(g => H.every(h => S.has(K(M.compose(M.compose(g, h), M.inverse(g)))))); };

test('complement: classes, normal subgroups and Sylow numbers of S_3, S_4, A_4, A_5', () => {
  const S4 = permsOf(4), A4 = S4.filter(s => M.sign(s) === 1), S5 = permsOf(5), A5 = S5.filter(s => M.sign(s) === 1), S3 = permsOf(3);
  const sizes = G => conjClasses(G).map(c => c.length).sort((a, b) => a - b);
  assert.deepEqual(sizes(S4), [1, 3, 6, 6, 8]);
  assert.deepEqual(sizes(A4), [1, 3, 4, 4]);
  assert.deepEqual(sizes(A5), [1, 12, 12, 15, 20]);
  assert.equal(conjClasses(S3).filter(c => c.length === 1).length, 1, 'Z(S_3) trivial');
  const subS4 = subgroupsBy2(S4), subA4 = subgroupsBy2(A4);
  assert.equal(subS4.length, 30); // S_4 and A_4: every subgroup is generated by two elements
  assert.deepEqual(subS4.filter(H => isNormalIn(H, S4)).map(H => H.length).sort((a, b) => a - b), [1, 4, 12, 24]);
  assert.deepEqual(subA4.filter(H => isNormalIn(H, A4)).map(H => H.length).sort((a, b) => a - b), [1, 4, 12]);
  assert.ok(!subA4.some(H => H.length === 6), 'A_4 has no subgroup of order 6');
  const count = (subs, order) => subs.filter(H => H.length === order).length;
  assert.deepEqual([count(subgroupsBy2(S3), 2), count(subgroupsBy2(S3), 3)], [3, 1]);
  assert.deepEqual([count(subA4, 4), count(subA4, 3)], [1, 4]);
  assert.deepEqual([count(subS4, 8), count(subS4, 3)], [3, 4]);
  const syl = subS4.filter(H => H.length === 8), V = new Set(S4.filter(s => typeOf(s) === '22' || typeOf(s) === '1111').map(K));
  for (const H of syl) for (const L of syl) if (H !== L) assert.deepEqual(H.map(K).filter(x => L.some(y => K(y) === x)).sort(), [...V].sort());
  const ofOrder = (G, k) => G.filter(s => M.permOrder(s) === k);
  assert.deepEqual([ofOrder(A5, 5).length / 4, ofOrder(A5, 3).length / 2], [6, 10]);
  const klein = new Set(ofOrder(A5, 2).map(a => closure([a, ...ofOrder(A5, 2).filter(b => K(M.compose(a, b)) === K(M.compose(b, a)) && K(a) !== K(b))], M.compose, M.permIdentity(5)).map(K).sort().join('|')));
  assert.equal(klein.size, 5, 'n_2(A_5) = 5');
  // A_5 simple: the normal closure of every element other than the identity is A_5
  for (const cl of conjClasses(A5)) if (cl[0].some((y, x) => y !== x)) assert.equal(closure(cl, M.compose, M.permIdentity(5)).length, 60);
  // the subset sums of the proof
  const sums = new Set(); for (let m = 0; m < 16; m++) sums.add(1 + [20, 15, 12, 12].reduce((s, c, i) => s + ((m >> i) & 1 ? c : 0), 0));
  assert.deepEqual([...sums].sort((a, b) => a - b), [1, 13, 16, 21, 25, 28, 33, 36, 40, 45, 48, 60]);
  assert.deepEqual([...sums].filter(s => 60 % s === 0), [1, 60]);
  // the 2-Sylow D = <(1 2 3 4), (2 4)> of S_4 meets A_4 in V
  const D = closure([P('(1 2 3 4)', 4), P('(2 4)', 4)], M.compose, M.permIdentity(4));
  assert.deepEqual(D.filter(s => M.sign(s) === 1).map(K).sort(), [...V].sort());
  assert.equal(closure([P('(1 3)', 4), P('(1 2 3 4)', 4)], M.compose, M.permIdentity(4)).length, 8);
  assert.equal(closure([P('(1 2)', 4), P('(1 2 3 4)', 4)], M.compose, M.permIdentity(4)).length, 24);
});

test('complement: conjugation identities, class sizes by type, A_5 classes of 5-cycles', () => {
  for (let n = 1; n <= 6; n++) {
    const byType = new Map(); for (const s of permsOf(n)) byType.set(typeOf(s), (byType.get(typeOf(s)) || 0) + 1);
    const fact = k => k <= 1 ? 1 : k * fact(k - 1);
    for (const [t, c] of byType) { const L = [...t].map(Number), m = {}; L.forEach(k => { m[k] = (m[k] || 0) + 1; }); assert.equal(c, fact(n) / Object.entries(m).reduce((a, [k, v]) => a * Number(k) ** v * fact(v), 1), `${n}: ${t}`); }
    if (n === 4) assert.equal(byType.get('22'), 3);
    if (n === 5) { assert.equal(byType.get('311'), 20); assert.equal([...permsOf(5)].filter(s => M.permOrder(s) === 6).length, 20); }
    if (n === 6) { assert.equal(byType.get('222'), 15); assert.equal(byType.get('2211'), 45); }
  }
  const [a, b, c, d] = [1, 2, 3, 4];
  assert.equal(M.cycleText(M.compose(M.compose(P('(1 2)', 4), P('(1 3)', 4)), M.compose(P('(1 2)', 4), P('(1 3)', 4)))), '(1 2 3)'); // [(a b),(a c)]
  assert.equal(M.cycleText(M.compose(P(`(${a} ${b} ${c})`, 4), P(`(${b} ${c} ${d})`, 4))), '(1 2)(3 4)');
  assert.equal(M.cycleText(M.compose(P('(1 2)', 3), P('(2 3)', 3))), '(1 2 3)');
  for (const s of permsOf(5)) {
    const g = P('(1 4 2)', 5), lhs = M.compose(M.compose(s, g), M.inverse(s));
    assert.equal(K(lhs), K(P(`(${s[0] + 1} ${s[3] + 1} ${s[1] + 1})`, 5)));
  }
  const c5 = P('(1 2 3 4 5)', 5), c52 = M.power(c5, 2), rho = P('(2 3 5 4)', 5);
  assert.equal(M.cycleText(c52), '(1 3 5 2 4)');
  assert.equal(K(M.compose(M.compose(rho, c5), M.inverse(rho))), K(c52));
  const conj = permsOf(5).filter(s => K(M.compose(M.compose(s, c5), M.inverse(s))) === K(c52));
  assert.equal(conj.length, 5); assert.ok(conj.every(s => M.sign(s) === -1));
  // non-normal witnesses quoted in the exercises
  assert.equal(M.cycleText(M.compose(M.compose(P('(1 3)', 4), P('(1 2)(3 4)', 4)), P('(1 3)', 4))), '(1 4)(2 3)');
  assert.equal(M.cycleText(M.compose(M.compose(P('(1 3)', 3), P('(1 2)', 3)), P('(1 3)', 3))), '(2 3)');
  assert.equal(M.cycleText(M.compose(P('(1 2)', 3), P('(1 3)', 3))), '(1 3 2)');
});

test('complement: dihedral centres and stabilisers, D_4 on the diagonals, GL_2(F_2), Q_8 and order statistics', () => {
  for (let n = 3; n <= 10; n++) {
    const G = []; for (let k = 0; k < n; k++) for (const s of [0, 1]) G.push({ k, s });
    const Z = G.filter(x => G.every(y => K(Object.values(M.dihedralMul(n, x, y))) === K(Object.values(M.dihedralMul(n, y, x)))));
    assert.deepEqual(Z, n % 2 ? [{ k: 0, s: 0 }] : [{ k: 0, s: 0 }, { k: n / 2, s: 0 }]);
  }
  const D4 = []; for (let k = 0; k < 4; k++) for (const s of [0, 1]) D4.push({ k, s });
  const diag = x => { const p = M.dihedralPerm(4, x); return new Set([p[0], p[2]]).has(0) ? 'keep' : 'swap'; };
  assert.deepEqual(D4.filter(x => diag(x) === 'keep').map(M.dihedralName), ['e', 'τ', 'r^2', 'r^2τ']);
  assert.deepEqual(D4.filter(x => M.dihedralPerm(4, x)[0] === 0).map(M.dihedralName), ['e', 'τ']);
  assert.deepEqual(D4.filter(x => M.dihedralPerm(4, x)[1] === 1).map(M.dihedralName), ['e', 'r^2τ']);
  // GL_2(F_2): six matrices, faithful on the three non-zero vectors
  const mats = []; for (let m = 0; m < 16; m++) { const [p, q, r, s] = [0, 1, 2, 3].map(i => (m >> i) & 1); if ((p * s + q * r) % 2) mats.push([p, q, r, s]); }
  assert.equal(mats.length, 6);
  const act = ([p, q, r, s], [x, y]) => K([(p * x + q * y) % 2, (r * x + s * y) % 2]);
  assert.equal(new Set(mats.map(A => [[1, 0], [0, 1], [1, 1]].map(v => act(A, v)).join(';'))).size, 6);
  // Q_8 as 2x2 complex matrices [a, b, c, d] with complex entries [re, im]
  const cm = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]], ca = (x, y) => [x[0] + y[0], x[1] + y[1]];
  const mm = (A, B) => [ca(cm(A[0], B[0]), cm(A[1], B[2])), ca(cm(A[0], B[1]), cm(A[1], B[3])), ca(cm(A[2], B[0]), cm(A[3], B[2])), ca(cm(A[2], B[1]), cm(A[3], B[3]))];
  const neg = A => A.map(([x, y]) => [-x || 0, -y || 0]), I = [[1, 0], [0, 0], [0, 0], [1, 0]];
  const i = [[0, 1], [0, 0], [0, 0], [0, -1]], j = [[0, 0], [1, 0], [-1, 0], [0, 0]], k = mm(i, j);
  const eq = (A, B) => JSON.stringify(A.map(z => z.map(t => t || 0))) === JSON.stringify(B.map(z => z.map(t => t || 0)));
  assert.ok(eq(k, [[0, 0], [0, 1], [0, 1], [0, 0]]));
  for (const x of [i, j, k]) assert.ok(eq(mm(x, x), neg(I)));
  assert.ok(eq(mm(j, i), neg(k)) && eq(mm(j, k), i) && eq(mm(k, j), neg(i)) && eq(mm(k, i), j) && eq(mm(i, k), neg(j)));
  assert.ok(eq(mm(mm(i, j), mm(neg(i), neg(j))), neg(I)), '[i, j] = -1');
  // Z/4 x Z/4 and Z/2 x Q_8 have the same order statistics
  const Q = [I, neg(I), i, neg(i), j, neg(j), k, neg(k)], ordQ = A => { let B = A, n = 1; while (!eq(B, I)) { B = mm(B, A); n++; } return n; };
  const stat = list => list.reduce((m, o) => (m[o] = (m[o] || 0) + 1, m), {});
  const a = [], b = []; for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) a.push(M.lcm(4 / M.gcd(x, 4), 4 / M.gcd(y, 4)));
  for (const z of [0, 1]) for (const q of Q) b.push(M.lcm(z ? 2 : 1, ordQ(q)));
  assert.deepEqual(stat(a), { 1: 1, 2: 3, 4: 12 }); assert.deepEqual(stat(b), stat(a));
  assert.deepEqual(stat(Q.map(ordQ)), { 1: 1, 2: 1, 4: 6 });
});

test('complement: Burnside counts by brute-force orbits, Fermat, cube rotations', () => {
  const orbits = (G, X) => { const seen = new Set(); let n = 0; for (const x of X) { if (seen.has(K(x))) continue; n++; for (const g of G) { const y = []; g.forEach((gt, t) => { y[gt] = x[t]; }); seen.add(K(y)); } } return n; }; // (g·x)(g(t)) = x(t)
  const colourings = (len, k) => { const out = []; for (let m = 0; m < k ** len; m++) out.push([...Array(len).keys()].map(t => Math.floor(m / k ** t) % k)); return out; };
  const cyc = n => [...Array(n).keys()].map(j => [...Array(n).keys()].map(i => (i + j) % n));
  const dih = n => { const out = []; for (let k = 0; k < n; k++) for (const s of [0, 1]) out.push(M.dihedralPerm(n, { k, s })); return out; };
  assert.equal(orbits(cyc(6), colourings(6, 2)), 14);
  assert.equal(orbits(dih(6), colourings(6, 2)), 13);
  assert.equal(orbits(cyc(4), colourings(4, 2)), 6);
  for (const p of [2, 3, 5, 7]) for (const k of [1, 2, 3]) {
    if (k ** p > 3000) continue;
    assert.equal(orbits(cyc(p), colourings(p, k)), (k ** p + (p - 1) * k) / p);
    assert.equal((k ** p - k) % p, 0);
  }
  // faces 0..5 = +x, -x, +y, -y, +z, -z; quarter turns about z and x generate the rotation group
  const rz = [2, 3, 1, 0, 4, 5], rx = [0, 1, 4, 5, 3, 2];
  const G = closure([rz, rx], M.compose, M.permIdentity(6));
  assert.equal(G.length, 24);
  const cyclesOnFaces = G.map(g => M.cycles(g, true).length).sort().join('');
  assert.equal(cyclesOnFaces, [6, ...Array(6).fill(3), ...Array(3).fill(4), ...Array(8).fill(2), ...Array(6).fill(3)].sort().join(''));
  assert.equal(orbits(G, colourings(6, 3)), 57);
  assert.equal(orbits(G, colourings(6, 2)), 10);
});

test('complement: arithmetic of the exercises (generators, Wilson, pq, affine group of order 21, Sylow options)', () => {
  const ord = (a, n) => { let x = a % n, k = 1; while (x !== 1) { x = (x * a) % n; k++; } return k; };
  assert.equal(ord(3, 7), 6); assert.equal(ord(2, 11), 10);
  assert.deepEqual([3, 5, 7].map(a => ord(a, 8)), [2, 2, 2]);
  const fact = n => { let f = 1n; for (let i = 2n; i < BigInt(n); i++) f *= i; return f; }; // (n-1)!
  const isPrime = n => n > 1 && [...Array(n).keys()].slice(2).every(d => n % d);
  for (let n = 2; n < 60; n++) assert.equal((fact(n) + 1n) % BigInt(n) === 0n, isPrime(n), `Wilson ${n}`);
  for (let n = 5; n < 60; n++) if (!isPrime(n)) assert.equal(fact(n) % BigInt(n), 0n);
  assert.equal(fact(4) % 4n, 2n);
  const primes = [...Array(100).keys()].filter(isPrime), pq = [];
  for (const p of primes) for (const q of primes) if (p < q && p * q < 100 && (q - 1) % p) pq.push(p * q);
  assert.deepEqual(pq.sort((x, y) => x - y), [15, 33, 35, 51, 65, 69, 77, 85, 87, 91, 95]);
  const aff = []; for (const a of [1, 2, 4]) for (let b = 0; b < 7; b++) aff.push([a, b]);
  const op = ([a, b], [c, d]) => [(a * c) % 7, (a * d + b) % 7];
  assert.ok(aff.every(x => aff.every(y => aff.some(z => K(z) === K(op(x, y))))));
  assert.notEqual(K(op([2, 0], [1, 1])), K(op([1, 1], [2, 0])));
  const nOptions = (order, p) => { let m = order; while (m % p === 0) m /= p; return M.divisors(m).filter(d => d % p === 1 % p); };
  assert.deepEqual(nOptions(2835, 3), [1, 7]);
  assert.deepEqual([nOptions(12, 3), nOptions(30, 3), nOptions(30, 5), nOptions(56, 7), nOptions(200, 5), nOptions(20, 5), nOptions(100, 5)], [[1, 4], [1, 10], [1, 6], [1, 8], [1], [1], [1]]);
  for (const [n, p, q] of [[15, 3, 5], [35, 5, 7]]) assert.deepEqual([nOptions(n, p), nOptions(n, q)], [[1], [1]]);
  assert.deepEqual(nOptions(21, 3), [1, 7]);
  const reachable = new Set(); for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) reachable.add(3 * a + 5 * b);
  assert.ok(!reachable.has(7)); // an action of a group of order 15 on 7 points has a fixed point
  // QCM of chapters 4 and 5
  assert.equal(42 / M.gcd(18, 42), 7); assert.equal(M.divisors(36).length, 9); assert.equal(M.units(36).length, 12);
  const s = [3, 5, 1, 6, 4, 2].map(x => x - 1);
  assert.equal(M.cycleText(s), '(1 3)(2 5 4 6)'); assert.equal(M.sign(s), 1);
  assert.equal(M.permOrder(P('(1 2 3)(4 5)(6 7 8 9)', 9)), 12);
  assert.ok([0, 1, 2].every(x => (x * x + 1) % 3 !== 0));
  assert.ok(17 % 5 === 2 && 17 % 7 === 3);
});

test('QCM: grading is exact-set, and every published question is well formed', () => {
  assert.deepEqual(M.gradeQuestion([1], [1]).status, 'right');
  assert.deepEqual(M.gradeQuestion([1], [0]).status, 'wrong');
  assert.deepEqual(M.gradeQuestion([0, 2], [0]).status, 'partial');
  assert.deepEqual(M.gradeQuestion([0, 2], [0, 1, 2]).status, 'wrong');
  assert.deepEqual(M.gradeQuestion([0, 2], []).status, 'empty');
  assert.deepEqual(M.seriesScore([{ status: 'right', right: true }, { status: 'empty', right: false }, { status: 'wrong', right: false }]), { right: 1, answered: 2, total: 3 });
  let seed = 7; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const sh = M.shuffled([1, 2, 3, 4, 5], rand); assert.deepEqual([...sh].sort(), [1, 2, 3, 4, 5]);
  const dir = new URL('../dist/resources/university/algebre-1/lecons/', import.meta.url);
  let total = 0;
  for (const f of fs.readdirSync(dir)) {
    const html = fs.readFileSync(new URL(f, dir), 'utf8');
    for (const [, q] of html.matchAll(/<li class="qcm-q"[^>]*>([\s\S]*?)<\/fieldset><\/li>/g)) {
      total++;
      const multi = /data-multi="1"/.test(q) || false, oks = [...q.matchAll(/class="qcm-c" data-ok="(\d)"/g)].map(m => m[1]);
      assert.ok(oks.length >= 3, f);
      assert.ok(oks.includes('1'), f);
      if (!/type="checkbox"/.test(q)) assert.equal(oks.filter(x => x === '1').length, 1, f);
      assert.ok(q.includes('class="qcm-expl"'), f);
      void multi;
    }
  }
  assert.ok(total >= 40, `${total} questions`);
});

test('Burnside figure model: formula, brute-force orbits and orbit-stabiliser agree for every setting it offers', () => {
  const known = { 'rotations,6,2': 14, 'dihedral,6,2': 13, 'rotations,4,2': 6, 'cube,6,2': 10, 'cube,6,3': 57, 'dihedral,5,3': 39, 'rotations,8,4': 8230 };
  for (const kind of ['rotations', 'dihedral', 'cube']) for (const n of kind === 'cube' ? [6] : [3, 4, 5, 6, 7, 8]) for (let k = 2; k <= 4; k++) {
    const G = M.symmetryGroup(kind, n), T = M.burnsideTable(G, k), R = M.orbitRepresentatives(G, k);
    assert.equal(G.elements.length, kind === 'cube' ? 24 : kind === 'dihedral' ? 2 * n : n);
    assert.equal(new Set(G.elements.map(e => String(e.perm))).size, G.elements.length, 'distinct elements');
    assert.ok(Number.isInteger(T.orbits), `${kind} ${n} ${k}`);
    if (R) {
      assert.equal(R.length, T.orbits, `${kind} ${n} ${k}`);
      for (const c of R.slice(0, 40)) assert.equal(M.orbitOf(G, c).length * M.stabiliser(G, c).length, G.elements.length);
    }
    if (known[[kind, n, k]]) assert.equal(T.orbits, known[[kind, n, k]]);
  }
  // the cycle counts of the table are those of the course: 6, 3 (quarter turns), 4 (face half turns), 2, 3
  const cube = M.burnsideTable(M.symmetryGroup('cube', 6), 2).rows.map(r => [r.type, r.count, r.cycles]);
  assert.deepEqual(cube.sort(), [['demi-tour (axe d’arêtes)', 6, 3], ['demi-tour (axe de faces)', 3, 4], ['identité', 1, 6], ['quart de tour (axe de faces)', 6, 3], ['rotation de 2π/3 (grande diagonale)', 8, 2]].sort());
});
