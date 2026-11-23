// The competition archive (site/js/contests/): every competition entry is complete, every paper bilingual, Olympiad
// solutions only on their own page, every published answer checked by an exhaustive or independent computation
// (models.js), the command tasks accept the official answer and refuse the wrong ones, and the pages render.
import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPETITIONS, isContestRoute, competition } from '../site/js/contests/registry.js';
import * as M from '../site/js/contests/models.js';
import { contestsPage, sameAnswer } from '../site/js/contests/page.js';

const pair = (x) => Array.isArray(x) && x.length === 2 && x.every((s) => typeof s === 'string' && s.trim().length > 0);
const balanced = (s) => (s.match(/\\\(/g) || []).length === (s.match(/\\\)/g) || []).length && (s.match(/\\\[/g) || []).length === (s.match(/\\\]/g) || []).length;
const T = (lang) => (x) => (Array.isArray(x) ? x[lang === 'fr' ? 0 : 1] : x);

test('every competition names its field, kind, level and terms; ids are unique', () => {
  assert.equal(new Set(COMPETITIONS.map((c) => c.id)).size, COMPETITIONS.length);
  for (const c of COMPETITIONS) {
    assert.ok(['math', 'cs'].includes(c.field), c.id);
    assert.ok(['olympiad', 'contest'].includes(c.kind), c.id);
    for (const x of [c.name, c.level, c.rights]) assert.ok(pair(x), c.id);
    if (c.site) assert.match(c.site, /^https:\/\//, c.id);
    assert.ok(Array.isArray(c.papers), c.id);
  }
});

test('every published section holds at least 24 papers (owner rule, 24 November 2026), with distinct years and statements in both languages', () => {
  assert.deepEqual(COMPETITIONS.map((c) => c.id), ['imo', 'euclid']);
  for (const c of COMPETITIONS) {
    assert.ok(c.papers.length >= 24, `${c.id}: ${c.papers.length} papers`);
    assert.equal(new Set(c.papers.map((p) => p.id)).size, c.papers.length, `${c.id}: duplicate paper`);
    for (const p of c.papers) assert.ok(p.problems.length >= 2, `${c.id} ${p.id}: too few problems`);
  }
});

test('papers: bilingual statements and solutions, balanced maths, no dashes, numbered problems', () => {
  for (const c of COMPETITIONS) for (const p of c.papers) {
    assert.ok(p.problems.length > 0, `${c.id} ${p.id}`);
    p.problems.forEach((x, i) => {
      assert.equal(x.n, i + 1, `${c.id} ${p.id}: numbering`);
      const texts = [x.title, ...(Array.isArray(x.q[0]) ? x.q : [x.q]), ...(x.s || []), ...(x.answer ? [x.answer] : []), ...(x.check ? [x.check] : []), ...(x.command ? [x.command] : [])];
      for (const s of texts) {
        assert.ok(pair(s), `${c.id} ${p.id} ${x.n}: missing language`);
        for (const v of s) { assert.ok(balanced(v), `${c.id} ${p.id} ${x.n}: maths ${v.slice(0, 50)}`); assert.ok(!/[–—]/.test(v), `${c.id} ${p.id} ${x.n}: dash`); }
      }
      // an Olympiad solution carries its answer and a computed check where it states a result
      if (c.kind === 'olympiad' && x.s) assert.ok(x.answer && x.check, `${c.id} ${p.id} ${x.n}: answer and check`);
      if (x.choices) assert.ok(x.correct >= 0 && x.correct < x.choices.length, `${c.id} ${p.id} ${x.n}: correct choice`);
    });
  }
});

test('IMO 2023 P1: composite n up to 20000 with the divisor chain are exactly the prime powers', () => {
  for (let n = 4; n <= 20000; n++) {
    if (M.divisors(n).length <= 2) continue;
    assert.equal(M.chainBreak(n) === 0, M.isPrimePower(n), `n = ${n}`);
  }
});

test('IMO 2024 P1: for p/q with q <= 12 and |p/q| <= 6, the property holds to n = 200 exactly for even integers', () => {
  for (let q = 1; q <= 12; q++) for (let p = -6 * q; p <= 6 * q; p++) {
    const even = p % q === 0 && (p / q) % 2 === 0;
    assert.equal(M.firstFailure(p, q, 200) === 0, even, `${p}/${q}`);
  }
  // the induction of the solution: for 1 <= alpha < 2 the floors are forced to 2k - 1 while they last
  assert.deepEqual(M.floorSums(199, 100, 5).map(Number), [1, 4, 9, 16, 25]);
});

test('IMO 2024 P2: the gcd settles only for (1, 1)', () => {
  for (let a = 1; a <= 12; a++) for (let b = 1; b <= 12; b++) {
    const g = M.gcdSequence(a, b, 160).slice(100);
    assert.equal(g.every((x) => x === g[0]), a === 1 && b === 1, `(${a}, ${b})`);
  }
});

test('IMO 2024 P5: the strategy reaches the last row within three attempts on every placement (3 to 7 columns), moving one square at a time', () => {
  for (const C of [3, 4, 5, 6, 7]) {
    let count = 0;
    const rec = (pref) => {
      if (pref.length === C - 1) {
        count++;
        const at = M.turboStrategy(pref, C);
        assert.ok(at.length <= 3, `C=${C} ${pref}: ${at.length} attempts`);
        assert.ok(M.walk(pref, C, at[at.length - 1]).ok, `C=${C} ${pref}: last attempt fails`);
        for (const path of at) {
          assert.equal(path[0][0], 0);
          for (let i = 1; i < path.length; i++) {
            assert.equal(Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1]), 1);
            assert.ok(path[i][1] >= 0 && path[i][1] < C && path[i][0] >= 0 && path[i][0] <= C);
          }
        }
        return;
      }
      for (let c = 0; c < C; c++) if (!pref.includes(c)) rec([...pref, c]);
    };
    rec([]);
    assert.equal(count, [1, 1, 1, 6, 24, 120, 720, 5040][C]);
  }
});

