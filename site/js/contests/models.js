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

// ---- IMO 2023, problem 4: a_n = sqrt((x_1 + ... + x_n)(1/x_1 + ... + 1/x_n))
export function aSequence(xs) {
  let s = 0, t = 0; return xs.map((x) => { s += x; t += 1 / x; return Math.sqrt(s * t); });
}

// ---- IMO 2025, problem 5: the game of Alice (odd turns, sum <= lambda n) and Bazza (even turns, sum of squares <= n).
// play(lambda, alice, bazza, turns): each strategy maps the state to a wish; a wish above the largest legal number is
// cut down to it; a player with no legal number loses.
export function playGame(lambda, alice, bazza, turns = 400) {
  let S = 0, Q = 0;
  for (let n = 1; n <= turns; n++) {
    if (n % 2) {
      const room = lambda * n - S; if (room < -1e-12) return { winner: 'Bazza', turn: n };
      const x = Math.min(Math.max(alice({ n, S, Q, lambda }), 0), Math.max(room, 0)); S += x; Q += x * x;
    } else {
      const room = n - Q; if (room < -1e-12) return { winner: 'Alice', turn: n };
      const x = Math.min(Math.max(bazza({ n, S, Q }), 0), Math.sqrt(Math.max(room, 0))); S += x; Q += x * x;
    }
  }
  return { winner: null, turn: turns };
}
// the strategies of the solution
export const aliceWaits = (k) => ({ n, S, lambda }) => (n === 2 * k + 1 ? lambda * n - S : 0);
export const bazzaFills = ({ n, Q }) => Math.sqrt(Math.max(n - Q, 0));

// ---- Euclid 2025, question 10: coins in a triangle of n rows, a move flips three mutually adjacent coins.
// Coins (r, i), 1 <= i <= r <= n. Move T(r, j), 1 <= r < n, 1 <= j <= 2r - 1 (the contest's names): odd j is the
// triangle pointing up with top coin (r, (j + 1) / 2); even j points down with top coins (r, j / 2) and (r, j / 2 + 1).
export function coinMove(r, j) {
  if (j % 2) { const i = (j + 1) / 2; return [[r, i], [r + 1, i], [r + 1, i + 1]]; }
  const i = j / 2; return [[r, i], [r, i + 1], [r + 1, i + 1]];
}
export const coinMoves = (n) => { const out = []; for (let r = 1; r < n; r++) for (let j = 1; j <= 2 * r - 1; j++) out.push([r, j]); return out; };
// tails after the moves (true = tails), every coin starting heads
export function flipCoins(n, moves) {
  const tails = new Map();
  for (let r = 1; r <= n; r++) for (let i = 1; i <= r; i++) tails.set(`${r},${i}`, false);
  for (const [r, j] of moves) {
    if (!(r >= 1 && r < n && j >= 1 && j <= 2 * r - 1)) return null;
    for (const [a, b] of coinMove(r, j)) tails.set(`${a},${b}`, !tails.get(`${a},${b}`));
  }
  return tails;
}
export const coinsWon = (n, moves) => { const t = flipCoins(n, moves); return !!t && [...t.values()].every(Boolean); };
export function parseCoinMoves(text) {
  const out = [], re = /T\s*\(\s*(\d+)\s*[,;]\s*(\d+)\s*\)/gi; let m;
  while ((m = re.exec(text))) out.push([Number(m[1]), Number(m[2])]);
  return out;
}
// is the all-tails position reachable? Gaussian elimination over Z/2 (each move used 0 or 1 time)
export function coinsWinnable(n) {
  const index = new Map(); let k = 0;
  for (let r = 1; r <= n; r++) for (let i = 1; i <= r; i++) index.set(`${r},${i}`, k++);
  const target = (1n << BigInt(k)) - 1n;
  const basis = [];
  const reduce = (v) => { for (const b of basis) if ((v ^ b) < v) v ^= b; return v; };
  for (const [r, j] of coinMoves(n)) {
    let v = 0n; for (const [a, b] of coinMove(r, j)) v ^= 1n << BigInt(index.get(`${a},${b}`));
    v = reduce(v); if (v) { basis.push(v); basis.sort((x, y) => (x > y ? -1 : 1)); }
  }
  return reduce(target) === 0n;
}

