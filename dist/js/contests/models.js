// Pure models of the competition archive (no DOM). The pages (page.js) and the figures (widgets.js) use them; the
// tests (tests/contests.test.mjs) check every published answer with them, by an exhaustive or independent method.

// ---- IMO 2023, problem 1: the divisor chain
export function divisors(n) {
  const small = [], large = [];
  for (let d = 1; d * d <= n; d++) if (n % d === 0) { small.push(d); if (d * d !== n) large.unshift(n / d); }
  return [...small, ...large];
}
// the first index i (1-based) where d_i does not divide d_{i+1} + d_{i+2}, or 0 when the chain holds
export function chainBreak(n) {
  const d = divisors(n);
  for (let i = 0; i + 2 < d.length; i++) if ((d[i + 1] + d[i + 2]) % d[i] !== 0) return i + 1;
  return 0;
}
export const isPrimePower = (n) => { if (n < 2) return false; let p = 2; while (n % p) p++; while (n % p === 0) n /= p; return n === 1; };

// ---- IMO 2024, problem 1: S_n = floor(a) + floor(2a) + ... + floor(na) for a rational a = num/den (exact, BigInt)
export function floorSums(num, den, nmax) {
  const N = BigInt(num), D = BigInt(den), out = [];
  let s = 0n;
  const fl = (x) => (x >= 0n ? x / D : -((-x + D - 1n) / D));   // floor of x / D for D > 0
  for (let n = 1; n <= nmax; n++) { s += fl(BigInt(n) * N); out.push(s); }
  return out;
}
// the first n with n not dividing S_n, or 0 up to nmax
export function firstFailure(num, den, nmax) {
  const s = floorSums(num, den, nmax);
  for (let n = 1; n <= nmax; n++) if (s[n - 1] % BigInt(n) !== 0n) return n;
  return 0;
}

// ---- IMO 2024, problem 2: g_n = gcd(a^n + b, b^n + a)
const gcdBig = (x, y) => { while (y) [x, y] = [y, x % y]; return x; };
export function gcdSequence(a, b, nmax) {
  const A = BigInt(a), B = BigInt(b), out = [];
  let pa = 1n, pb = 1n;
  for (let n = 1; n <= nmax; n++) { pa *= A; pb *= B; out.push(gcdBig(pa + B, pb + A)); }
  return out;
}

// ---- IMO 2025, problem 1: sunny lines on the triangle of points (a, b), a, b >= 1, a + b <= n + 1
export const trianglePoints = (n) => { const pts = []; for (let a = 1; a <= n; a++) for (let b = 1; a + b <= n + 1; b++) pts.push([a, b]); return pts; };
// a line through two distinct lattice points, kept as integers u x + v y = w with gcd 1 and a fixed sign
export function lineThrough(p, q) {
  let u = q[1] - p[1], v = p[0] - q[0];
  if (u === 0 && v === 0) return null;
  const g = gcdInt(Math.abs(u), Math.abs(v));
  u /= g; v /= g;
  if (u < 0 || (u === 0 && v < 0)) { u = -u; v = -v; }
  return { u, v, w: u * p[0] + v * p[1] };
}
function gcdInt(x, y) { while (y) [x, y] = [y, x % y]; return x; }
// sunny: not parallel to the x-axis (u = 0), the y-axis (v = 0) or x + y = 0 (u = v)
export const isSunny = (L) => L.u !== 0 && L.v !== 0 && L.u !== L.v;
export const onLine = (L, [x, y]) => L.u * x + L.v * y === L.w;
export function coverage(n, lines) {
  const pts = trianglePoints(n);
  const covered = pts.filter((p) => lines.some((L) => onLine(L, p)));
  return { total: pts.length, covered: covered.length, sunny: lines.filter(isSunny).length, missing: pts.filter((p) => !covered.includes(p)) };
}
// every k for which n distinct lines (through two points of the grid around the triangle) cover the triangle with
// exactly k sunny lines; exhaustive, used by the tests for n = 3 and 4
export function sunnyCounts(n) {
  const grid = []; for (let x = 0; x <= n + 1; x++) for (let y = 0; y <= n + 1; y++) grid.push([x, y]);
  const pts = trianglePoints(n), seen = new Map();
  // a line that covers no point of the triangle is useless except to reach n lines; it can always be added as a
  // non-sunny line far away, or as a sunny one, so only lines meeting at least one point matter, plus padding
  for (let i = 0; i < pts.length; i++) for (const q of grid) {
    const L = lineThrough(pts[i], q); if (!L) continue;
    const key = `${L.u},${L.v},${L.w}`; if (!seen.has(key)) seen.set(key, L);
  }
  const lines = [...seen.values()], masks = lines.map((L) => pts.reduce((m, p, j) => (onLine(L, p) ? m | (1 << j) : m), 0));
  const full = (1 << pts.length) - 1, ks = new Set();
  const rec = (start, used, mask, sunny) => {
    if (mask === full) {
      // pad with lines that cover nothing new: any number of extra sunny or non-sunny lines is possible
      const free = n - used;
      for (let s = 0; s <= free; s++) ks.add(sunny + s);
      return;
    }
    if (used === n) return;
    for (let i = start; i < lines.length; i++) if ((masks[i] | mask) !== mask) rec(i + 1, used + 1, mask | masks[i], sunny + (isSunny(lines[i]) ? 1 : 0));
  };
  rec(0, 0, 0, 0);
  return [...ks].sort((a, b) => a - b);
}