test('IMO 2025 P1: exhaustive search gives k in {0, 1, 3} for n = 3 and n = 4; a sunny line covers at most two points of T_3', () => {
  assert.deepEqual(M.sunnyCounts(3), [0, 1, 3]);
  assert.deepEqual(M.sunnyCounts(4), [0, 1, 3]);
  const pts = M.trianglePoints(3);
  for (const p of pts) for (const q of pts) {
    const L = M.lineThrough(p, q); if (!L || !M.isSunny(L)) continue;
    assert.ok(pts.filter((x) => M.onLine(L, x)).length <= 2);
  }
  // the three constructions of the solution
  const lines = (pairs) => pairs.map(([p, q]) => M.lineThrough(p, q));
  const k0 = lines([[[1, 1], [1, 2]], [[2, 1], [2, 2]], [[3, 1], [3, 2]]]);
  const k1 = lines([[[1, 1], [1, 2]], [[2, 1], [2, 2]], [[3, 1], [4, 2]]]);
  const k3 = lines([[[1, 1], [2, 2]], [[1, 2], [3, 1]], [[2, 1], [1, 3]]]);
  for (const [ls, k] of [[k0, 0], [k1, 1], [k3, 3]]) { const c = M.coverage(3, ls); assert.equal(c.covered, c.total); assert.equal(c.sunny, k); }
});

test('IMO 2023 P4: on random sequences of distinct reals, a_{n+2} > a_n + 2 at every step', () => {
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 2000; k++) {
    const xs = Array.from({ length: 12 }, () => 0.01 + rnd() * 10), a = M.aSequence(xs);
    for (let i = 0; i + 2 < a.length; i++) assert.ok(a[i + 2] > a[i] + 2, `step ${i}`);
  }
  // equality case: two equal numbers at sqrt(S/T) give exactly + 2
  const a = M.aSequence([1, 4, 2, 2]); assert.ok(Math.abs(a[3] - a[1] - 2) < 1e-12);
});

test('IMO 2025 P5: the strategies of the solution win, or never lose, against random opponents', () => {
  let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const randomAlice = ({ n, S, lambda }) => rnd() * Math.max(lambda * n - S, 0) * (rnd() < 0.3 ? 1 : rnd());
  const randomBazza = ({ n, Q }) => rnd() * Math.sqrt(Math.max(n - Q, 0));
  for (let g = 0; g < 500; g++) {
    assert.equal(M.playGame(0.6, randomAlice, M.bazzaFills).winner, 'Bazza');
    assert.equal(M.playGame(0.8, M.aliceWaits(70), randomBazza).winner, 'Alice');
  }
  // the k of the solution: ((2 lambda - sqrt 2) k)^2 > 2k + 2, here k = 70 for lambda = 0.8; it beats Bazza filling up too
  assert.ok(((1.6 - Math.SQRT2) * 70) ** 2 > 142);
  assert.equal(M.playGame(0.8, M.aliceWaits(70), M.bazzaFills).winner, 'Alice');
  assert.equal(M.playGame(0.6, M.aliceWaits(70), M.bazzaFills).winner, 'Bazza');
  const r = Math.SQRT1_2;
  assert.equal(M.playGame(r, M.aliceWaits(Infinity), M.bazzaFills, 400).winner, null);
  assert.notEqual(M.playGame(r, randomAlice, M.bazzaFills, 400).winner, 'Alice');
  assert.notEqual(M.playGame(r, M.aliceWaits(Infinity), randomBazza, 400).winner, 'Bazza');
});

