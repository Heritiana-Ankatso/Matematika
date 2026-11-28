// Algèbre 1: pure maths behind the lesson interactives (sets, maps, Z/nZ, elimination, groups, permutations, D_n). No DOM.

// ---------------------------------------------------------------- sets
// Three sets A, B, C cut the universe into 8 regions; region r holds the x with (x∈A, x∈B, x∈C) = bits (1, 2, 4) of r.
// An expression evaluates to the 8-bit mask of the regions it contains: two expressions are equal for every choice of
// A, B, C exactly when their masks agree (the regions are the lines of a truth table).
const SET_BITS = { A: 0b10101010, B: 0b11001100, C: 0b11110000, U: 0xff, '∅': 0 };

export function parseSetExpr(text) {
  const src = String(text).replace(/\\cup|∪|\bu\b|\|/g, '∪').replace(/\\cap|∩|\bn\b|&/g, '∩')
    .replace(/\\setminus|\\|−|-/g, '∖').replace(/\\Delta|Δ|\^(?!c)/g, 'Δ').replace(/\^c|ᶜ|'|’/g, 'ᶜ')
    .replace(/\\varnothing|\\emptyset|Ø|ø/g, '∅').replace(/\s+/g, '');
  let i = 0;
  const peek = () => src[i], fail = msg => { throw new Error(msg + (i < src.length ? ` (position ${i + 1})` : '')); };
  // Binary operators share one precedence and associate to the left: write parentheses, as in the course.
  function expr() {
    let left = unary();
    while ('∪∩∖Δ'.includes(peek() ?? '#')) { const op = src[i++]; left = { op, left, right: unary() }; }
    return left;
  }
  function unary() {
    let node;
    const c = peek();
    if (c === '(') { i++; node = expr(); if (peek() !== ')') fail('Parenthèse fermante attendue'); i++; }
    else if (c && /[ABCU∅]/.test(c)) { i++; node = { set: c }; }
    else fail(c ? `Symbole inattendu « ${c} »` : 'Expression incomplète');
    while (peek() === 'ᶜ') { i++; node = { op: 'ᶜ', arg: node }; }
    return node;
  }
  if (!src) fail('Expression vide');
  const tree = expr();
  if (i < src.length) fail(`Symbole inattendu « ${src[i]} »`);
  return tree;
}

export function setMask(tree) {
  if (tree.set) return SET_BITS[tree.set];
  if (tree.op === 'ᶜ') return ~setMask(tree.arg) & 0xff;
  const a = setMask(tree.left), b = setMask(tree.right);
  return { '∪': a | b, '∩': a & b, '∖': a & ~b & 0xff, 'Δ': a ^ b }[tree.op];
}

export function setToText(tree, top = true) {
  if (tree.set) return tree.set;
  if (tree.op === 'ᶜ') return (tree.arg.set ? tree.arg.set : '(' + setToText(tree.arg, false) + ')') + 'ᶜ';
  const s = setToText(tree.left, false) + ' ' + tree.op + ' ' + setToText(tree.right, false);
  return top ? s : '(' + s + ')';
}

/** Membership pattern of a region, e.g. region 5 → "x ∈ A, x ∉ B, x ∈ C". */
export function regionText(r) {
  return ['A', 'B', 'C'].map((s, k) => `x ${(r >> k) & 1 ? '∈' : '∉'} ${s}`).join(', ');
}

/** Elements of the universe that lie in a mask, for concrete sets A, B, C (arrays). */
export function elementsOf(mask, universe, A, B, C) {
  const a = new Set(A), b = new Set(B), c = new Set(C);
  return universe.filter(x => (mask >> ((a.has(x) ? 1 : 0) | (b.has(x) ? 2 : 0) | (c.has(x) ? 4 : 0))) & 1);
}

// ---------------------------------------------------------------- finite maps
// A map f : {0..m-1} → {0..p-1} is an array of length m.
export function mapInfo(f, p) {
  const image = new Set(f), injective = image.size === f.length, surjective = image.size === p;
  const collision = injective ? null : (() => { const seen = new Map(); for (let x = 0; x < f.length; x++) { if (seen.has(f[x])) return [seen.get(f[x]), x]; seen.set(f[x], x); } })();
  const missed = surjective ? null : [...Array(p).keys()].find(y => !image.has(y));
  return { injective, surjective, bijective: injective && surjective, collision, missed, image: [...image].sort((a, b) => a - b) };
}
export const directImage = (f, A) => [...new Set(A.map(x => f[x]))].sort((a, b) => a - b);
export const preimage = (f, B) => { const b = new Set(B); return f.map((y, x) => b.has(y) ? x : -1).filter(x => x >= 0); };

// ---------------------------------------------------------------- arithmetic in Z/nZ
export const mod = (a, n) => ((a % n) + n) % n;
export function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
export const lcm = (a, b) => a / gcd(a, b) * b;

/** Extended Euclid on (a, n): rows r_k = u_k·a + v_k·n down to r = 0; the last nonzero row is a Bézout relation. */
export function extendedEuclid(a, n) {
  const rows = [{ r: n, u: 0, v: 1, q: null }, { r: a, u: 1, v: 0, q: null }];
  while (rows.at(-1).r !== 0) {
    const [p, c] = rows.slice(-2), q = Math.floor(p.r / c.r);
    c.q = q;
    rows.push({ r: p.r - q * c.r, u: p.u - q * c.u, v: p.v - q * c.v, q: null });
  }
  const last = rows.at(-2);
  return { rows, gcd: last.r, u: last.u, v: last.v, inverse: last.r === 1 ? mod(last.u, n) : null };
}
export const units = n => [...Array(n).keys()].filter(a => n === 1 || gcd(a, n) === 1);
export const zeroDivisors = n => [...Array(n).keys()].filter(a => a && [...Array(n).keys()].some(b => b && (a * b) % n === 0));
export const divisors = n => [...Array(n).keys()].map(d => d + 1).filter(d => n % d === 0);

// ---------------------------------------------------------------- exact fractions and elimination
export class Frac {
  constructor(p, q = 1) {
    if (q === 0) throw new Error('Division par zéro');
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(p, q) || 1; this.p = p / g; this.q = q / g;
  }
  static of(x) { return x instanceof Frac ? x : new Frac(x); }
  add(o) { o = Frac.of(o); return new Frac(this.p * o.q + o.p * this.q, this.q * o.q); }
  sub(o) { o = Frac.of(o); return new Frac(this.p * o.q - o.p * this.q, this.q * o.q); }
  mul(o) { o = Frac.of(o); return new Frac(this.p * o.p, this.q * o.q); }
  div(o) { o = Frac.of(o); return new Frac(this.p * o.q, this.q * o.p); }
  neg() { return new Frac(-this.p, this.q); }
  isZero() { return this.p === 0; }
  eq(o) { o = Frac.of(o); return this.p === o.p && this.q === o.q; }
  tex() { return this.q === 1 ? String(this.p) : `${this.p < 0 ? '-' : ''}\\frac{${Math.abs(this.p)}}{${this.q}}`; }
  text() { return (this.q === 1 ? String(this.p) : `${this.p}/${this.q}`).replace('-', '−'); }
}
const identity = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => new Frac(i === j ? 1 : 0)));
export const matMul = (X, Y) => X.map(row => Y[0].map((_, j) => row.reduce((s, x, k) => s.add(x.mul(Y[k][j])), new Frac(0))));
export const toFracs = M => M.map(r => r.map(x => Frac.of(typeof x === 'string' ? parseFrac(x) : x)));
export function parseFrac(s) {
  const m = String(s).trim().replace(',', '.').match(/^(-?\d+)(?:\/(\d+))?$|^(-?\d*\.\d+)$/);
  if (!m) throw new Error(`Nombre illisible « ${s} »`);
  if (m[3]) { const d = m[3].split('.')[1].length; return new Frac(Math.round(Number(m[3]) * 10 ** d), 10 ** d); }
  return new Frac(Number(m[1]), m[2] ? Number(m[2]) : 1);
}