// ---- IMO 2024, problem 5: Turbo the snail on a board of C columns and C + 1 rows, monsters in rows 2..C, one per
// row, at most one per column. Rows and columns are numbered from 0 here: row 0 is the first row, row C the last.
export function randomMonsters(C, rnd = Math.random) {
  const cols = Array.from({ length: C }, (_, i) => i);
  for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cols[i], cols[j]] = [cols[j], cols[i]]; }
  return cols.slice(0, C - 1);       // monsters[r - 1] is the column of the monster of row r, for r = 1..C-1
}
export const hasMonster = (monsters, r, c) => r >= 1 && r <= monsters.length && monsters[r - 1] === c;
// walk a path of cells; stop at the first monster (the attempt ends there) or at the last row
export function walk(monsters, C, path) {
  for (let i = 0; i < path.length; i++) {
    const [r, c] = path[i];
    if (hasMonster(monsters, r, c)) return { ok: false, stop: i, monster: [r, c] };
    if (r === C) return { ok: true, stop: i };
  }
  return { ok: false, stop: path.length - 1, monster: null };
}
const column = (c, from, to) => { const p = []; for (let r = from; r <= to; r++) p.push([r, c]); return p; };
const row = (r, from, to) => { const p = [], s = from <= to ? 1 : -1; for (let c = from; c !== to + s; c += s) p.push([r, c]); return p; };
// the staircase from the second row, away from a monster sitting in column `edge` (0 or C - 1) of row 1
function staircase(C, edge) {
  const m = (c) => (edge === 0 ? c : C - 1 - c), p = [[0, m(1)], [1, m(1)], [1, m(2)]];
  for (let i = 2; i <= C - 1; i++) { p.push([i, m(i)]); if (i + 1 <= C - 1) p.push([i, m(i + 1)]); }
  p.push([C, m(C - 1)]);
  return p;
}
// the three attempts of the strategy, each chosen from what Turbo has seen so far
export function turboStrategy(monsters, C) {
  const attempts = [], seen = [];
  const play = (path) => { const r = walk(monsters, C, path); attempts.push(path.slice(0, r.stop + 1)); if (r.monster) seen.push(r.monster); return r.ok; };
  // attempt 1: along the second row until its monster
  if (play([[0, 0], ...row(1, 0, C - 1)])) return attempts;
  const c = seen[0][1];
  if (c > 0 && c < C - 1) {
    // attempts 2 and 3: round the monster through the third row, on the left then on the right, then down its column
    for (const side of [c - 1, c + 1]) if (play([[0, side], [1, side], [2, side], [2, c], ...column(c, 3, C)])) return attempts;
    return attempts;
  }
  // monster on an edge: a staircase away from it; if it meets a monster, the last attempt takes the safe row of that
  // monster back to the edge column, which is free below the second row
  if (play(staircase(C, c))) return attempts;
  // the monster M of row r ends the staircase. Its row is free elsewhere. If Turbo reached M by a step sideways, he
  // stays on the cell before it; if he stepped down onto M, he goes back one more cell and steps down beside M.
  const r = seen[1][0], last = attempts[attempts.length - 1], before = last[last.length - 2];
  const path = before[0] < r ? last.slice(0, -2) : last.slice(0, -1);
  if (before[0] < r) path.push([r, path[path.length - 1][1]]);
  // then along row r to the edge column, which is free below the second row, and down to the last row
  path.push(...row(r, path[path.length - 1][1], c).slice(1), ...column(c, r + 1, C));
  play(path);
  return attempts;
}

