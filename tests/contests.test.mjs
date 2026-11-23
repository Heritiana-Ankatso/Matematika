// The competition archive (site/js/contests/): every competition entry is complete, every paper bilingual, Olympiad
// solutions only on their own page, every published answer checked by an exhaustive or independent computation
// (models.js), the command tasks accept the official answer and refuse the wrong ones, and the pages render.
import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPETITIONS, isContestRoute, competition } from '../site/js/contests/registry.js';
import * as M from '../site/js/contests/models.js';
import { contestsPage } from '../site/js/contests/page.js';

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

test('BCC 2023: the official answers, and the command checkers refuse the wrong options', () => {
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
  const bcc = competition('bcc').papers[0].problems;
  assert.deepEqual(bcc.map((p) => p.correct), [2, 2, 3, 0, 1]);
});

test('routes: Olympiad problems have a solution page, contest problems do not', () => {
  assert.ok(isContestRoute(undefined));
  assert.ok(isContestRoute('imo') && isContestRoute('imo', '2024') && isContestRoute('imo', '2024', '5'));
  assert.ok(!isContestRoute('imo', '1999') && !isContestRoute('imo', '2024', '7') && !isContestRoute('nope'));
  assert.ok(isContestRoute('bcc', '2023-9-10') && !isContestRoute('bcc', '2023-9-10', '1'));
  assert.ok(isContestRoute('pamo') && !isContestRoute('pamo', '2024'));
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
    const bcc = contestsPage({ id: 'bcc', tab: '2023-9-10' }, t, lang);
    assert.ok(bcc.includes('olymp-solution') && bcc.includes('contest-choices') && bcc.includes('data-contest-widget="trains"'));
    for (const html of [index, imo, sol, bcc]) assert.ok(!/undefined|NaN|\[object/.test(html));
  }
});