/**
 * Gaussian elimination recorded one matrix at a time, as in the course (Thm 2.4.5): elimination matrices E_{ik} below
 * each pivot, a row exchange only when the pivot is zero (Rem. 2.4.4). Works for m×n; a column with no pivot is skipped
 * (U is then in row echelon form, Rem. 3.5.26). Returns the steps and P, L, U with PA = LU.
 */
export function eliminate(A0) {
  const A = toFracs(A0), m = A.length, n = A[0].length;
  let U = A.map(r => r.slice()), P = identity(m), Lm = identity(m);
  const steps = [], pivots = [];
  let row = 0, swaps = 0;
  for (let col = 0; col < n && row < m; col++) {
    let r = row;
    while (r < m && U[r][col].isZero()) r++;
    if (r === m) { steps.push({ kind: 'skip', col, U: U.map(x => x.slice()) }); continue; }
    if (r !== row) {
      [U[r], U[row]] = [U[row], U[r]]; [P[r], P[row]] = [P[row], P[r]];
      for (let k = 0; k < row; k++) [Lm[r][k], Lm[row][k]] = [Lm[row][k], Lm[r][k]];
      swaps++;
      steps.push({ kind: 'swap', i: row, j: r, U: U.map(x => x.slice()) });
    }
    pivots.push({ row, col, value: U[row][col] });
    for (let i = row + 1; i < m; i++) {
      if (U[i][col].isZero()) continue;
      const l = U[i][col].div(U[row][col]);
      U[i] = U[i].map((x, j) => x.sub(l.mul(U[row][j])));
      Lm[i][row] = l;
      const E = identity(m); E[i][row] = l.neg();
      steps.push({ kind: 'elim', i, k: row, col, factor: l, E, U: U.map(x => x.slice()) });
    }
    row++;
  }
  const square = m === n, rank = pivots.length;
  let det = null;
  if (square) det = rank < n ? new Frac(0) : pivots.reduce((d, p) => d.mul(p.value), new Frac(swaps % 2 ? -1 : 1));
  return { A, P, L: Lm, U, steps, pivots, rank, swaps, det };
}