// ---- Beaver Computing Challenge 2023 (grades 9 and 10): command machines
// Video game: eight directions, 0 = right, then anticlockwise by 45 degrees; rows grow downwards
export const DIRS = [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]];
export const VIDEO = { rows: 5, cols: 6, start: [2, 0], grey: [[2, 0], [1, 1], [0, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 3], [4, 2], [3, 1]] };
export function runVideo(seq, task = VIDEO) {
  const key = ([r, c]) => `${r},${c}`, grey = new Set(task.grey.map(key)), trail = [task.start];
  let [r, c] = task.start;
  for (let i = 0; i < seq.length; i++) {
    const d = DIRS[seq[i]]; if (!d) return { ok: false, trail, error: 'digit', at: i };
    r += d[0]; c += d[1]; trail.push([r, c]);
    if (r < 0 || c < 0 || r >= task.rows || c >= task.cols) return { ok: false, trail, error: 'outside', at: i };
    if (!grey.has(key([r, c]))) return { ok: false, trail, error: 'white', at: i };
  }
  const visited = new Set(trail.slice(0, -1).map(key)), back = key(trail[trail.length - 1]) === key(task.start);
  // signed area with the y axis upwards: negative for a clockwise tour
  let area = 0; for (let i = 0; i + 1 < trail.length; i++) { const [r1, c1] = trail[i], [r2, c2] = trail[i + 1]; area += c1 * -r2 - c2 * -r1; }
  const all = visited.size === grey.size && trail.length === grey.size + 1;
  return { ok: back && all && area < 0, trail, back, all, clockwise: area < 0, error: null };
}
// Push the button: three queues of numbered balls, the first ball behind each gate first
export const BUTTONS = { P: [4, 8, 7, 1], Q: [3, 9, 4, 11], R: [2, 5, 6, 10] };
export function runButtons(seq, queues = BUTTONS) {
  const q = Object.fromEntries(Object.entries(queues).map(([k, v]) => [k, [...v]])), dropped = [];
  let increasing = true;
  for (const b of seq) {
    if (!q[b] || !q[b].length) return { dropped, increasing, error: 'empty' };
    const x = q[b].shift();
    if (dropped.length && x <= dropped[dropped.length - 1]) increasing = false;
    dropped.push(x);
  }
  return { dropped, increasing, error: null };
}
// the largest number of pushes that keeps the balls increasing (exhaustive search)
export function bestButtons(queues = BUTTONS) {
  const keys = Object.keys(queues); let best = 0;
  const rec = (idx, last, count) => {
    best = Math.max(best, count);
    keys.forEach((k, j) => { const i = idx[j]; if (i < queues[k].length && queues[k][i] > last) { const next = [...idx]; next[j]++; rec(next, queues[k][i], count + 1); } });
  };
  rec(keys.map(() => 0), -Infinity, 0);
  return best;
}
// Eating carrots: four patches, actions R (hop right), L (hop left), E (eat)
export const CARROT_ACTIONS = ['R', 'E', 'L', 'E', 'L', 'L', 'E'];
export function runCarrots(start, actions = CARROT_ACTIONS, patches = 4) {
  const eaten = new Set(); let p = start;
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    if (a === 'R') p++; else if (a === 'L') p--; else eaten.add(p);
    if (p < 0 || p >= patches) return { ok: false, at: i, eaten: [...eaten] };
  }
  return { ok: true, eaten: [...eaten].sort(), left: Array.from({ length: patches }, (_, i) => i).filter((i) => !eaten.has(i)) };
}
// Lockers: small fits rows 1, 2, 3; medium rows 2, 3; large row 3 only; lowest free number first
export const LOCKERS = { small: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], medium: [20, 21, 22, 23, 24], large: [30, 31], taken: [11, 12, 13, 15, 16, 18, 19, 20, 22, 23] };
export function runLockers(events, task = LOCKERS) {
  const taken = new Set(task.taken), fits = { small: [...task.small, ...task.medium, ...task.large], medium: [...task.medium, ...task.large], large: [...task.large] }, placed = [];
  for (const [kind, x] of events) {
    if (kind === 'pick') { taken.delete(x); continue; }
    const where = fits[kind].find((l) => !taken.has(l));
    if (where === undefined) return { placed, error: 'full' };
    taken.add(where); placed.push(where);
  }
  return { placed, error: null };
}
export const LOCKER_EVENTS = [['small'], ['small'], ['small'], ['small'], ['pick', 11], ['pick', 19], ['medium'], ['medium'], ['pick', 20], ['pick', 21], ['small'], ['small'], ['small']];
// Trains: depots and the main line hold at most three trains, listed from left to right
export const TRAINS = { depots: [[5], [2, 7, 1], [4, 3, 6]], cap: 3 };
export function parseTrainCommands(text) {
  const out = [], re = /\b(OUT|IN|SORT|ENTRE)\s*\(?\s*([123])\s*\)?/gi;
  let m; while ((m = re.exec(text))) out.push([/^(OUT|SORT)$/i.test(m[1]) ? 'OUT' : 'IN', Number(m[2])]);
  return out;
}
export function runTrains(cmds, task = TRAINS) {
  const depots = task.depots.map((d) => [...d]), main = [], states = [];
  for (let i = 0; i < cmds.length; i++) {
    const [op, x] = cmds[i], d = depots[x - 1];
    if (!d) return { ok: false, error: 'depot', at: i, depots, main, states };
    if (op === 'OUT') {
      if (!d.length) return { ok: false, error: 'empty', at: i, depots, main, states };
      if (main.length >= task.cap) return { ok: false, error: 'full', at: i, depots, main, states };
      main.unshift(d.pop());
    } else {
      if (!main.length) return { ok: false, error: 'empty', at: i, depots, main, states };
      if (d.length >= task.cap) return { ok: false, error: 'full', at: i, depots, main, states };
      d.push(main.shift());
    }
    states.push({ depots: depots.map((z) => [...z]), main: [...main] });
  }
  const goal = depots[0].length === 3 && [1, 2, 3].every((t) => depots[0].includes(t));
  return { ok: goal, error: null, depots, main, states };
}