test('BCC 2023 (unpublished source): the official answers, and the command checkers refuse the wrong options', async () => {
  assert.ok(M.runVideo([1, 1, 0, 7, 7, 5, 5, 4, 3, 3]).ok);
  for (const s of [[1, 1, 7, 7, 5, 5, 3, 3], [1, 1, 4, 7, 7, 5, 5, 0, 3, 3], [7, 7, 0, 1, 1, 5, 5, 4, 3, 3]]) assert.ok(!M.runVideo(s).ok);
  // the same tour the other way round is complete but anticlockwise
  const ccw = M.runVideo([7, 7, 0, 1, 1, 3, 3, 4, 5, 5]);
  assert.ok(ccw.back && ccw.all && !ccw.clockwise && !ccw.ok);
  assert.equal(M.bestButtons(), 8);
  assert.deepEqual(M.runButtons('RQPRRPQR'.split('')).dropped, [2, 3, 4, 5, 6, 8, 9, 10]);
  assert.deepEqual([0, 1, 2, 3].map((s) => M.runCarrots(s).ok), [false, false, true, false]);
  assert.deepEqual(M.runCarrots(2).left, [1]);
  assert.equal(M.runLockers(M.LOCKER_EVENTS).placed.at(-1), 20);
  const opts = ['OUT(1) OUT(2) IN(1) OUT(2) OUT(2) IN(1) OUT(3)', 'OUT(1) OUT(2) IN(1) OUT(2) OUT(2) IN(1) OUT(3) IN(2) OUT(3) IN(1)', 'OUT(1) OUT(2) IN(1) OUT(2) IN(1) OUT(3) IN(2) OUT(3) IN(1)', 'OUT(1) OUT(2) IN(1) OUT(2) OUT(2) IN(1) OUT(3) OUT(3) IN(1)'];
  assert.deepEqual(opts.map((o) => M.runTrains(M.parseTrainCommands(o)).ok), [false, true, false, false]);
  // the French command names give the same machine; the statement's example swaps trains 5 and 6
  assert.ok(M.runTrains(M.parseTrainCommands('SORT(1) SORT(2) ENTRE(1) SORT(2) SORT(2) ENTRE(1) SORT(3) ENTRE(2) SORT(3) ENTRE(1)')).ok);
  assert.deepEqual(M.runTrains(M.parseTrainCommands('OUT(3) OUT(1) IN(3) IN(1)')).depots, [[6], [2, 7, 1], [4, 3, 5]]);
  // the published choices agree with the machines
  const bcc = (await import('../site/js/contests/bcc.js')).PAPERS[0].problems;   // unpublished since 24 November 2026 (fewer than 24 papers)
  assert.deepEqual(bcc.map((p) => p.correct), [2, 2, 3, 0, 1]);
});

