// Pure models behind the interactive figures of the IMO papers (#olympiad/imo): no DOM, checked by tests/imo-models.test.mjs.
// Each model only applies the rules of the problem and reports what happened; none of them gives the answer.
export const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// ---- IMO 2026 problem 1: the blackboard. A move takes two entries m, n > 1 at different places and writes
// gcd(m, n) and lcm(m, n) / gcd(m, n) in their places.
export function boardMove(board, i, j) {
  if (i === j || !(board[i] > 1) || !(board[j] > 1)) return null;
  const m = board[i], n = board[j], g = gcd(m, n), next = board.slice();
  next[i] = g; next[j] = (m / g) * (n / g);
  return next;
}
export const boardLegalPairs = (board) => {
  const idx = board.map((x, i) => (x > 1 ? i : -1)).filter((i) => i >= 0), out = [];
  idx.forEach((i, a) => idx.slice(a + 1).forEach((j) => out.push([i, j])));
  return out;
};
export const boardFinished = (board) => boardLegalPairs(board).length === 0;
// plays random moves (rng() in [0, 1)) until none is possible, or until `cap` moves; returns the moves and the last board
export function boardRandomPlay(board, rng = Math.random, cap = 100000) {
  const moves = []; let cur = board.slice();
  while (moves.length < cap) {
    const pairs = boardLegalPairs(cur); if (!pairs.length) break;
    const [i, j] = pairs[Math.floor(rng() * pairs.length)];
    cur = boardMove(cur, i, j); moves.push([i, j]);
  }
  return { moves, board: cur, finished: boardFinished(cur) };
}

// ---- IMO 2026 problem 6: a(n+1) is the smallest integer > a(n) sharing a factor with every earlier term.
export function nextShared(terms) {
  let c = terms[terms.length - 1] + 1;
  for (;;) { if (terms.every((t) => gcd(c, t) > 1)) return c; c++; }
}
export function sharedSequence(a1, length) {
  if (!Number.isInteger(a1) || a1 < 2) return [];
  const t = [a1]; while (t.length < length) t.push(nextShared(t)); return t;
}

// ---- IMO 2025 problem 4: a(n+1) is the sum of the three largest proper divisors of a(n).
export function divisors(n) {
  const small = [], large = [];
  for (let d = 1; d * d <= n; d++) if (n % d === 0) { small.push(d); if (d * d !== n) large.push(n / d); }
  return small.concat(large.reverse());
}
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

// ---- IMO 2025 problem 1: lines a*x + b*y = c through lattice points; a line is "sunny" when it is parallel to
// neither axis nor to x + y = 0.
export function lineThrough(p, q) {
  if (p[0] === q[0] && p[1] === q[1]) return null;
  let a = q[1] - p[1], b = p[0] - q[0]; const g = gcd(Math.abs(a), Math.abs(b));
  a /= g; b /= g; if (a < 0 || (a === 0 && b < 0)) { a = -a; b = -b; }
  return { a, b, c: a * p[0] + b * p[1] };
}
export const sameLine = (l, m) => l.a === m.a && l.b === m.b && l.c === m.c;
export const isSunny = (l) => l.a !== 0 && l.b !== 0 && l.a !== l.b;
export const requiredPoints = (n) => { const out = []; for (let a = 1; a <= n; a++) for (let b = 1; a + b <= n + 1; b++) out.push([a, b]); return out; };
export function linesReport(n, lines) {
  const uncovered = requiredPoints(n).filter(([x, y]) => !lines.some((l) => l.a * x + l.b * y === l.c));
  const sunny = lines.filter(isSunny).length;
  return { count: lines.length, sunny, uncovered, ok: lines.length === n && uncovered.length === 0 };
}

// ---- IMO 2025 problem 6: rectangular tiles on an n x n grid, cells (row, column) from 0, tile {r0, c0, r1, c1} inclusive.
export const tilesOverlap = (s, t) => s.r0 <= t.r1 && t.r0 <= s.r1 && s.c0 <= t.c1 && t.c0 <= s.c1;
export const canAddTile = (n, tiles, t) => t.r0 >= 0 && t.c0 >= 0 && t.r1 < n && t.c1 < n && t.r0 <= t.r1 && t.c0 <= t.c1 && !tiles.some((s) => tilesOverlap(s, t));
export function tilesReport(n, tiles) {
  const covered = Array.from({ length: n }, () => Array(n).fill(false));
  tiles.forEach((t) => { for (let r = t.r0; r <= t.r1; r++) for (let c = t.c0; c <= t.c1; c++) covered[r][c] = true; });
  const rowFree = Array(n).fill(0), colFree = Array(n).fill(0), free = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!covered[r][c]) { rowFree[r]++; colFree[c]++; free.push([r, c]); }
  const ok = rowFree.every((x) => x === 1) && colFree.every((x) => x === 1);
  return { count: tiles.length, free, rowFree, colFree, ok };
}