// ---------------------------------------------------------------- permutations (0-based arrays; σ[x] is the image of x)
export const permIdentity = n => [...Array(n).keys()];
/** σ∘τ: first τ, then σ (right to left, the course convention). */
export const compose = (s, t) => t.map(x => s[x]);
export function inverse(s) { const r = Array(s.length); s.forEach((y, x) => { r[y] = x; }); return r; }
export function cycles(s, keepFixed = false) {
  const seen = new Set(), out = [];
  for (let x = 0; x < s.length; x++) {
    if (seen.has(x)) continue;
    const c = []; let y = x;
    while (!seen.has(y)) { seen.add(y); c.push(y); y = s[y]; }
    if (c.length > 1 || keepFixed) out.push(c);
  }
  return out;
}
export const cycleText = s => { const c = cycles(s); return c.length ? c.map(z => '(' + z.map(x => x + 1).join(' ') + ')').join('') : 'id'; };
export const permOrder = s => cycles(s).reduce((o, c) => lcm(o, c.length), 1);
/** (a1 … ak) = (a1 a2)(a2 a3)…(a_{k-1} a_k) (Prop. 4.3.3), for each disjoint cycle. */
export const transpositions = s => cycles(s).flatMap(c => c.slice(0, -1).map((x, i) => [x, c[i + 1]]));
export const sign = s => (transpositions(s).length % 2 ? -1 : 1);
export const isPerm = s => s.length > 0 && new Set(s).size === s.length && s.every(x => Number.isInteger(x) && x >= 0 && x < s.length);
export function power(s, k) {
  let r = permIdentity(s.length), b = k < 0 ? inverse(s) : s.slice();
  for (let e = Math.abs(k); e; e >>= 1) { if (e & 1) r = compose(b, r); b = compose(b, b); }
  return r;
}
/** Parse "(1 3 2)(4 5)" or "id" (1-based, cycles composed right to left) into a permutation of {1..n}. */
export function parseCycles(text, n) {
  const src = String(text).trim();
  let s = permIdentity(n);
  if (!src || /^(id|e|1)$/i.test(src)) return s;
  if (!/^(\(\s*[\d\s,]+\))+$/.test(src.replace(/\s+(?=\()|(?<=\))\s+/g, ''))) throw new Error('Écrire des cycles comme (1 3 2)(4 5)');
  const parts = [...src.matchAll(/\(([^)]*)\)/g)].map(m => m[1].split(/[\s,]+/).filter(Boolean).map(Number));
  for (const c of parts.reverse()) {
    if (c.some(x => !Number.isInteger(x) || x < 1 || x > n)) throw new Error(`Les éléments vont de 1 à ${n}`);
    if (new Set(c).size !== c.length) throw new Error('Un cycle ne répète pas un élément');
    const z = permIdentity(n);
    c.forEach((x, i) => { z[x - 1] = c[(i + 1) % c.length] - 1; });
    s = compose(z, s);
  }
  return s;
}
/** Matrix P_σ with P e_j = e_{σ(j)} (columns), so P_σ P_τ = P_{σ∘τ} and det P_σ = ε(σ). */
export const permMatrix = s => s.map((_, i) => s.map((y, j) => (y === i ? 1 : 0)));