test('Euclid 2025: every published answer recomputed by brute force or substitution', () => {
  // 5 (a) the lock
  let lock = 0;
  for (let a = 1; a <= 40; a++) for (let b = 1; b <= 40; b++) for (let c = 1; c <= 40; c++) {
    const v = [a, b, c]; if (new Set(v).size === 3 && b < a && b < c && v.includes(20) && v.includes(30)) lock++;
  }
  assert.equal(lock, 76);
  // 5 (b) the three values of cos theta give a geometric sequence (sin from the solution), and no others on a fine grid
  for (const [co, si] of [[2 * Math.SQRT2 / 3, -1 / 3], [-2 * Math.SQRT2 / 3, -1 / 3], [0, 1]]) assert.ok(Math.abs((1 + si) ** 2 - (2 - 2 * co) * (2 + 2 * co)) < 1e-12);
  for (let k = 0; k < 100000; k++) {
    const th = (2 * Math.PI * k) / 100000, f = (1 + Math.sin(th)) ** 2 - 4 + 4 * Math.cos(th) ** 2;
    if (Math.abs(f) < 1e-9) assert.ok([2 * Math.SQRT2 / 3, -2 * Math.SQRT2 / 3, 0].some((v) => Math.abs(Math.cos(th) - v) < 1e-4), `theta ${th}`);
  }
  // 6 (a) triangles with two equal sides among twelve points
  const gap = (x, y) => Math.min((x - y + 12) % 12, (y - x + 12) % 12); let iso = 0;
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) { const d = [gap(i, j), gap(j, k), gap(i, k)]; if (d[0] === d[1] || d[1] === d[2] || d[0] === d[2]) iso++; }
  assert.equal(iso, 52);
  // 7 (b) both pairs satisfy the system
  for (const [x, y] of [[20, 5], [1 / 5, 1 / 20]]) { assert.ok(Math.abs(x * x - 8 * x * y + 16 * y * y) < 1e-12); assert.ok(Math.abs((Math.log10(x) + Math.log10(y)) ** 2 - 4) < 1e-12); }
  // 8 (a) exact fractions
  const [a, b, c] = [3 / 5, 3 / 4, 2 / 3];
  assert.ok(Math.abs(a * (1 - b) - 3 / 20) < 1e-15 && Math.abs(b * (1 - c) - 1 / 4) < 1e-15 && Math.abs(a * c - 2 / 5) < 1e-15 && Math.abs(1 - a * b * c - 7 / 10) < 1e-15);
  // 8 (b) palindromes
  const pal = []; for (let d1 = 1; d1 <= 9; d1++) for (let d2 = 0; d2 <= 9; d2++) pal.push(Number(`${d1}${d2}${d2}${d1}`));
  let pairs = 0; for (const m of pal) for (const n of pal) if (m > n && (m - n) % 35 === 0) pairs++;
  assert.equal(pairs, 91);
  // 9: every (q, d) with average 19, three rational roots only for (10, 6), roots 1, 2, -7/5
  const good = [];
  for (let q = 1; q < 38; q++) for (let d = 1; d < 38; d++) {
    if (4 * q + 6 * d !== 76) continue;
    const disc = d * d + 4 * q * (q + 3 * d), r = Math.round(Math.sqrt(disc));
    if (r * r === disc) good.push([q, d]);
  }
  assert.deepEqual(good, [[10, 6]]);
  const p = (x) => 10 * x ** 3 - 16 * x ** 2 - 22 * x + 28;
  for (const x of [1, 2, -7 / 5]) assert.ok(Math.abs(p(x)) < 1e-12);
  // 10: the official sequence wins; winnable exactly when n is not 1 modulo 3 (elimination over Z/2, n up to 16)
  assert.ok(M.coinsWon(3, M.parseCoinMoves('T(1,1) T(2,1) T(2,3) T(2,2)')));
  assert.ok(M.coinsWon(2, [[1, 1]]) && !M.coinsWon(3, [[1, 1]]));
  for (let n = 1; n <= 16; n++) assert.equal(M.coinsWinnable(n), n % 3 !== 1, `n = ${n}`);
  // the labelling of the proof: three neighbouring coins carry 1, 2 and 3; counts 3t + 1, 3t, 3t for n = 3k + 1
  const label = (r, i) => ((((r - 1) % 3) + (i - 1)) % 3) + 1;
  for (let n = 2; n <= 13; n++) for (const [r, j] of M.coinMoves(n)) assert.deepEqual(M.coinMove(r, j).map(([x, y]) => label(x, y)).sort(), [1, 2, 3]);
  for (const k of [1, 2, 3, 4]) {
    const n = 3 * k + 1, t = (k * (k + 1)) / 2, cnt = [0, 0, 0, 0];
    for (let r = 1; r <= n; r++) for (let i = 1; i <= r; i++) cnt[label(r, i)]++;
    assert.deepEqual(cnt.slice(1), [3 * t + 1, 3 * t, 3 * t]);
  }
  for (const x of [1, -1]) for (const y of [2, -2]) for (const z of [3, -3]) assert.equal(Math.abs(x + y + z) % 2, 0);
  // typed answers
  assert.ok(sameAnswer(' 76 ', ['76']) && sameAnswer('0,7', ['7/10', '0.7']) && !sameAnswer('0.75', ['7/10', '0.7']));
});