// ---- IMO 2026, problem 1: the blackboard. A move takes two entries m, n > 1 at different places and writes
// gcd(m, n) and lcm(m, n) / gcd(m, n) in their places. These functions apply the rules only.
const gcd2 = (a, b) => (b ? gcd2(b, a % b) : a);
export function boardMove(board, i, j) {
  if (i === j || !(board[i] > 1) || !(board[j] > 1)) return null;
  const m = board[i], n = board[j], g = gcd2(m, n), next = board.slice();
  next[i] = g; next[j] = (m / g) * (n / g);
  return next;
}
export const boardLegalPairs = (board) => {
  const idx = board.map((x, i) => (x > 1 ? i : -1)).filter((i) => i >= 0), out = [];
  idx.forEach((i, a) => idx.slice(a + 1).forEach((j) => out.push([i, j])));
  return out;
};
export const boardFinished = (board) => boardLegalPairs(board).length === 0;
// plays random moves (rnd() in [0, 1)) until none is possible, or until `cap` moves
export function boardRandomPlay(board, rnd = Math.random, cap = 100000) {
  const moves = []; let cur = board.slice();
  while (moves.length < cap) {
    const pairs = boardLegalPairs(cur); if (!pairs.length) break;
    const [i, j] = pairs[Math.floor(rnd() * pairs.length)];
    cur = boardMove(cur, i, j); moves.push([i, j]);
  }
  return { moves, board: cur, finished: boardFinished(cur) };
}

// ---- IMO 2026, problem 6: a(n+1) is the smallest integer > a(n) sharing a factor with every earlier term
export function sharedSequence(a1, length) {
  if (!Number.isInteger(a1) || a1 < 2) return [];
  const t = [a1];
  while (t.length < length) { let c = t[t.length - 1] + 1; while (!t.every((x) => gcd2(c, x) > 1)) c++; t.push(c); }
  return t;
}

// ---- IMO 2025, problem 4: a(n+1) is the sum of the three largest proper divisors of a(n)
// null when a(n) has fewer than three proper divisors (the sequence cannot continue)
export function threeLargestSum(n) {
  const proper = divisors(n).filter((d) => d !== n); if (proper.length < 3) return null;
  return proper[proper.length - 1] + proper[proper.length - 2] + proper[proper.length - 3];
}
export function divisorOrbit(a1, steps = 30, limit = 1e12) {
  const terms = [a1]; let status = 'running';
  while (terms.length <= steps) {
    const cur = terms[terms.length - 1];
    if (cur > limit) { status = 'large'; break; }
    const nxt = threeLargestSum(cur);
    if (nxt === null) { status = 'stops'; break; }
    if (nxt === cur) { status = 'constant'; break; }
    terms.push(nxt);
  }
  return { terms, status };
}

// ---- IMO 2025, problem 6: rectangular tiles on an n x n grid; cells (row, column) from 0, tile {r0, c0, r1, c1} inclusive
export const tilesOverlap = (s, t) => s.r0 <= t.r1 && t.r0 <= s.r1 && s.c0 <= t.c1 && t.c0 <= s.c1;
export const canAddTile = (n, tiles, t) => t.r0 >= 0 && t.c0 >= 0 && t.r1 < n && t.c1 < n && t.r0 <= t.r1 && t.c0 <= t.c1 && !tiles.some((s) => tilesOverlap(s, t));
export function tilesReport(n, tiles) {
  const covered = Array.from({ length: n }, () => Array(n).fill(false));
  tiles.forEach((t) => { for (let r = t.r0; r <= t.r1; r++) for (let c = t.c0; c <= t.c1; c++) covered[r][c] = true; });
  const rowFree = Array(n).fill(0), colFree = Array(n).fill(0), free = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!covered[r][c]) { rowFree[r]++; colFree[c]++; free.push([r, c]); }
  return { count: tiles.length, free, rowFree, colFree, ok: rowFree.every((x) => x === 1) && colFree.every((x) => x === 1) };
}
// the exact minimum, by exhaustive search: every placement of the free squares (one per row and column), and for each the
// fewest rectangles partitioning the other squares. Meant for small n (the test uses n up to 5).
export function minTiles(n) {
  const perms = [], p = [];
  const gen = (used) => { if (p.length === n) { perms.push(p.slice()); return; } for (let c = 0; c < n; c++) if (!(used >> c & 1)) { p.push(c); gen(used | 1 << c); p.pop(); } };
  gen(0);
  let best = Infinity;
  for (const perm of perms) {
    const grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (perm[r] === c ? 1 : 0))); // 1: hole or covered
    const solve = (count) => {
      if (count >= best) return;
      let r0 = -1, c0 = -1;
      outer: for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!grid[r][c]) { r0 = r; c0 = c; break outer; }
      if (r0 < 0) { best = count; return; }
      let maxW = 0; while (c0 + maxW < n && !grid[r0][c0 + maxW]) maxW++;
      for (let w = maxW; w >= 1; w--) {
        let h = 1; while (r0 + h < n && [...Array(w).keys()].every((k) => !grid[r0 + h][c0 + k])) h++;
        for (let hh = h; hh >= 1; hh--) {
          for (let r = r0; r < r0 + hh; r++) for (let c = c0; c < c0 + w; c++) grid[r][c] = 1;
          solve(count + 1);
          for (let r = r0; r < r0 + hh; r++) for (let c = c0; c < c0 + w; c++) grid[r][c] = 0;
        }
      }
    };
    solve(0);
  }
  return best;
}