// ---------------------------------------------------------------- dihedral group D_n
// Element r^k τ^s as {k, s}; vertex i goes to k + (−1)^s i (mod n). (r^a τ^s)(r^b τ^t) = r^{a + (−1)^s b} τ^{s+t}.
export const dihedralMul = (n, x, y) => ({ k: mod(x.k + (x.s ? -y.k : y.k), n), s: x.s ^ y.s });
export const dihedralPerm = (n, x) => [...Array(n).keys()].map(i => mod(x.k + (x.s ? -i : i), n));
export const dihedralName = x => (x.k === 0 && !x.s ? 'e' : (x.k ? (x.k === 1 ? 'r' : `r^${x.k}`) : '') + (x.s ? 'τ' : ''));

// ---------------------------------------------------------------- finite groups as Cayley tables
// A structure is { names: [...], table: [[i*j index]] } on indices 0..n-1.
export function structureFrom(names, op) {
  return { names, table: names.map((_, i) => names.map((_, j) => op(i, j))) };
}
export function groupCatalogue() {
  const zn = n => structureFrom([...Array(n).keys()].map(String), (i, j) => (i + j) % n);
  const un = n => { const u = units(n); return structureFrom(u.map(String), (i, j) => u.indexOf((u[i] * u[j]) % n)); };
  const sym = n => {
    const all = []; const rec = (p, rest) => rest.length ? rest.forEach((x, i) => rec([...p, x], rest.filter((_, j) => j !== i))) : all.push(p);
    rec([], permIdentity(n));
    return structureFrom(all.map(cycleText), (i, j) => all.findIndex(p => p.join() === compose(all[i], all[j]).join()));
  };
  const dih = n => {
    const all = [...Array(2 * n).keys()].map(i => ({ k: i % n, s: i >= n ? 1 : 0 }));
    return structureFrom(all.map(dihedralName), (i, j) => { const z = dihedralMul(n, all[i], all[j]); return z.k + n * z.s; });
  };
  const klein = structureFrom(['e', 'a', 'b', 'c'], (i, j) => i ^ j);
  const z2z4 = structureFrom([...Array(8).keys()].map(i => `(${i >> 2},${i & 3})`), (i, j) => (((i >> 2) ^ (j >> 2)) << 2) | (((i & 3) + (j & 3)) & 3));
  const q8n = ['1', '−1', 'i', '−i', 'j', '−j', 'k', '−k'];
  // quaternions: index = 2·unit + sign, units 1,i,j,k; i·j = k, j·k = i, k·i = j
  const qmul = (a, b) => [[0, 1, 2, 3], [1, 0, 3, 2], [2, 3, 0, 1], [3, 2, 1, 0]][a][b];
  const qsg = (a, b) => [[0, 0, 0, 0], [0, 1, 0, 1], [0, 1, 1, 0], [0, 0, 1, 1]][a][b];
  const q8 = structureFrom(q8n, (x, y) => { const a = x >> 1, b = y >> 1; return 2 * qmul(a, b) + ((x & 1) ^ (y & 1) ^ qsg(a, b)); });
  const zMult = n => structureFrom([...Array(n - 1).keys()].map(i => String(i + 1)), (i, j) => { const p = ((i + 1) * (j + 1)) % n; return p === 0 ? -1 : p - 1; });
  const minus = n => structureFrom([...Array(n).keys()].map(String), (i, j) => mod(i - j, n));
  return [
    { id: 'z4', label: 'ℤ/4ℤ, +', s: zn(4) }, { id: 'z6', label: 'ℤ/6ℤ, +', s: zn(6) }, { id: 'z8', label: 'ℤ/8ℤ, +', s: zn(8) },
    { id: 'v4', label: 'Klein V = ℤ/2ℤ × ℤ/2ℤ', s: klein }, { id: 'u8', label: '(ℤ/8ℤ)^×, ×', s: un(8) }, { id: 'u10', label: '(ℤ/10ℤ)^×, ×', s: un(10) },
    { id: 's3', label: 'S₃, ∘', s: sym(3) }, { id: 'd4', label: 'D₄, symétries du carré', s: dih(4) },
    { id: 'z2z4', label: 'ℤ/2ℤ × ℤ/4ℤ', s: z2z4 }, { id: 'q8', label: 'Quaternions Q₈', s: q8 },
    { id: 'm6', label: '(ℤ/6ℤ ∖ {0}, ×), piège', s: zMult(6) }, { id: 'm5', label: '(ℤ/5ℤ ∖ {0}, ×)', s: zMult(5) },
    { id: 'sub5', label: '(ℤ/5ℤ, −), piège', s: minus(5) },
  ];
}