test('routes: Olympiad problems have a solution page, contest problems do not', () => {
  assert.ok(isContestRoute(undefined));
  assert.ok(isContestRoute('imo') && isContestRoute('imo', '2024') && isContestRoute('imo', '2024', '5'));
  assert.ok(!isContestRoute('imo', '1999') && !isContestRoute('imo', '2024', '7') && !isContestRoute('nope'));
  assert.ok(!isContestRoute('bcc') && !isContestRoute('pamo') && !isContestRoute('nope', '2024'));   // sections under 24 papers are removed
});

test('pages render in both languages; an Olympiad paper never prints a solution, its solution page does', () => {
  for (const lang of ['fr', 'en']) {
    const t = T(lang);
    const index = contestsPage({}, t, lang);
    for (const c of COMPETITIONS) assert.ok(index.includes(`#contests/${c.id}`), c.id);
    const imo = contestsPage({ id: 'imo', tab: '2024' }, t, lang);
    const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    for (const p of competition('imo').papers) {
      const html = contestsPage({ id: 'imo', tab: p.id }, t, lang);
      assert.ok(!html.includes('class="contest-solution"') && !html.includes('olymp-solution'), `${p.id}: solution block on an Olympiad paper`);
      for (const x of p.problems) for (const para of x.s || []) assert.ok(!html.includes(esc(t(para)).slice(0, 80)), `${p.id} ${x.n}: solution text on the paper`);
    }
    for (const n of [1, 2, 5]) assert.ok(imo.includes(`#contests/imo/2024/${n}`));
    assert.ok(imo.includes('data-contest-widget="turbo"'));
    const sol = contestsPage({ id: 'imo', tab: '2024', sub: '5' }, t, lang);
    assert.ok(sol.includes('class="contest-solution"') && sol.includes('data-mode="strategy"'));
    const pending = contestsPage({ id: 'imo', tab: '2024', sub: '6' }, t, lang);
    assert.ok(!pending.includes('class="contest-solution"'));
    const euc = contestsPage({ id: 'euclid', tab: '2025' }, t, lang);
    assert.ok(euc.includes('contest-typed') && euc.includes('data-contest-widget="coins"') && euc.includes('olymp-solution') && euc.includes('Question 10'));
    assert.ok(isContestRoute('euclid', '2025') && !isContestRoute('euclid', '2025', '1'));
    for (const html of [index, imo, sol]) assert.ok(!/undefined|NaN|\[object/.test(html));
  }
});

// ---- IMO 2025 P2, P3, P4, P6 and IMO 2026 (the solutions and figures added from the official 2025 shortlist and papers)
test('IMO 2025 P4: the values of a1 below 20000 that give an infinite sequence are exactly 12^M * 6 * N with N coprime to 10', async () => {
  const { divisorOrbit } = await import('../site/js/contests/models.js');
  const formula = new Set();
  for (let M = 0; 12 ** M * 6 <= 20000; M++) for (let N = 1; 12 ** M * 6 * N <= 20000; N++) if (N % 2 && N % 5) formula.add(12 ** M * 6 * N);
  const found = new Set();
  for (let a = 1; a <= 20000; a++) { const { status } = divisorOrbit(a, 200); if (status === 'constant' || status === 'running') found.add(a); }
  assert.deepEqual([...found].sort((x, y) => x - y), [...formula].sort((x, y) => x - y));
});
test('IMO 2025 P3: the function of the solution is bonza and has f(4) = 16 = 4 * 4 (a, b up to 400, exact arithmetic)', () => {
  const f = (n) => (n % 2 ? 1n : n === 4 ? 16n : 2n);
  for (let a = 1n; a <= 400n; a++) for (let b = 1n; b <= 400n; b++) {
    const m = f(Number(a)); assert.equal(((b ** a - f(Number(b)) ** m) % m + m) % m, 0n, `a=${a} b=${b}`);
  }
  assert.equal(Number(f(4)) / 4, 4);
});
test('IMO 2025 P6: the exact minimum for n = 2..5 matches ceil(n + 2 sqrt(n) - 3), and k^2 + 2k - 3 for n = 4', async () => {
  const { minTiles, tilesReport, canAddTile } = await import('../site/js/contests/models.js');
  for (const n of [2, 3, 4, 5]) assert.equal(minTiles(n), Math.ceil(n + 2 * Math.sqrt(n) - 3), `n=${n}`);
  assert.equal(minTiles(4), 4 + 2 * 2 - 3);
  // the checker: a valid layout on 4 x 4 with free squares on the diagonal, and an invalid one
  const t = [{ r0: 0, c0: 1, r1: 0, c1: 3 }, { r0: 1, c0: 2, r1: 1, c1: 3 }, { r0: 2, c0: 3, r1: 2, c1: 3 }, { r0: 1, c0: 0, r1: 3, c1: 0 }, { r0: 2, c0: 1, r1: 3, c1: 1 }, { r0: 3, c0: 2, r1: 3, c1: 2 }];
  assert.ok(tilesReport(4, t).ok); assert.ok(!tilesReport(4, t.slice(1)).ok);
  assert.ok(!canAddTile(4, t, { r0: 0, c0: 0, r1: 0, c1: 2 }) && canAddTile(4, [], { r0: 0, c0: 0, r1: 3, c1: 3 }));
});
test('IMO 2025 P2: tangency checked numerically on random circle pairs', () => {
  let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], dot = (a, b) => a[0] * b[0] + a[1] * b[1], cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const circ = (A, B, C) => {   // circumcentre
    const D = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1])), a2 = dot(A, A), b2 = dot(B, B), c2 = dot(C, C);
    return [(a2 * (B[1] - C[1]) + b2 * (C[1] - A[1]) + c2 * (A[1] - B[1])) / D, (a2 * (C[0] - B[0]) + b2 * (A[0] - C[0]) + c2 * (B[0] - A[0])) / D];
  };
  const second = (A, P, Cc) => { const d = sub(P, A), t = -2 * dot(sub(A, Cc), d) / dot(d, d); return [A[0] + t * d[0], A[1] + t * d[1]]; };   // second intersection of line AP with the circle of centre Cc through A
  let checked = 0;
  for (let k = 0; k < 60; k++) {
    const r = 1 + rnd(), R = r + 0.3 + rnd() * 2, dd = R - r + 0.2 + rnd() * (r - 0.05) ; // centres M = (0,0), N = (dd, 0); circles meet when R - r < dd < R + r
    const M = [0, 0], N = [dd, 0], x = (dd * dd + r * r - R * R) / (2 * dd), y = Math.sqrt(Math.max(r * r - x * x, 0)); if (y < 0.05) continue;
    const A = [x, y], B = [x, -y], C = [-r, 0], D = [dd + R, 0], P = circ(A, C, D), E = second(A, P, M), F = second(A, P, N);
    // orthocentre H of PMN: H = P + M + N - 2 * circumcentre
    const O = circ(P, M, N), H = [P[0] + M[0] + N[0] - 2 * O[0], P[1] + M[1] + N[1] - 2 * O[1]];
    const Q = circ(B, E, F), rad = Math.hypot(...sub(B, Q)), u = sub(P, A), dist = Math.abs(cross(sub(Q, H), u)) / Math.hypot(...u);
    assert.ok(Math.abs(dist - rad) < 1e-7 * (1 + rad), `case ${k}: ${dist} vs ${rad}`); checked++;
  }
  assert.ok(checked >= 30, `only ${checked} configurations were checked`);
});
test('IMO 2026 P1: random play always ends with one entry above 1, and its value does not depend on the moves', async () => {
  const { boardMove, boardFinished, boardRandomPlay } = await import('../site/js/contests/models.js');
  assert.deepEqual(boardMove([4, 6, 5], 0, 1), [2, 6, 5]);
  assert.deepEqual(boardMove([2, 3], 0, 1), [1, 6]);
  assert.equal(boardMove([1, 6], 0, 1), null); assert.equal(boardMove([4, 6], 0, 0), null);
  assert.ok(boardFinished([1, 6, 1]) && !boardFinished([2, 3]));
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let k = 0; k < 60; k++) {
    const board = Array.from({ length: 2 + (k % 6) }, () => 2 + Math.floor(rnd() * 40)), finals = new Set();
    for (let r = 0; r < 5; r++) { const p = boardRandomPlay(board, rnd); assert.ok(p.finished && p.board.filter((x) => x > 1).length === 1, board.join()); finals.add(p.board.find((x) => x > 1)); }
    assert.equal(finals.size, 1, `M depends on the play for ${board.join()}`);
  }
});
test('IMO 2026 P6: the sequence follows the rule', async () => {
  const { sharedSequence } = await import('../site/js/contests/models.js');
  assert.deepEqual(sharedSequence(2, 5), [2, 4, 6, 8, 10]);
  assert.deepEqual(sharedSequence(6, 4), [6, 8, 10, 12]);
  assert.deepEqual(sharedSequence(1, 3), []);
});