/** Axiom report with explicit witnesses (closure, associativity, neutral, inverses, commutativity, latin square). */
export function analyse({ table }) {
  const n = table.length, idx = [...Array(n).keys()];
  const closed = table.every(r => r.every(v => Number.isInteger(v) && v >= 0 && v < n));
  const notClosed = closed ? null : (() => { for (const i of idx) for (const j of idx) if (!(table[i][j] >= 0 && table[i][j] < n)) return [i, j]; })();
  let assocFail = null;
  if (closed) outer: for (const a of idx) for (const b of idx) for (const c of idx)
    if (table[table[a][b]][c] !== table[a][table[b][c]]) { assocFail = [a, b, c]; break outer; }
  const neutral = closed ? idx.find(e => idx.every(x => table[e][x] === x && table[x][e] === x)) : undefined;
  const inv = neutral === undefined ? null : idx.map(x => idx.find(y => table[x][y] === neutral && table[y][x] === neutral));
  const noInverse = inv ? inv.findIndex(v => v === undefined) : -1;
  let commFail = null;
  for (const i of idx) for (const j of idx) if (!commFail && table[i][j] !== table[j][i]) commFail = [i, j];
  const latin = closed && idx.every(i => new Set(table[i]).size === n && new Set(idx.map(j => table[j][i])).size === n);
  const group = closed && !assocFail && neutral !== undefined && noInverse < 0;
  return { closed, notClosed, associative: closed && !assocFail, assocFail, neutral: neutral ?? null, inverses: inv, noInverse, commutative: !commFail, commFail, latin, group, monoid: closed && !assocFail && neutral !== undefined };
}
export function elementOrder({ table }, g, e) {
  let x = g, k = 1;
  while (x !== e) { x = table[x][g]; k++; if (k > table.length) return Infinity; }
  return k;
}
/** Subgroup generated by a set of indices (closure under the law, finite case). */
export function generated({ table }, gens, e) {
  const H = new Set([e, ...gens]);
  let grew = true;
  while (grew) { grew = false; for (const a of [...H]) for (const b of [...H]) { const c = table[a][b]; if (!H.has(c)) { H.add(c); grew = true; } } }
  return [...H].sort((a, b) => a - b);
}
export function isSubgroup({ table }, H, e) {
  const S = new Set(H);
  if (!S.has(e)) return { ok: false, why: 'neutral' };
  for (const a of S) for (const b of S) if (!S.has(table[a][b])) return { ok: false, why: 'closure', witness: [a, b] };
  for (const a of S) if (![...S].some(b => table[a][b] === e)) return { ok: false, why: 'inverse', witness: [a] };
  return { ok: true };
}
export function cosets({ table }, H, side = 'left') {
  const seen = new Set(), out = [];
  for (let x = 0; x < table.length; x++) {
    if (seen.has(x)) continue;
    const c = H.map(h => (side === 'left' ? table[x][h] : table[h][x])).sort((a, b) => a - b);
    c.forEach(y => seen.add(y)); out.push({ rep: x, elements: c });
  }
  return out;
}
export function isNormal(S, H) {
  const L = cosets(S, H, 'left'), R = cosets(S, H, 'right');
  const key = c => c.elements.join();
  const rights = new Map(R.map(c => [c.rep, c]));
  for (let x = 0; x < S.table.length; x++) {
    const xl = L.find(c => c.elements.includes(x)), xr = R.find(c => c.elements.includes(x));
    if (key(xl) !== key(xr)) return { normal: false, witness: x };
  }
  return { normal: true, rights };
}

// ------------------------------------------------------------------ QCM grading
// A question is right only when the chosen set equals the set of right choices (no partial credit at university level);
// "partial" names a several-answer question where every choice made is right but some right choice is missing.
export function gradeQuestion(right, chosen) {
  const R = new Set(right), C = new Set(chosen);
  if (!C.size) return { status: 'empty', right: false, wrongChosen: [], missed: [...R] };
  const wrongChosen = [...C].filter(x => !R.has(x)), missed = [...R].filter(x => !C.has(x));
  const ok = !wrongChosen.length && !missed.length;
  return { status: ok ? 'right' : (!wrongChosen.length ? 'partial' : 'wrong'), right: ok, wrongChosen, missed };
}
export function seriesScore(grades) {
  const answered = grades.filter(g => g.status !== 'empty').length, right = grades.filter(g => g.right).length;
  return { right, answered, total: grades.length };
}
// Fisher and Yates, with an injectable random source for tests.
export function shuffled(list, rand = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
